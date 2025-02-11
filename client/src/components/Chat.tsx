import { useEffect, useState, useMemo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import ApiService from '../services/ApiService';
import Message from './Message';
import React from 'react';
import { Friend } from './FriendsList';

interface Message {
  senderId: number;
  sender: string;
  content: string;
  receiverId: number;
  time: string;
  isRead?: boolean;
}

interface Props {
  selectedFriend: Friend | null;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000;

const Chat: React.FC<Props> = ({ selectedFriend }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const retryCount = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const errorTimeoutRef = useRef<NodeJS.Timeout>();
  const user = useAtomValue(userAtom);

  const apiService = useMemo(() => new ApiService(user), [user]);

  const scrollToBottom = () => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isScrolledToBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      setShouldAutoScroll(isScrolledToBottom);
    }
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset scroll state and scroll to bottom when switching friends
  useEffect(() => {
    setShouldAutoScroll(true);
    // Use a small delay to ensure the messages are rendered before scrolling
    setTimeout(scrollToBottom, 100);
  }, [selectedFriend]);

  // Set up SSE connection when friend is selected
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectToSSE = () => {
      if (!selectedFriend || !user) return;
      if (retryCount.current >= MAX_RETRY_ATTEMPTS) {
        setError('Maximum reconnection attempts reached. Please refresh the page.');
        setConnectionStatus('disconnected');
        return;
      }

      setConnectionStatus('connecting');
      setIsLoading(true);
      
      // Clear any existing error timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = undefined;
      }
      setError(null);

      // Create EventSource connection
      const url = `${apiService.baseMessageUrl}/stream/${user.id}/${selectedFriend.id}`;
      eventSource = new EventSource(url);

      // Handle connection open
      eventSource.onopen = () => {
        setConnectionStatus('connected');
        retryCount.current = 0;
      };

      // Handle incoming messages
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages(data);
        setIsLoading(false);
      };

      // Handle connection error
      eventSource.onerror = () => {
        setConnectionStatus('disconnected');
        eventSource?.close();
        retryCount.current += 1;
        
        // Only show error message if we've failed multiple times or reached max retries
        if (retryCount.current >= MAX_RETRY_ATTEMPTS) {
          setError('Maximum reconnection attempts reached. Please refresh the page.');
        } else if (retryCount.current > 1) {
          // Set error after a delay to prevent flashing during quick reconnects
          errorTimeoutRef.current = setTimeout(() => {
            setError('Connection lost. Reconnecting...');
          }, 2000);
        }
        
        if (retryCount.current < MAX_RETRY_ATTEMPTS) {
          setTimeout(connectToSSE, RETRY_DELAY);
        }
      };
    };

    if (selectedFriend) {
      apiService.setSelectedFriend(selectedFriend);
      connectToSSE();
    } else {
      setMessages([]);
      setError(null);
      setConnectionStatus('disconnected');
    }

    // Cleanup: close SSE connection when component unmounts or friend changes
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [apiService, selectedFriend, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend || !user) return;

    const currentConnectionStatus = connectionStatus;
    try {
      const messageData = { 
        senderId: user.id,
        time: new Date().toISOString(),
        sender: user.username, 
        content: newMessage, 
        receiver: selectedFriend, 
        receiverId: selectedFriend.id,
        isRead: false,
      };

      await apiService.sendMessage(messageData);
      setNewMessage('');
      setShouldAutoScroll(true);  // Enable auto-scroll when sending a new message
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', error);
      // Only update connection status if there's an actual connection error
      if (error instanceof Error && error.message.includes('connection')) {
        setConnectionStatus('disconnected');
      } else {
        setConnectionStatus(currentConnectionStatus);
      }
    }
  };

  const isFriendSenderOrReceiver = (message: Message) => {
    const isFriendSender = message.senderId === selectedFriend?.id;
    const isFriendReceiver = message.receiverId === selectedFriend?.id;
    return isFriendSender || isFriendReceiver;
  }

  return (
    <div className="chat-container">
      <div 
        className="messages-container" 
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="loading-spinner">
            Loading messages...
          </div>
        ) : (
          messages.length === 0 ? (
            <div className="no-messages">
              <em>No message history exists.</em>
            </div>
          ) : (
            <>
              {messages.filter(isFriendSenderOrReceiver).map((message) => (
                <Message 
                  key={`${message.senderId}-${message.time}`} 
                  sender={message.sender} 
                  content={message.content}
                  time={message.time}
                  isRead={message.isRead}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )
        )}
      </div>
      <div className="message-input-container">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
          className="message-input"
          disabled={isLoading || connectionStatus === 'disconnected'}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          rows={1}
        />
        <button 
          onClick={handleSendMessage} 
          className="send-button"
          disabled={isLoading || !newMessage.trim() || connectionStatus === 'disconnected'}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;