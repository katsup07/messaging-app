/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "../atoms/userAtom";
import { handleApiError } from "./ErrorService";
import { HttpService } from "./HttpService";
import { _baseAuthUrl } from "./urls";

export class UserService {

  constructor(private httpService: HttpService) {}

 async getUsers(): Promise<any> {
     const response = await this.httpService.authorizedRequest(`${_baseAuthUrl}/users`);
     await handleApiError(response);
     return response.json();
   }

  
 async updateUserDetails(userId: string, userData: { username: string, email: string }): Promise<User> {
    if (!this.httpService) 
      throw new Error('HttpService not initialized');
    
    const response = await this.httpService.authorizedRequest(`${_baseAuthUrl}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    await handleApiError(response);
    const updatedUser = await response.json();

    return updatedUser;
  }

  async updateUsername(userId: string, username: string): Promise<User> {
    if (!this.httpService) {
      throw new Error('HttpService not initialized');
    }
    const response = await this.httpService.authorizedRequest(`${_baseAuthUrl}/update-username/${userId}`, { 
      method: 'PUT',
      body: JSON.stringify({ username }),
    });
    await handleApiError(response);
    const updatedUser = await response.json();

    return updatedUser;
  }
  
}

  