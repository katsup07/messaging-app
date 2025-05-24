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

  const onSetHasFriends = useCallback(async() => {
    const friendsData = await serviceFacade?.getFriends();
    setHasFriends(friendsData.length > 0);
  }, [serviceFacade])

  // Initialize messages when selectedFriend changes
  const initializeMessages = useCallback(() => {
    if (!serviceFacade || !selectedFriend || !user) {
      setMessages([]);
      return;
    }

    onSetHasFriends();
    
    // Initial load
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

    // Subscribe to updates
    const unsubscribe = serviceFacade
      .getMessagesObservable(selectedFriend._id)
      .subscribe(setMessages);

    return () => {
      unsubscribe();
    };
  }, [serviceFacade, selectedFriend, user, onSetHasFriends]);

  useEffect(() => {
    initializeMessages();
  }, [initializeMessages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!serviceFacade || !selectedFriend || !user || !content.trim()) return;

    try {
      const messageData = {
        senderId: user._id,
        sender: user.username,
        content: content.trim(),
        receiver: selectedFriend,
        receiverId: selectedFriend._id,
        time: new Date().toISOString(),
        isRead: false,
      };

      await serviceFacade.sendMessage(messageData);
    } catch (err) {
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