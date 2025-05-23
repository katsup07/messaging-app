import { useEffect } from 'react';
import { connectSocket, socketCleanup, socketSetup } from '../../socket-io-client';

/**
 * Custom hook for managing socket connections related to friend online status
 * 
 * @param userId - The current user's ID
 * @param onStatusChange - Callback function that receives online status updates
 */
export function useFriendStatusSocket(
  userId?: string,
  onStatusChange?: (statuses: { [key: string]: boolean }) => void
) {
  useEffect(() => {
    if (!userId || !onStatusChange) return;
    // Ensure socket is connected
    connectSocket();
    
    socketSetup('get-friends-status', (statuses) => {
      onStatusChange(statuses);
    });
    
    // Clean up on unmount
    return () => {
      socketCleanup('get-friends-status');
    };
  }, [userId, onStatusChange]);
}