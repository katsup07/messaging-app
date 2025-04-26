import { useEffect } from 'react';
import { registerForLiveUpdates, socketCleanup, socketSetup } from '../../socket-io-client';

/**
 * Custom hook for managing socket connections related to friend requests
 * 
 * @param userId - The current user's ID
 * @param onRequestReceived - Callback function when a new friend request is received
 * @param onRequestAccepted - Callback function when a friend request is accepted
 */
export function useFriendRequestSocket(
  userId?: string | number,
  onRequestReceived?: () => void,
  onRequestAccepted?: () => void
) {
  useEffect(() => {
    if (!userId) return;

    registerForLiveUpdates(userId.toString());
    
    socketSetup('received-friend-request', (data) => {
      console.log('Friend request received:', data);
      if (onRequestReceived) onRequestReceived();
    });
    
    socketSetup('accepted-friend-request', (data) => {
      console.log('Friend request accepted:', data);
      if (onRequestAccepted) onRequestAccepted();
    });
    
    // Clean up on unmount
    return () => {
      socketCleanup('received-friend-request');
      socketCleanup('accepted-friend-request');
    };
  }, [userId, onRequestReceived, onRequestAccepted]);
}