/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "../atoms/userAtom";
import { handleApiError } from "./ErrorService";
import { HttpService } from "./HttpService";
import { _baseMessageUrl } from "./urls";

export class MessageService {
  private selectedFriend: User | null = null;

  constructor(private user: User, private httpService: HttpService) {
  }

  setSelectedFriend(friend: User | null) {
    this.selectedFriend = friend;
  }

  async getMessages(): Promise<any> {
      if (!this.selectedFriend)
        return [];
      
      const response = await this.httpService.authorizedRequest(`${_baseMessageUrl}/${this.user._id}?friendId=${this.selectedFriend._id}`);
      await handleApiError(response);
      return response.json();
    }

    async sendMessage(message: { sender: string; content: string }): Promise<any> {
      const response = await this.httpService.authorizedRequest(_baseMessageUrl, {
        method: 'POST',
        body: JSON.stringify(message),
      });
      await handleApiError(response);
      return response.json();
    }
}