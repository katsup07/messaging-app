/* eslint-disable @typescript-eslint/no-explicit-any */
export default class ApiService {
  private baseMessageUrl: string;
  private baseAuthUrl: string;

  constructor() {
    this.baseMessageUrl = 'http://localhost:5000/api/messages';
    this.baseAuthUrl = 'http://localhost:5000/api/auth';
  }

  async getMessages(): Promise<any> {
    try {
      console.log('Fetching messages');
      const response = await fetch(this.baseMessageUrl);
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

  async findUser( user: { username: string; email: string, password: string }): Promise<any> {
    try {
      const response = await fetch(this.baseAuthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      console.log(response);
      if (!response.ok)
        throw new Error('Failed to get user');
  
      return response.json();
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }
}