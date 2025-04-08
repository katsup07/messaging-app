import { User } from "../atoms/userAtom";
import { TokenResult } from "../types/token";
import { handleApiError } from "./ErrorService";

// TODO: Refactor this class into HTTPClient, AuthService, and MessageService classes
/* eslint-disable @typescript-eslint/no-explicit-any */
export default class ApiService {
  private readonly _apiBaseUrl: string;
  private readonly _baseFriendsUrl: string;
  private readonly _baseMessageUrl: string;
  private readonly _baseAuthUrl: string;
  private readonly _baseFriendRequestUrl: string;
  private user: User;
  private selectedFriend: User | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<{ newAccessToken: string; newRefreshToken: string } | null> | null = null;

  // Queue of callbacks to call after token refresh
  private refreshSubscribers: Array<(token: string) => void> = [];

  private static instance: ApiService | null = null;

  private constructor(user?: User) {
    const anonymousUser = { _id: 0, username: 'anon-user', email: 'anon-user@email.com' };
    this.user = user || anonymousUser;
    
    const envApiUrl = typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_API_BASE_URL : undefined;
    this._apiBaseUrl = envApiUrl || 'http://localhost:5000/api';
    
    // Force logging the URL to debug in production
    console.log('API Base URL:', this._apiBaseUrl);
    
    // Initialize API endpoints
    this._baseFriendsUrl = `${this._apiBaseUrl}/friends`;
    this._baseMessageUrl = `${this._apiBaseUrl}/messages`;
    this._baseAuthUrl = `${this._apiBaseUrl}/auth`;
    this._baseFriendRequestUrl = `${this._apiBaseUrl}/friend-requests`;
    
    // Initialize tokens from localStorage
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  static getInstance(user?: User): ApiService {
    if (!ApiService.instance) { // Create a new instance if it doesn't exist
      ApiService.instance = new ApiService(user);
    } else if (user) {
      // Update the user in the existing instance if provided
      ApiService.instance.user = user;
    }
    // Otherwise, return the existing instance
    return ApiService.instance;
  }

  static resetInstance(): void {
    ApiService.instance = null;
  }

  get baseMessageUrl(): string {
    return this._baseMessageUrl;
  }

  get baseFriendRequestUrl(): string {
    return this._baseFriendRequestUrl;
  }

  setSelectedFriend(friend: User | null) {
    this.selectedFriend = friend;
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

  setUser(user: User) {
    this.user = user;
  }

  // Subscribe to token refresh
  private onRefreshed(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  // Notify all subscribers about new token
  private notifySubscribers(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private async authorizedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken)
      throw new Error('No access token available');
    

    // Attempt the request with current token
    const response = await this.performRequest(url, options);
    
    // If successful, return the response
    if (response.ok) return response;
    
    
    // Check if it's an auth error that needs token refresh
    if (response.status === 401) {
      const errorData = await response.json();
      
      // Handle expired token
      if (errorData.error === 'TokenExpired') {
        // Get a new token and retry the request
        const newToken = await this.handleTokenRefresh();
        if (newToken) {
          // Retry with the new token
          return this.performRequest(url, options);
        }
      }
    }
    
    // If we get here, either the token refresh failed or it was another error
    return handleApiError(response);
  }

  private async performRequest(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken)
      throw new Error('No access token available');
    

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
      ...options.headers
    };

    return fetch(url, { ...options, headers });
  }

