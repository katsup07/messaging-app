import { useState, useEffect, useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { User, userAtom } from '../atoms/userAtom';
import ApiService from '../services/ApiService';

const verifyTokenOnServer = async (token: string): Promise<boolean> => {
  const apiService = new ApiService();
  return await apiService.verifyToken(token);
}

export default function useAuth() {
  const setUser = useSetAtom(userAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(undefined);
    setIsAuthenticated(false);
  },[setUser]);

  const checkAuth = useCallback( async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Not logged in
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }
      
      // Get user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser) as User;
        setUser(userData);
        setIsAuthenticated(true);
      }
      
      const isValid = await verifyTokenOnServer(token);
      console.log('Token verification result:', isValid);
      
      if (!isValid) 
        logout();

    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(undefined);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [setUser, logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isLoading, isAuthenticated, logout };
}