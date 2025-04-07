import { User } from "../atoms/userAtom";
import { TokenResult } from "../types/token";

// TODO: Refactor this class into HTTPClient, AuthService, and MessageService classes
/* eslint-disable @typescript-eslint/no-explicit-any */
export default class ApiService {
  private readonly _baseFriendsUrl = 'http://localhost:5000/api/friends';
  private readonly _baseMessageUrl = 'http://localhost:5000/api/messages';
  private readonly _baseAuthUrl = 'http://localhost:5000/api/auth';
  private readonly _baseFriendRequestUrl = 'http://localhost:5000/api/friend-requests';
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
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  setRefreshToken(token: string | null) {
    this.refreshToken = token;
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
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
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      // Attempt the request with current token
      const response = await this.performRequest(url, options);
      
      // If successful, return the response
      if (response.ok) {
        return response;
      }
      
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
      return response;
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  }

  private async performRequest(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
      ...options.headers
    };

    return fetch(url, { ...options, headers });
  }

  private async handleTokenRefresh(): Promise<string | null> {
    // If already refreshing, wait for that to complete
    if (this.isRefreshing) {
      return new Promise<string | null>((resolve) => {
        this.onRefreshed(token => {
          resolve(token);
        });
      });
    }

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
    console.log('Refreshing token in ApiService...');
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      // Use fetch directly since we don't want to trigger another refresh
      const response = await fetch(`${this._baseAuthUrl}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const result = await response.json();
      console.log('Token refresh result:', result);
      return result;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  async getMessages(): Promise<any> {
    if (!this.selectedFriend) {
      return [];
    }
    try {
      const response = await this.authorizedRequest(`${this.baseMessageUrl}/${this.user._id}?friendId=${this.selectedFriend._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async sendMessage(message: { sender: string; content: string }): Promise<any> {
    try {
      const response = await this.authorizedRequest(this.baseMessageUrl, {
        method: 'POST',
        body: JSON.stringify(message),
      });
      if (!response.ok)
        throw new Error('Failed to send message');
      
      return response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async auth(credentials: { email: string; password: string, isSignup: boolean }) {
    const authUrl = this._baseAuthUrl + (credentials.isSignup ? '/signup' : '/login');
    try {
      const response = await fetch(`${authUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok)
        return null;

      const data = await response.json();
      if (data.error)
        return null;

      return data;
    } catch (error) {
      console.error('Error during login:', error);
      return null;
    }
  }

  async verifyToken(accessToken: string): Promise<TokenResult> {
    try {
      // No authorized request because verifyToken is called before token is set
      const response = await fetch(`${this._baseAuthUrl}/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok){
        const data = await response.json();
        console.log('response data in verifyToken:', data);
        return { isValid: false, error: new Error(data.error || 'Token verification failed') };
      }

      const result = await response.json();
        
      return result;
    } catch (error: any) {
      console.error('Error verifying token:', error);
      return { isValid: false, error: { message: error.message} };
    }
  }

  async getFriends(): Promise<any> {
    try {
      const response = await this.authorizedRequest(`${this._baseFriendsUrl}/${this.user._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  }

  async getUsers(): Promise<any> {
    try {
      const response = await this.authorizedRequest(`${this._baseAuthUrl}/users`);
      if (!response.ok)
        throw new Error('Failed to fetch users');

      const users = await response.json();

      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(userId: number | string): Promise<any> {
    try {
      const response = await this.authorizedRequest(`${this._baseAuthUrl}/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await this.authorizedRequest(`${this._baseAuthUrl}/logout/${this.user._id}`, {
        method: 'POST',
        body: JSON.stringify({
          userId: this.user._id,
        }),
      });

      if (!response.ok)
        throw new Error('Failed to logout');

    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  async getPendingFriendRequests(): Promise<any> {
    try {
      const response = await this.authorizedRequest(`${this._baseFriendRequestUrl}/pending/${this.user._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pending friend requests');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching pending friend requests:', error);
      throw error;
    }
  }

  async sendFriendRequest(toUserId: number | string): Promise<any> {
    try {
      const response = await this.authorizedRequest(`${this._baseFriendRequestUrl}`, {
        method: 'POST',
        body: JSON.stringify({
          fromUserId: this.user._id,
          toUserId
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send friend request');
      }
      return response.json();
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  async respondToFriendRequest(requestId: string | number, accept: boolean): Promise<any> {
    try {
      const response = await this.authorizedRequest(`${this._baseFriendRequestUrl}/${requestId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ accept }),
      });
      if (!response.ok) {
        throw new Error('Failed to respond to friend request');
      }
      return response.json();
    } catch (error) {
      console.error('Error responding to friend request:', error);
      throw error;
    }
  }
}