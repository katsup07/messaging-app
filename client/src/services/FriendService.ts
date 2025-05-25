import { User } from "../atoms/userAtom";
import { Friend, FriendRequest, FriendRequestResponse, RespondToFriendRequestResponse } from "../types/friend";
import { handleApiError } from "./ErrorService";
import { HttpService } from "./HttpService";
import { Observable } from "../lib/Observable";
import { _baseFriendRequestUrl, _baseFriendsUrl } from "./urls";

export class FriendService {
  private friendsCache: Friend[] | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_LIFE_LENGTH = 5 * 60 * 1000; // 5 minutes in milliseconds
  private refreshTimer: number | null = null;  /*Observable streams for friends and pending requests
    These will be used to notify subscribing components about changes
    The subscribers will notify the UI to re-render when data changes*/
  private readonly friendsObservable = new Observable<Friend[]>();
  private  readonly pendingRequestsObservable = new Observable<FriendRequest[]>();
  
  constructor(private user: User, private httpService: HttpService) {
    // Start the periodic refresh when the service is instantiated
    this.startPeriodicRefresh();
  }
  
  // Observable getters
  getFriendsObservable(): Observable<Friend[]> {
    return this.friendsObservable;
  }
  
  getPendingRequestsObservable(): Observable<FriendRequest[]> {
    return this.pendingRequestsObservable;
  }
  
  async getFriends(userId: string): Promise<Friend[]> {
      // Check if the request is for the current user and we have a valid cache
      if (userId === this.user._id && 
          this.friendsCache && 
          (Date.now() - this.lastFetchTime < this.CACHE_LIFE_LENGTH)) {
        console.log('Returning friends from cache');
        return this.friendsCache;
      }
      
      // Cache miss or different user, fetch from API
      const response = await this.httpService.authorizedRequest(`${_baseFriendsUrl}/${userId}`);
      await handleApiError(response);
      const friends = await response.json();
      
      // Update cache if for the current user
      if (userId === this.user._id) {
        this.friendsCache = friends;
        this.lastFetchTime = Date.now();
      }
      
      return friends;
    }
  async getPendingFriendRequests(): Promise<FriendRequest[]> {
      const response = await this.httpService.authorizedRequest(`${_baseFriendRequestUrl}/pending/${this.user._id}`);
      await handleApiError(response);
      const pendingRequests = await response.json();
      // Notify subscribers
      this.pendingRequestsObservable.notify(pendingRequests);
      
      return pendingRequests;
    }
  async sendFriendRequest(toUserId: string): Promise<FriendRequestResponse> {
    const response = await this.httpService.authorizedRequest(`${_baseFriendRequestUrl}`, {
        method: 'POST',
        body: JSON.stringify({
          fromUserId: this.user._id,
          toUserId
        }),
      });
      
    await handleApiError(response);
    return await response.json();
  }

  async respondToFriendRequest(requestId: string, accept: boolean): Promise<RespondToFriendRequestResponse> {
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

  private startPeriodicRefresh(): void {
    // Clear any existing timer to prevent duplicates
    if (this.refreshTimer)
      clearInterval(this.refreshTimer);
    
    // Set up periodic refresh every 5 minutes
    this.refreshTimer = setInterval(() => {
      if (this.user._id !== "0")// No refresh for anonymous users
        this.refreshFriendsCache();

    }, this.CACHE_LIFE_LENGTH) as unknown as number;
  }  
  
  async refreshFriendsCache(): Promise<void> {
    try {
      const response = await this.httpService.authorizedRequest(`${_baseFriendsUrl}/${this.user._id}`);
      await handleApiError(response);
      this.friendsCache = await response.json();
      this.lastFetchTime = Date.now();
      
      // Notify subscribers about the updated data
      // if (this.friendsCache)
        this.friendsObservable.notify(this.friendsCache!);
      
      console.log('Friends cache refreshed');
    } catch (error) {
      console.error('Failed to refresh friends cache:', error);
      // Keep the old cache if refresh fails
    }
  }
  
  public invalidateCache(): void {
    this.friendsCache = null;
  }


}