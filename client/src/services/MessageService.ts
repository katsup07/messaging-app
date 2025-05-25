import { User } from "../atoms/userAtom";
import { Observable } from "../lib/Observable";
import { Message } from "../types/message";
import { handleApiError } from "./ErrorService";
import { HttpService } from "./HttpService";
import { _baseMessageUrl } from "./urls";

export class MessageService {
  private selectedFriend: User | null = null;
  private messagesCache: Map<string, Message[]> = new Map(); // Key: conversationId, Value: messages
  private lastFetchTimes: Map<string, number> = new Map();
  private readonly CACHE_LIFE_LENGTH = 2 * 60 * 1000; // 2 minutes
  // Observable for message updates - keyed by conversation
  private readonly messageObservables: Map<string, Observable<Message[]>> = new Map(); // friendId -> Observable, which will set the callback to the setMessages function

  constructor(private httpService: HttpService) {
  }

   // Get or create observable for a specific conversation
  getMessagesObservable(conversationId: string): Observable<Message[]> {
    if (!this.messageObservables.has(conversationId))
      this.messageObservables.set(conversationId, new Observable<Message[]>());
    
    return this.messageObservables.get(conversationId)!;
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
    if (this.messagesCache.has(conversationId) && 
        this.lastFetchTimes.has(conversationId) &&
        (Date.now() - this.lastFetchTimes.get(conversationId)! < this.CACHE_LIFE_LENGTH)) {
      console.log('Returning messages from cache');
      return this.messagesCache.get(conversationId)!;
    }
      
      // Cache miss, fetch from API
      const response = await this.httpService.authorizedRequest(`${_baseMessageUrl}/${userId}?friendId=${this.selectedFriend._id}`);
      await handleApiError(response);
      const messages = await response.json();

      // Update cache
      this.messagesCache.set(conversationId, messages);
      this.lastFetchTimes.set(conversationId, Date.now());
      
      // Notify observers
      this.getMessagesObservable(conversationId).notify(messages);
      
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
    const cachedMessages = this.messagesCache.get(conversationId) || [];
    const updatedMessages = [...cachedMessages, message];
    
    this.messagesCache.set(conversationId, updatedMessages);
    this.getMessagesObservable(conversationId).notify(updatedMessages);
  }
  
  // Clear cache for a conversation
  invalidateConversationCache(conversationId: string): void {
    this.messagesCache.delete(conversationId);
    this.lastFetchTimes.delete(conversationId);
  }
  
  // Clear all message caches
  invalidateAllCaches(): void {
    this.messagesCache.clear();
    this.lastFetchTimes.clear();
  }
}