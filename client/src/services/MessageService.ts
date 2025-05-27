import { User } from "../atoms/userAtom";
import { CacheManager } from "../lib/CacheManager";
import { Observable } from "../lib/Observable";
import { Message } from "../types/message";
import { handleApiError } from "./ErrorService";
import { HttpService } from "./HttpService";
import { _baseMessageUrl } from "./urls";

const THIRTY_MINUTES= 30 * 60 * 1000; // 30 minutes in milliseconds
export class MessageService {
  private cacheManager = new CacheManager<Map<string, Message[]>, Map<string, number>>
  (
    new Map(), // Initial messages cache
    new Map(), // Last fetch time
    THIRTY_MINUTES, // Cache life length: 30 minutes
    null // Refresh timer
  );
  private selectedFriend: User | null = null;

  // Observable for message updates - keyed by conversation
  private readonly messagesUpdateObservables: Map<string, Observable<Message[]>> = new Map(); // friendId -> Observable, which will set the callback to the setMessages function

  constructor(private httpService: HttpService) {
  }

   // Get or create observable for a specific conversation
  getMessagesUpdateObservable(conversationId: string): Observable<Message[]> {
    if (!this.messagesUpdateObservables.has(conversationId))
      this.messagesUpdateObservables.set(conversationId, new Observable<Message[]>());
    
    return this.messagesUpdateObservables.get(conversationId)!;
  }
  
  // Generate conversation ID from two user IDs (consistent ordering)
  getConversationId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('-');
  }

  setSelectedFriend(friend: User | null) {
    this.selectedFriend = friend;
  }
  async getMessages(userId: string): Promise<Message[]> {
      if (!this.selectedFriend) return [];

      const conversationId = this.getConversationId(userId, this.selectedFriend._id);

       // Check cache first
    if (this.cacheManager.cache.has(conversationId) && 
        this.cacheManager.lastFetchTime.has(conversationId) &&
        (Date.now() - this.cacheManager.lastFetchTime.get(conversationId)! < this.cacheManager.cacheLife)) {
      console.log('Returning messages from cache');
      return this.cacheManager.cache.get(conversationId)!;
    }
      
      // Cache miss, fetch from API
      const response = await this.httpService.authorizedRequest(`${_baseMessageUrl}/${userId}?friendId=${this.selectedFriend._id}`);
      await handleApiError(response);
      const messages = await response.json();

      // Update cache
      this.cacheManager.cache.set(conversationId, messages);
      this.cacheManager.lastFetchTime.set(conversationId, Date.now());
      
      // Notify observers
      this.getMessagesUpdateObservable(conversationId).notify(messages);
      
      return messages;
    }

    async sendMessage(message: Message): Promise<Message> {
      const response = await this.httpService.authorizedRequest(_baseMessageUrl, {
        method: 'POST',
        body: JSON.stringify(message),
      });
      await handleApiError(response);
     const newMessage = await response.json();
    
      return newMessage;
    }

  // Handle incoming socket messages
  updateCacheAndNotifyObservers(message: Message): void {
    const conversationId = this.getConversationId(message.senderId, message.receiverId);
    const cachedMessages = this.cacheManager.cache.get(conversationId) || [];
    const updatedMessages = [...cachedMessages, message];
    
    this.cacheManager.cache.set(conversationId, updatedMessages);
    this.getMessagesUpdateObservable(conversationId).notify(updatedMessages);
  }
  
  // Clear cache for a conversation
  invalidateConversationCache(conversationId: string): void {
    this.cacheManager.cache.delete(conversationId);
    this.cacheManager.lastFetchTime.delete(conversationId);
  }
  
  // Clear all message caches
  invalidateAllCaches(): void {
    this.cacheManager.cache.clear();
    this.cacheManager.lastFetchTime.clear();
  }
}