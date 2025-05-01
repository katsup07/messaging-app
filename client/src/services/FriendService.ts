/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "../atoms/userAtom";
import { handleApiError } from "./ErrorService";
import { HttpService } from "./HttpService";
import { _baseFriendRequestUrl, _baseFriendsUrl } from "./urls";

export class FriendService {
  selectedFriend: User | null = null;
  private user: User;
  private httpService: HttpService;
  

  constructor(user: User, httpService: HttpService) {
    this.user = user;
    this.httpService = httpService;
  }

  async getFriends(userId: string | number): Promise<any> {
      const response = await this.httpService.authorizedRequest(`${_baseFriendsUrl}/${userId}`);
      await handleApiError(response);
      return response.json();
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
    return response.json();
  }
}