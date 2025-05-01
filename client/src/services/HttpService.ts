import AuthService from "./AuthService";
import { handleApiError } from "./ErrorService";
import { _apiBaseUrl } from "./urls";

export class HttpService {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService; 
  }

 async authorizedRequest(url: string, options: RequestInit = {}): Promise<Response> {
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
          const newToken = await this.authService.handleTokenRefresh(_apiBaseUrl);
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

    // private getBrowserFingerprint(): string {
    //   // Simple fingerprinting based on navigator and screen properties
    //   const fingerprint = {
    //     userAgent: navigator.userAgent,
    //     language: navigator.language,
    //     screenResolution: `${screen.width}x${screen.height}`,
    //     timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    //   };
    //   return btoa(JSON.stringify(fingerprint));
    // }
}