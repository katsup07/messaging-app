// In helpers/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { User } from '../../atoms/userAtom';
import { Friend } from '../../types/friend';
import ServiceFacade from '../../services/ServiceFacade';
import { Message } from '../../types/message';

export const useMessages = (
  user: User | undefined,
  selectedFriend: Friend | null,
  serviceFacade: ServiceFacade | null
) => {
  const [hasFriends, setHasFriends] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Separate effect for managing hasFriends
  useEffect(() => {
    if (!serviceFacade) return;
    
    serviceFacade.getFriends().then(friendsData => {
      setHasFriends(friendsData.length > 0);
    });
  }, [serviceFacade]);

  // Main effect for loading messages when friend changes
  useEffect(() => {
    if (!serviceFacade || !selectedFriend || !user) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        serviceFacade.setSelectedFriend(selectedFriend);
        const initialMessages = await serviceFacade.getMessages();
        setMessages(initialMessages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [serviceFacade, selectedFriend, user]);

  // Separate effect for subscribing to message updates
  useEffect(() => {
    if (!serviceFacade || !selectedFriend) return;

    const unsubscribe = serviceFacade
      .getMessagesObservable(selectedFriend._id)
      .subscribe(setMessages);

    return unsubscribe;
  }, [serviceFacade, selectedFriend]);

  const sendMessage = useCallback(async (content: string) => {
    if (!serviceFacade || !selectedFriend || !user || !content.trim()) return;

    const time = new Date().toISOString();
    try {
      const messageData = {
        senderId: user._id,
        sender: user.username,
        content: content.trim(),
        receiver: selectedFriend,
        receiverId: selectedFriend._id,
        time,
        isRead: false,
      };
      // Optimistically update UI
      setMessages((prevMessages) => [...prevMessages, messageData]);
      await serviceFacade.sendMessage(messageData);
    } catch (err) {
      // Rollback optimistic update
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.time !== time || msg.content !== content)
      );
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, [serviceFacade, selectedFriend, user]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    setError,
    hasFriends,
  };
};