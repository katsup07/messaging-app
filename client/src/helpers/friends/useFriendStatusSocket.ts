import { useEffect } from 'react';
import { registerForLiveUpdates, socketCleanup, socketSetup } from '../../socket-io-client';

/**
 * Custom hook for managing socket connections related to friend online status
 * 
 * @param userId - The current user's ID
 * @param onStatusChange - Callback function that receives online status updates
 */
export function useFriendStatusSocket(
  userId?: string | number,
  onStatusChange?: (statuses: { [key: string]: boolean }) => void
) {
  useEffect(() => {
    if (!userId || !onStatusChange) return;

    registerForLiveUpdates(userId.toString());
    
    socketSetup('get-friends-status', onStatusChange);
    
    return () => {
      socketCleanup('get-friends-status');
    };
  }, [userId, onStatusChange]);
}