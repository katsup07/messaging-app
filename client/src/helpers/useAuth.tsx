import { useState, useEffect, useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { User, userAtom } from '../atoms/userAtom';
import ApiService from '../services/ApiService';
import { TokenResult } from '../types/token';
import { disconnectSocket, registerForLiveUpdates } from '../socket-io-client';

const verifyTokenOnServer = async (token: string): Promise<TokenResult> => {
  const apiService = ApiService.getInstance();
  return await apiService.verifyToken(token);
}

export default function useAuth() {
  const setUser = useSetAtom(userAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(() => {    
    // server-side logout
    const apiService = ApiService.getInstance();
    apiService.logout();

    disconnectSocket();
    // Reset the singleton after logout
    ApiService.resetInstance();

    // client-side logout
    // Clear tokens and user data from localStorage
    apiService.setAccessToken(null);
    apiService.setRefreshToken(null);
    localStorage.removeItem('user');
    setUser(undefined);
    setIsAuthenticated(false);
  }, [setUser]);

  const checkAuth = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!accessToken) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }
      
      // Get user data
      const storedUser = localStorage.getItem('user');
    
      if (!storedUser) {
        logout();
        return;
      }
      
      const userData = JSON.parse(storedUser) as User;
      setUser(userData);
        
      // Set the tokens in the ApiService for future authenticated requests
      const apiService = ApiService.getInstance(userData);
      apiService.setAccessToken(accessToken);
      apiService.setRefreshToken(refreshToken);
        
      setIsAuthenticated(true);

      const { isValid, error } = await verifyTokenOnServer(accessToken);

      if(!isValid && error?.message === 'jwt expired'){
        const result = await apiService.onRefreshToken();

        if(!result?.newAccessToken || !result?.newRefreshToken) {
          logout();
          return;
        }
       
        // Update both tokens
        apiService.setAccessToken(result.newAccessToken);
        apiService.setRefreshToken(result.newRefreshToken);

        setIsAuthenticated(true);

        registerForLiveUpdates(userData._id.toString());
        return;
      }
      
      if (!isValid) {
        logout();
        return;
      }
      // isValid
      registerForLiveUpdates(userData._id.toString());
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUser]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isLoading, isAuthenticated, logout };
}

