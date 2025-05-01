/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "../atoms/userAtom";
import { TokenResult } from "../types/token";
import AuthService from "./AuthService";
import { FriendService } from "./FriendService";
import { HttpService } from "./HttpService";
import { MessageService } from "./MessageService";
import { _baseAuthUrl, _baseFriendRequestUrl, _baseMessageUrl } from "./urls";

// Singleton facade pattern
export default class ServiceFacade {
  private user: User;
  private authService;
  private httpService: HttpService;
  private friendService: FriendService;
  private messageService: MessageService;
  private static instance: ServiceFacade | null = null;

  private constructor(user?: User) {
    const anonymousUser = { _id: 0, username: 'anon-user', email: 'anon-user@email.com' };
    this.user = user || anonymousUser;

    this.authService = new AuthService(this.user);
    this.httpService = new HttpService(this.authService);
    this.friendService = new FriendService(this.user, this.httpService);
    this.messageService = new MessageService(this.httpService);
  }

  static getInstance(user?: User): ServiceFacade {
    if (!ServiceFacade.instance) { // Create a new instance if it doesn't exist
      ServiceFacade.instance = new ServiceFacade(user);
    } else if (user) {
      // Update the user in the existing instance if provided
      ServiceFacade.instance.user = user;
    }
    // Otherwise, return the existing instance
    return ServiceFacade.instance;
  }

  static resetInstance(): void {
    ServiceFacade.instance = null;
  }

  get baseMessageUrl(): string {
    return _baseMessageUrl;
  }

  get baseFriendRequestUrl(): string {
    return _baseFriendRequestUrl;
  }

  setUser(user: User) {
    this.user = user;
  }

  setSelectedFriend(friend: User | null) {
    this.messageService.setSelectedFriend(friend);
  }

  setAccessToken(token: string | null) {
    this.authService.setAccessToken(token);
  }

  setRefreshToken(token: string | null) {
    this.authService.setRefreshToken(token);
  }

  async onRefreshToken(): Promise<{ newAccessToken: string; newRefreshToken: string } | null> {
    return await this.authService.onRefreshToken(_baseAuthUrl);
  }

  async getMessages(): Promise<any> {
    return await this.messageService.getMessages(this.user._id);
  }

  async sendMessage(message: { sender: string; content: string }): Promise<any> {
   return await this.messageService.sendMessage(message);
  }

  async auth(credentials: { email: string; password: string, isSignup: boolean }): Promise<any> {
    return await this.authService.auth(credentials, _baseAuthUrl);
  }

  async updateUsername(userId: string, username: string): Promise<User> {
    return await this.authService.updateUsername(userId, username);
  }

  async verifyToken(accessToken: string): Promise<TokenResult> {
    return await this.authService.verifyToken(accessToken, _baseAuthUrl);
  }

  async getFriends(): Promise<any> {
    return this.friendService.getFriends(this.user._id);
  }

  async getUsers(): Promise<any> {
    return await this.authService.getUsers();
  }

  async updateUserDetails(userId: string, userData: { username: string, email: string }): Promise<User> {
    return await this.authService.updateUserDetails(userId, userData);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }

  async getPendingFriendRequests(): Promise<any> {
   return await this.friendService.getPendingFriendRequests();
  }

  async sendFriendRequest(toUserId: number | string): Promise<any> {
    return await this.friendService.sendFriendRequest(toUserId);
  }

  async respondToFriendRequest(requestId: string | number, accept: boolean): Promise<any> {
   return await this.friendService.respondToFriendRequest(requestId, accept);
  }
}