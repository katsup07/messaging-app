import { User } from "../atoms/userAtom";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class ApiService {
  private baseFriendsUrl = 'http://localhost:5000/api/friends';
  private baseMessageUrl = 'http://localhost:5000/api/messages';
  private baseAuthUrl = 'http://localhost:5000/api/auth';
  private user: User;

  constructor(user?: User) {
    const anonymousUser = { id: 0, username: 'anon-user', email: 'anon-user@email.com' };

    this.user = user || anonymousUser;
  }

  async getMessages(): Promise<any> {
    try {
      console.log('Fetching messages for user: ', `${this.baseMessageUrl}/${this.user.id}`);
      const response = await fetch(`${this.baseMessageUrl}/${this.user.id}`);
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

  async findUser(credentials: { email: string; password: string }) {
    try {
      const response = await fetch(`${this.baseAuthUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.error) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error during login:', error);
      return null;
    }
  }

  async getFriends(): Promise<any> {
    try {
      console.log("Getting friends for: ", this.user.id);
      const response = await fetch(`${this.baseFriendsUrl}/${this.user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  }
}