  private async handleTokenRefresh(): Promise<string | null> {
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
      this.refreshPromise = this.onRefreshToken();
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

  async onRefreshToken(): Promise<{ newAccessToken: string; newRefreshToken: string } | null> {
    if (!this.refreshToken)
      throw new Error('No refresh token available');

    // Use fetch directly since we don't want to trigger another refresh
    const response = await fetch(`${this._baseAuthUrl}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    if (!response.ok)
      return null;

    return response.json();
  }

  async getMessages(): Promise<any> {
    if (!this.selectedFriend)
      return [];
    
    
    const response = await this.authorizedRequest(`${this.baseMessageUrl}/${this.user._id}?friendId=${this.selectedFriend._id}`);
    await handleApiError(response);
    return response.json();
  }

  async sendMessage(message: { sender: string; content: string }): Promise<any> {
    const response = await this.authorizedRequest(this.baseMessageUrl, {
      method: 'POST',
      body: JSON.stringify(message),
    });
    await handleApiError(response);
    return response.json();
  }

  async auth(credentials: { email: string; password: string, isSignup: boolean }): Promise<any> {
    try {
      const authUrl = this._baseAuthUrl + (credentials.isSignup ? '/signup' : '/login');
      
      // Log request information for debugging
      console.log(`Making auth request to: ${authUrl}`);
      console.log(`Browser navigator.onLine: ${navigator.onLine}`);
      
      // Create a clean credentials object without isSignup flag
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isSignup, ...cleanCredentials } = credentials;
      
      // Implement timeout for fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        // Use a no-CORS approach as a last resort
        const response = await fetch(`${authUrl}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(cleanCredentials),
          // Set mode to 'no-cors' if we continue to have CORS issues
          // Note: This will make the response opaque but might help with connection issues
          mode: 'cors',
          credentials: 'omit', // Try without credentials first
          signal: controller.signal,
          cache: 'no-cache',
        });
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        // Log response status and headers
        console.log(`Auth response status: ${response.status}`);
        
        if (!response.ok) {
          // Try to get error information from response
          try {
            const errorData = await response.json();
            console.error('Auth error response:', errorData);
          } catch (e) {
            console.error('Auth error but could not parse response:', response.statusText);
          }
          return null;
        }

        const data = await response.json();
        if (data.error) {
          console.error('Auth error in response data:', data.error);
          return null;
        }

        return data;
      } catch (fetchError:any) {
        clearTimeout(timeoutId);
        
        // More detailed logging for fetch errors
        if (fetchError.name === 'AbortError') {
          console.error('Auth request timed out after 15 seconds');
        } else {
          console.error('Fetch error details:', {
            message: fetchError.message,
            name: fetchError.name,
            stack: fetchError.stack,
            url: authUrl
          });
        }
        
        // Try a different fetch approach if the first one failed
        console.log('Attempting with different fetch options...');
        try {
          const altResponse = await fetch(`${authUrl}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cleanCredentials),
            mode: 'no-cors', // Last resort
            cache: 'no-cache',
          });
          
          console.log('Alternative fetch succeeded with status:', altResponse.status);
          // Note: With 'no-cors', we can't access response data normally
          return { success: true, message: "Login request sent. Check server logs." };
        } catch (altError) {
          console.error('Alternative fetch also failed:', altError);
          throw fetchError; // Throw the original error
        }
      }
    } catch (error) {
      // Log any fetch errors (network issues, etc.)
      console.error('Auth request failed with error:', error);
      return null;
    }
  }
  
  

  async verifyToken(accessToken: string): Promise<TokenResult> {
    // No authorized request because verifyToken is called before token is set
    const response = await fetch(`${this._baseAuthUrl}/verify-token`, {
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

  async getFriends(): Promise<any> {
    const response = await this.authorizedRequest(`${this._baseFriendsUrl}/${this.user._id}`);
    await handleApiError(response);
    return response.json();
  }

  async getUsers(): Promise<any> {
    const response = await this.authorizedRequest(`${this._baseAuthUrl}/users`);
    await handleApiError(response);
    return response.json();
  }

  async getUserById(userId: number | string): Promise<any> {
    const response = await this.authorizedRequest(`${this._baseAuthUrl}/users/${userId}`);
    await handleApiError(response);
    return response.json();
  }

  async logout(): Promise<void> {
    const response = await this.authorizedRequest(`${this._baseAuthUrl}/logout/${this.user._id}`, {
      method: 'POST',
      body: JSON.stringify({
        userId: this.user._id,
      }),
    });
    
    await handleApiError(response);
  }

  async getPendingFriendRequests(): Promise<any> {
    const response = await this.authorizedRequest(`${this._baseFriendRequestUrl}/pending/${this.user._id}`);
    await handleApiError(response);
    return response.json();
  }

  async sendFriendRequest(toUserId: number | string): Promise<any> {
    const response = await this.authorizedRequest(`${this._baseFriendRequestUrl}`, {
      method: 'POST',
      body: JSON.stringify({
        fromUserId: this.user._id,
        toUserId
      }),
    });
    
    await handleApiError(response);
    return response.json();
  }

  async respondToFriendRequest(requestId: string | number, accept: boolean): Promise<any> {
    const response = await this.authorizedRequest(`${this._baseFriendRequestUrl}/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ accept }),
    });
    
    await handleApiError(response);
    return response.json();
  }
}