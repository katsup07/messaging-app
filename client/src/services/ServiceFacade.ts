import { User, userAtom } from "../atoms/userAtom";
import { getDefaultStore } from 'jotai';
import { TokenResult } from "../types/token";
import { AuthResponse, AuthCredentials, RefreshTokenResponse } from "../types/auth";
import { Friend, FriendRequest, FriendRequestResponse, RespondToFriendRequestResponse } from "../types/friend";
import AuthService from "./AuthService";
import { FriendService } from "./FriendService";
import { HttpService } from "./HttpService";
import { MessageService } from "./MessageService";
import { Observable } from "../lib/Observable";
import { _baseAuthUrl } from "./urls";
import { UserService } from "./UserService";
import { Message } from "../types/message";

// Singleton facade pattern
export default class ServiceFacade {
  private user: User;
  private authService: AuthService;
  private userService: UserService;
  private httpService: HttpService;
  private friendService: FriendService;
  private messageService: MessageService;
  private static instance: ServiceFacade | null = null;

  private constructor(user: User | null) {
    const anonymousUser = { _id: "0", username: 'anon-user', email: 'anon-user@email.com' };
    this.user = user || anonymousUser;
    this.authService = new AuthService(this.user);
    this.httpService = new HttpService(this.authService);
    this.authService.setHttpService(this.httpService);
    
    this.friendService = new FriendService(this.user, this.httpService);
    this.messageService = new MessageService(this.httpService);
    this.userService = new UserService(this.httpService);
  }  static getInstance(): ServiceFacade {
    // Get the current user from the atom
    const store = getDefaultStore();
    const user = store.get(userAtom);
    
    if (!ServiceFacade.instance) { // Create a new instance if it doesn't exist
      ServiceFacade.instance = new ServiceFacade(user || null);
    } else if (user && user._id !== ServiceFacade.instance.user._id) {
      // Update the user and all services when user changes
      ServiceFacade.instance.updateUser(user);
    }

    return ServiceFacade.instance;
  }
  static resetInstance(): void {
    if (!ServiceFacade.instance) return;
    // Clean up the timer if it exists
    const friendService = ServiceFacade.instance.friendService;
    if (friendService['refreshTimer'])
        clearInterval(friendService['refreshTimer']);
      
    ServiceFacade.instance = null;
  }

  // Message methods
  setSelectedFriend(friend: User | null) {
    this.messageService.setSelectedFriend(friend);
  }
  async getMessages(): Promise<Message[]> {
    return await this.messageService.getMessages(this.user._id);
  }

  async sendMessage(message: Message): Promise<Message> {
   return await this.messageService.sendMessage(message);
  }

   getMessagesUpdateObservable(friendId: string): Observable<Message[]> {
    const conversationId = this.getConversationId(this.user._id, friendId);
    return this.messageService.getMessagesUpdateObservable(conversationId);
  }
  
  getConversationId(userId1: string, userId2: string): string {
    return this.messageService.getConversationId(userId1, userId2);
  }
  
  // Handle socket messages through the service
  handleIncomingSocketMessage(message: Message): void {
    this.messageService.updateCacheAndNotifyObservers(message);
  }

  // Auth methods
  setAccessToken(token: string | null) {
    this.authService.setAccessToken(token);
  }

  setRefreshToken(token: string | null) {
    this.authService.setRefreshToken(token);
  }
  async auth(credentials: AuthCredentials): Promise<AuthResponse | null> {
    return await this.authService.auth(credentials, _baseAuthUrl);
  }

  async onRefreshToken(): Promise<RefreshTokenResponse | null> {
    return await this.authService.onRefreshToken(_baseAuthUrl);
  }

  async verifyToken(accessToken: string): Promise<TokenResult> {
    return await this.authService.verifyToken(accessToken, _baseAuthUrl);
  }
  async logout(): Promise<void> {
    // Invalidate friend cache on logout
    this.friendService.invalidateCache();
    await this.authService.logout();
  }  async getFriends(): Promise<Friend[]> {
    return this.friendService.getFriends(this.user._id);
  }

  getAuthExpiredObservable(): Observable<{ type: 'authExpired' }> {
    return this.authService.getAuthExpiredObservable();
  }

  
  // Friends
  invalidateFriendsCache(): void {
    this.friendService.invalidateCache();
  }
  
  // Observable stream getters
  getFriendsListUpdateObservable(): Observable<Friend[]> {
    return this.friendService.getFriendsListUpdateObservable();
  }
  
  getPendingRequestsObservable(): Observable<FriendRequest[]> {
    return this.friendService.getPendingRequestsObservable();
  }
  // User methods
  setUser(user: User) {
    this.user = user;
  }
  async getUsers(): Promise<User[]> {
    return await this.userService.getUsers();
  }

  async updateUsername(userId: string, username: string): Promise<User> {
    return await this.userService.updateUsername(userId, username);
  }

  async updateUserDetails(userId: string, userData: { username: string, email: string }): Promise<User> {
    return await this.userService.updateUserDetails(userId, userData);
  }

  // Method to update user and recreate services with new user
  private updateUser(newUser: User): void {
    this.user = newUser;
    
    // Recreate FriendService with new user
    this.friendService = new FriendService(this.user, this.httpService);
    // other services currently do not depend on user, 
    this.invalidateFriendsCache();
  }
  
  // Friend methods
  async getPendingFriendRequests(): Promise<FriendRequest[]> {
   return await this.friendService.getPendingFriendRequests();
  }
  async sendFriendRequest(toUserId: string): Promise<FriendRequestResponse> {
    return await this.friendService.sendFriendRequest(toUserId);
  }
  async respondToFriendRequest(requestId: string, accept: boolean): Promise<RespondToFriendRequestResponse> {
   return await this.friendService.respondToFriendRequest(requestId, accept);
  }

  async refreshFriends(): Promise<void> {
    await this.friendService.refreshFriendsCache();
  }
}