import { useEffect } from 'react';
import { connectSocket, socketCleanup, socketSetup } from '../../socket-io-client';
import ServiceFacade from '../../services/ServiceFacade';

/**
 * Enhanced version of the friend request socket hook that directly triggers
 * refreshes through the ServiceFacade, which will then notify all observers
 * 
 * @param userId - The current user's ID
 * @param serviceFacade - Instance of ServiceFacade
 */
export function useObservableFriendRequestSocket(
  userId?: string,
  serviceFacade?: ServiceFacade | null
) {
  useEffect(() => {
    if (!userId || !serviceFacade) return;
    
    connectSocket();
    
    socketSetup('received-friend-request', async (data) => {
      console.log('Friend request received:', data);
      // This will fetch and trigger emit to all subscribers including the pendingRequests observable
      await serviceFacade.getPendingFriendRequests();
    });
    
    socketSetup('accepted-friend-request', async (data) => {
      console.log('Friend request accepted:', data);
      // This will fetch and trigger emit to all subscribers including the friends observable
      await serviceFacade.refreshFriends();
    });
    
    // Clean up on unmount
    return () => {
      socketCleanup('received-friend-request');
      socketCleanup('accepted-friend-request');
    };
  }, [userId, serviceFacade]);
}
