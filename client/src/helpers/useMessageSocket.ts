import { useEffect } from 'react';
import { connectSocket, socketCleanup, socketSetup } from '../socket-io-client';
import { Message } from '../types/message';

/**
 * Custom hook for managing socket connections related to messages
 * 
 * @param userId - The current user's ID
 * @param onMessageReceive - Callback function when a new message is received
 */
export function useMessageSocket(
  userId?: string,
  onMessageReceive?: (message: Message) => void
) {
  useEffect(() => {
    if (!userId || !onMessageReceive) return;
    // Ensure socket is connected
    connectSocket();
    
    socketSetup('receive-message', (data) => {
      onMessageReceive(data.message);
    });
    // Clean up on unmount
    return () => {
      socketCleanup('receive-message');
    };
  }, [userId, onMessageReceive]);
}