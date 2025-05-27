import { useEffect } from 'react';
import { connectSocket, socketCleanup, socketSetup } from '../../socket-io-client';
import ServiceFacade from '../../services/ServiceFacade';

/**
 * Custom hook for managing socket connections related to friend online status
 * 
 * @param userId - The current user's ID
 * @returns onlineStatus object and setOnlineStatus function
 */
export function useFriendStatusSocket(serviceFacade: ServiceFacade | null, userId?: string) {

  useEffect(() => {
    if (!userId) return;
    // Ensure socket is connected
    connectSocket();
    
    // Listen for initial friends status (sent when requesting friends list)
    socketSetup('get-friends-status', (statuses) => {
      serviceFacade?.updateAllFriendsOnlineStatuses(statuses);
    });
    
    // Listen for individual friend status changes (when friends come online/offline)
    socketSetup('user-status-change', ({ userId: friendId, isOnline }) => {
      serviceFacade?.updateFriendOnlineStatus(friendId, isOnline);
    });
    
    // Clean up on unmount
    return () => {
      socketCleanup('get-friends-status');
      socketCleanup('user-status-change');
    };
  }, [userId, serviceFacade]);
}