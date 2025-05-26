import { useEffect, useState } from 'react';
import { connectSocket, socketCleanup, socketSetup } from '../../socket-io-client';

/**
 * Custom hook for managing socket connections related to friend online status
 * 
 * @param userId - The current user's ID
 * @returns onlineStatus object and setOnlineStatus function
 */
export function useFriendStatusSocket(userId?: string) {
  const [onlineStatus, setOnlineStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!userId) return;
    // Ensure socket is connected
    connectSocket();
    
    // Listen for initial friends status (sent when requesting friends list)
    socketSetup('get-friends-status', (statuses) => {
      setOnlineStatus(statuses);
    });
    
    // Listen for individual friend status changes (when friends come online/offline)
    socketSetup('user-status-change', ({ userId: friendId, isOnline }) => {
      setOnlineStatus(prevStatuses => ({
        ...prevStatuses,
        [friendId]: isOnline
      }));
    });
    
    // Clean up on unmount
    return () => {
      socketCleanup('get-friends-status');
      socketCleanup('user-status-change');
    };
  }, [userId]);

  return { onlineStatus, setOnlineStatus };
}