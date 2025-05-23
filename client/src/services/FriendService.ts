/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "../atoms/userAtom";
import { handleApiError } from "./ErrorService";
import { HttpService } from "./HttpService";
import { _baseFriendRequestUrl, _baseFriendsUrl } from "./urls";

export class FriendService {
  private friendsCache: any[] | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds - TTL = Time To Live
  private refreshTimer: NodeJS.Timeout | null = null;
  
  constructor(private user: User, private httpService: HttpService) {
    // Start the periodic refresh when the service is instantiated
    this.startPeriodicRefresh();
  }
  
  private startPeriodicRefresh(): void {
    // Clear any existing timer to prevent duplicates
    if (this.refreshTimer)
      clearInterval(this.refreshTimer);
    
    // Set up periodic refresh every 5 minutes
    this.refreshTimer = setInterval(() => {
      if (this.user._id !== 0)// Don't refresh for anonymous users
        this.refreshFriendsCache();

    }, this.CACHE_TTL);
  }

  async refreshFriendsCache(): Promise<void> {
    try {
      const response = await this.httpService.authorizedRequest(`${_baseFriendsUrl}/${this.user._id}`);
      await handleApiError(response);
      this.friendsCache = await response.json();
      this.lastFetchTime = Date.now();
      console.log('Friends cache refreshed');
    } catch (error) {
      console.error('Failed to refresh friends cache:', error);
      // Keep the old cache if refresh fails
    }
  }
  
  // Method to manually invalidate the cache, call this when friends data changes
  public invalidateCache(): void {
    this.friendsCache = null;
  }

  async getFriends(userId: string | number): Promise<any> {
      // Check if the request is for the current user and we have a valid cache
      if (userId === this.user._id && 
          this.friendsCache && 
          (Date.now() - this.lastFetchTime < this.CACHE_TTL)) {
        console.log('Returning friends from cache');
        return this.friendsCache;
      }
      
      // Cache miss or different user, fetch from API
      const response = await this.httpService.authorizedRequest(`${_baseFriendsUrl}/${userId}`);
      await handleApiError(response);
      const friends = await response.json();
      
      // Update cache if this is for the current user
      if (userId === this.user._id) {
        this.friendsCache = friends;
        this.lastFetchTime = Date.now();
      }
      
      return friends;
    }

  async getPendingFriendRequests(): Promise<any> {
      const response = await this.httpService.authorizedRequest(`${_baseFriendRequestUrl}/pending/${this.user._id}`);
      await handleApiError(response);
      return response.json();
    }

  async sendFriendRequest(toUserId: number | string): Promise<any> {
    const response = await this.httpService.authorizedRequest(`${_baseFriendRequestUrl}`, {
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
    const response = await this.httpService.authorizedRequest(`${_baseFriendRequestUrl}/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ accept }),
    });
    
    await handleApiError(response);
    const result = await response.json();
    
    if (accept)
      this.invalidateCache();
    
    return result;
  }

}