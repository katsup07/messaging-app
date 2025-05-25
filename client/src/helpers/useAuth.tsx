import { useState, useEffect, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import ServiceFacade from '../services/ServiceFacade';
import { TokenResult } from '../types/token';
import { disconnectSocket, registerForLiveUpdates } from '../socket-io-client';

const verifyTokenOnServer = async (token: string): Promise<TokenResult> => {
  const serviceFacade = ServiceFacade.getInstance();
  return await serviceFacade.verifyToken(token);
}

export default function useAuth() {
  const setUser = useSetAtom(userAtom);
  const userData = useAtomValue(userAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(() => {    
    // server-side logout
    const serviceFacade = ServiceFacade.getInstance();
    serviceFacade.logout();

    disconnectSocket();
    // Reset the singleton after logout
    ServiceFacade.resetInstance();    // client-side logout
    // Clear tokens and user data
    serviceFacade.setAccessToken(null);
    serviceFacade.setRefreshToken(null);
    setUser(undefined);
    setIsAuthenticated(false);
  }, [setUser]);
  
  const checkAuth = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!accessToken || !userData) {
        setIsLoading(false);
        setIsAuthenticated(false);
        logout();
        return;
      }
        // Get user data
      if (!userData) {
        logout();
        return;
      }
        
      // Set the tokens in the ServiceFacade for future authenticated requests
      const serviceFacade = ServiceFacade.getInstance(userData);
      serviceFacade.setAccessToken(accessToken);
      serviceFacade.setRefreshToken(refreshToken);
        
      setIsAuthenticated(true);

      const { isValid, error } = await verifyTokenOnServer(accessToken);

      if(!isValid && error?.message === 'jwt expired'){
        const result = await serviceFacade.onRefreshToken();

        if(!result?.newAccessToken || !result?.newRefreshToken) {
          logout();
          return;
        }
       
        // Update both tokens
        serviceFacade.setAccessToken(result.newAccessToken);
        serviceFacade.setRefreshToken(result.newRefreshToken);

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

  }, [logout, userData]);

  useEffect(() => {
    checkAuth();

    const unsubscribe = ServiceFacade.getInstance().getAuthExpiredObservable().subscribe(() => logout()); 

    return unsubscribe;
  }, [checkAuth, logout]);

  return { isLoading, isAuthenticated, logout };
}

