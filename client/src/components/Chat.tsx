import { messageSentLiveUpdate, registerForLiveUpdates, socket } from '../helpers/socket-io-client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import ApiService from '../services/ApiService';
import Message from './Message';
import React from 'react';
import { Friend } from './FriendsList';
import useScrollToBottom from '../helpers/useScrollToBottom';

export interface Message {
  senderId: number | string;
  sender: string;
  content: string;
  receiverId: number | string;
  time: string;
  isRead?: boolean;
}

interface Props {
  selectedFriend: Friend | null;
}

const Chat: React.FC<Props> = ({ selectedFriend }) => {
  const [hasFriends, setHasFriends] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const user = useAtomValue(userAtom);

  const apiService = ApiService.getInstance(user);
  
  useScrollToBottom(messagesContainerRef, [messages, selectedFriend]);

  // Socket initialization
  useEffect(() => {
    if (user) registerForLiveUpdates(user._id.toString());

    socket.on('receive-message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data.message]);
    });

    return () => {
      socket.off('receive-message');
    };
  }, [user]);

  const hasAFriend = useCallback(async() => {
    const friendsData = await apiService.getFriends();
    setHasFriends(friendsData.length > 0);
  }, [apiService])

  // Fetch messages function
  const fetchMessages = useCallback(async () => {
    if (!selectedFriend || !user) return;

    try {
      setIsLoading(true);
      const fetchedMessages = await apiService.getMessages();
      setMessages(fetchedMessages);
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [apiService, selectedFriend, user]);

  // Initialization of state
  useEffect(() => {
    if (selectedFriend && user) {
      apiService.setSelectedFriend(selectedFriend);
    
    hasAFriend();

    // Initial fetch
    fetchMessages();
    } else {
      setMessages([]);
      setError(null);
    }
  }, [apiService, selectedFriend, user, fetchMessages, hasAFriend]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend || !user) return;

    try {
      const messageData = {
        senderId: user._id.toString(),
        time: new Date().toISOString(),
        sender: user.username,
        content: newMessage,
        receiver: selectedFriend,
        receiverId: selectedFriend._id,
        isRead: false,
      };

      await apiService.sendMessage(messageData);
      messageSentLiveUpdate(messageData, selectedFriend._id.toString());
      setNewMessage('');

      // Fetch messages immediately after sending
      fetchMessages();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', error);
    }
  };

  const isFriendSenderOrReceiver = (message: Message) => {
    const userToFriend = message.senderId === user?._id && message.receiverId === selectedFriend?._id;
    const friendToUser = message.senderId === selectedFriend?._id && message.receiverId === user?._id;
    
    return userToFriend || friendToUser;
  };

  return (
    <div className="chat-container">
      <div className="messages-container" ref={messagesContainerRef}>
        {error && <div className="error-message">{error}</div>}
        {isLoading && messages.length === 0 ? (
          <div className="loading-spinner">Loading messages...</div>
        ) : messages.length === 0 ? (
            <em>No message history exists.</em>
        ) : (
          <>
            {messages.filter(isFriendSenderOrReceiver).map((message, index) => (
              <Message
                key={`${message.senderId}-${message.time}-${index}`}
                senderId={message.senderId.toString()}
                sender={message.sender}
                content={message.content}
                time={message.time}
                isRead={message.isRead}
              />
            ))}
          </>
        )}
      </div>
      <div className="message-input-container">
         {hasFriends && <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
          className="message-input"
          disabled={isLoading}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          rows={1}
        />}
        {hasFriends && <button
          onClick={handleSendMessage}
          className="send-button"
          disabled={isLoading || !newMessage.trim()}
        >
          Send
        </button>}
      </div>
    </div>
  );
};

export default Chat;