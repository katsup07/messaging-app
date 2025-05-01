import { User } from "../atoms/userAtom";
import { TokenResult } from "../types/token";
import AuthService from "./AuthService";
import { handleApiError } from "./ErrorService";

// TODO: Refactor this class into HTTPClient, AuthService, and MessageService classes
/* eslint-disable @typescript-eslint/no-explicit-any */
export default class ApiService {
  private readonly _apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  private readonly _baseFriendsUrl = `${this._apiBaseUrl}/friends`;
  private readonly _baseMessageUrl = `${this._apiBaseUrl}/messages`;
  private readonly _baseAuthUrl = `${this._apiBaseUrl}/auth`;
  private readonly _baseFriendRequestUrl = `${this._apiBaseUrl}/friend-requests`;
  private user: User;
  private selectedFriend: User | null = null;
  private authService;

  private static instance: ApiService | null = null;

  private constructor(user?: User) {
    const anonymousUser = { _id: 0, username: 'anon-user', email: 'anon-user@email.com' };
    this.user = user || anonymousUser;

    this.authService = new AuthService();
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

  setUser(user: User) {
    this.user = user;
  }

  setAccessToken(token: string | null) {
    this.authService.setAccessToken(token);
  }

  setRefreshToken(token: string | null) {
    this.authService.setRefreshToken(token);
  }
  
  private async authorizedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.authService.accessToken)
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
    if (!this.authService.accessToken)
      throw new Error('No access token available');

  // TODO: Add fingerprint to server
  // Browser fingerprint to help prevent token reuse on different devices
  // const fingerprint = this.getBrowserFingerprint();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.accessToken}`,
      // 'X-Fingerprint': fingerprint,
      // 'X-XSS-Protection': '1; mode=block',
      // 'X-Content-Type-Options': 'nosniff',
      ...options.headers
    };

    return fetch(url, { ...options, headers });
  }

  private getBrowserFingerprint(): string {
    // Simple fingerprinting based on navigator and screen properties
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    return btoa(JSON.stringify(fingerprint));
  }

  // private isTokenExpired(token: string): boolean {
  //   try {
  //     const payload = JSON.parse(atob(token.split('.')[1]));
  //     return payload.exp < Date.now() / 1000;
  //   } catch (e) {
  //     return true; // If can't decode the token, assume expired
  //   }
  // }

  private async handleTokenRefresh(): Promise<string | null> {
   return await this.authService.handleTokenRefresh(this._baseAuthUrl);
  }

  async onRefreshToken(): Promise<{ newAccessToken: string; newRefreshToken: string } | null> {
    return await this.authService.onRefreshToken(this._baseAuthUrl);
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
    return await this.authService.auth(credentials, this._baseAuthUrl);
  }

  async updateUsername(userId: string, username: string): Promise<User> {
    const response = await this.authorizedRequest(`${this._baseAuthUrl}/update-username/${userId}`, { 
      method: 'PUT',
      body: JSON.stringify({ username }),
    });
    await handleApiError(response);
    const updatedUser = await response.json();

    return updatedUser;
  }

  async verifyToken(accessToken: string): Promise<TokenResult> {
    return await this.authService.verifyToken(accessToken, this._baseAuthUrl);
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

  async updateUserDetails(userId: string, userData: { username: string, email: string }): Promise<User> {
    const response = await this.authorizedRequest(`${this._baseAuthUrl}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    await handleApiError(response);
    const updatedUser = await response.json();

    return updatedUser;
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