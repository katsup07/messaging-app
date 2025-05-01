import { useEffect, useState, useRef, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { userAtom } from '../../atoms/userAtom';
import ServiceFacade from '../../services/ServiceFacade';
import React from 'react';
import { Friend } from '../../types/friend';
import useScrollToBottom from '../../helpers/useScrollToBottom';
import { useMessageSocket } from '../../helpers/useMessageSocket';
import { Message } from '../../types/message';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

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

  const serviceFacade = ServiceFacade.getInstance(user);

  useScrollToBottom(messagesContainerRef, [messages, selectedFriend]);

  // Handle new messages with custom socket hook
  const handleNewMessage = useCallback((message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);
  
  useMessageSocket(user?._id, handleNewMessage);

  const hasAFriend = useCallback(async() => {
    const friendsData = await serviceFacade.getFriends();
    setHasFriends(friendsData.length > 0);
  }, [serviceFacade])
  
  const fetchMessages = useCallback(async () => {
    if (!selectedFriend || !user) return;

    try {
      setIsLoading(true);
      const fetchedMessages = await serviceFacade.getMessages();
      setMessages(fetchedMessages);
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [serviceFacade, selectedFriend, user]);

  useEffect(() => {
    if (selectedFriend && user) {
      serviceFacade.setSelectedFriend(selectedFriend);
    
      hasAFriend();
      // Initial fetch
      fetchMessages();
    } else {
      setMessages([]);
      setError(null);
    }
  }, [serviceFacade, selectedFriend, user, fetchMessages, hasAFriend]);

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
      await serviceFacade.sendMessage(messageData);
      
      setNewMessage('');
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
      <MessageList 
        messages={messages}
        isLoading={isLoading}
        error={error}
        messagesContainerRef={messagesContainerRef}
        isFriendSenderOrReceiver={isFriendSenderOrReceiver}
      />
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        hasFriends={hasFriends}
      />
    </div>
  );
};

export default Chat;