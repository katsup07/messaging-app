import { useState, useEffect, useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { User, userAtom } from '../atoms/userAtom';
import ApiService from '../services/ApiService';

const verifyTokenOnServer = async (token: string): Promise<boolean> => {
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
    // Reset the singleton after logout
    ApiService.resetInstance();

    // client-side logout
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(undefined);
    setIsAuthenticated(false);
  }, [setUser]);

  const checkAuth = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }
      
      // Get user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser) as User;
        setUser(userData);
        
        // Set the token in the ApiService for future authenticated requests
        const apiService = ApiService.getInstance(userData);
        apiService.setAccessToken(accessToken);
        
        setIsAuthenticated(true);
      }
      
      const isValid = await verifyTokenOnServer(accessToken);
      
      if (!isValid) 
        logout();

    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(undefined);
      setIsAuthenticated(false);
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