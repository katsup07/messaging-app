import { User } from "../atoms/userAtom";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class ApiService {
  private readonly _baseFriendsUrl = 'http://localhost:5000/api/friends';
  private readonly _baseMessageUrl = 'http://localhost:5000/api/messages';
  private readonly _baseAuthUrl = 'http://localhost:5000/api/auth';
  private readonly _baseFriendRequestUrl = 'http://localhost:5000/api/friend-requests';
  private user: User;
  private selectedFriend: User | null = null;

  constructor(user?: User) {
    const anonymousUser = { _id: 0, username: 'anon-user', email: 'anon-user@email.com' };

    this.user = user || anonymousUser;
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

  async getMessages(): Promise<any> {
    if (!this.selectedFriend) {
      return [];
    }
    try {
      const response = await fetch(`${this.baseMessageUrl}/${this.user._id}?friendId=${this.selectedFriend._id}`);
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
      const response = await fetch(this.baseMessageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
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

  async verifyToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this._baseAuthUrl}/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok)
        throw new Error('Failed to verify token');
      
      const data = await response.json();
      return data.isValid;
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  }

  async getFriends(): Promise<any> {
    try {
      const response = await fetch(`${this._baseFriendsUrl}/${this.user._id}`);
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
      const response = await fetch(`${this._baseAuthUrl}/users`);
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
      const response = await fetch(`${this._baseAuthUrl}/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async logout(accessToken?: string | null, refreshToken?: string | null): Promise<void> {
    try {
      if (!accessToken || !refreshToken) 
        throw new Error('Access token or refresh token is missing');

      console.log('Logging out user in APIService:', this.user._id, this.user.username);
      console.log('Access token:', accessToken);  
      console.log('Refresh token:', refreshToken);
      
      const response = await fetch(`${this._baseAuthUrl}/logout/${this.user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.user._id,
          accessToken,
          refreshToken,
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
      const response = await fetch(`${this._baseFriendRequestUrl}/pending/${this.user._id}`);
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
      const response = await fetch(`${this._baseFriendRequestUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${this._baseFriendRequestUrl}/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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