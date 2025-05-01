import { TokenResult } from "../types/token";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class AuthService {
  public accessToken: string | null = null;
  public refreshToken: string | null = null;
  public isRefreshing = false;
  public refreshPromise: Promise<{ newAccessToken: string; newRefreshToken: string } | null> | null = null;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  setAccessToken(token: string | null) {
      this.accessToken = token;
      if (token) 
        localStorage.setItem('accessToken', token);
      else
        localStorage.removeItem('accessToken');
      
    }
  
    setRefreshToken(token: string | null) {
      this.refreshToken = token;
      if (token)
        localStorage.setItem('refreshToken', token);
      else
        localStorage.removeItem('refreshToken');
    }

    onRefreshed(callback: (token: string) => void) {
      this.refreshSubscribers.push(callback);
    }

     // Notify all subscribers about new token
  notifySubscribers(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  async onRefreshToken(baseAuthUrl: string): Promise<{ newAccessToken: string; newRefreshToken: string } | null> {
      if (!this.refreshToken)
        throw new Error('No refresh token available');
  
      // Use fetch directly since we don't want to trigger another refresh
      const response = await fetch(`${baseAuthUrl}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: this.refreshToken})
      });
  
      if (!response.ok)
        return null;
  
      return response.json();
    }

    async auth(credentials: { email: string; password: string, isSignup: boolean }, baseAuthUrl: string): Promise<any> {
      const authUrl = baseAuthUrl + (credentials.isSignup ? '/signup' : '/login');
      
      const response = await fetch(`${authUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
  
      if (!response.ok) return null;
  
      const data = await response.json();
      if (data.error) return null;
  
      return data;
    }

     async verifyToken(accessToken: string, baseAuthUrl: string): Promise<TokenResult> {
        // No authorized request because verifyToken is called before token is set
        const response = await fetch(`${baseAuthUrl}/verify-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });
    
        if (!response.ok) {
          const data = await response.json();
          return { isValid: false, error: new Error(data.error || 'Token verification failed') };
        }
    
        const result = await response.json();
        return result;
      }

     async handleTokenRefresh(baseAuthUrl: string): Promise<string | null> {
        // If already refreshing, wait for that to complete
        if (this.isRefreshing) 
          return new Promise<string | null>((resolve) => {
            this.onRefreshed(token => {
              resolve(token);
            });
          });
        
    
        this.isRefreshing = true;
        try {
          // Start the refresh process
          this.refreshPromise = this.onRefreshToken(baseAuthUrl);
          const tokens = await this.refreshPromise;
          
          if (tokens) {
            // Update tokens
            this.setAccessToken(tokens.newAccessToken);
            this.setRefreshToken(tokens.newRefreshToken);
            
            // Notify waiting requests
            this.notifySubscribers(tokens.newAccessToken);
            return tokens.newAccessToken;
          }
          
          // If refresh failed, clear tokens and return null
          this.setAccessToken(null);
          this.setRefreshToken(null);
          return null;
        } finally {
          this.isRefreshing = false;
          this.refreshPromise = null;
        }
      }

      // TODO: Add logout?


  }