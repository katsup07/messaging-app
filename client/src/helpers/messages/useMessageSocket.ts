import { useEffect } from 'react';
import { connectSocket, socketCleanup, socketSetup } from '../../socket-io-client';
import ServiceFacade from '../../services/ServiceFacade';

/**
 * Custom hook for managing socket connections related to messages
 * 
 * @param userId - The current user's ID
 * @param onMessageReceive - Callback function when a new message is received
 */
export function useMessageSocket(
  userId?: string,
  serviceFacade?: ServiceFacade | null,
) {
  useEffect(() => {
    if (!userId || !serviceFacade) return;
    // Ensure socket is connected
    connectSocket();
    
    socketSetup('receive-message', (data) => {
       serviceFacade.handleIncomingSocketMessage(data.message);
    });
    // Clean up on unmount
    return () => {
      socketCleanup('receive-message');
    };
  }, [userId, serviceFacade]);
}