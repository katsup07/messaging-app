import { useState, useEffect, useCallback } from 'react';
import ServiceFacade from '../../services/ServiceFacade';
import { User } from '../../atoms/userAtom';
import { Friend, FriendRequest } from '../../types/friend';

export const useFriendsData = (
  user: User | null,
  onSelectFriend: (friend: Friend) => void,
  selectedFriend: Friend | null,
  isMobile: boolean
) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [users, setUsers] = useState<{ [key: string]: Friend }>({});
  const [error, setError] = useState<string | null>(null);
  const [serviceFacade, setServiceFacade] = useState<ServiceFacade | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<{ [key: string]: boolean }>({});

  // Set user (rarely changes)
  useEffect(() => {
    if (!user){
      setServiceFacade(null);
      return;
    }
    
    setServiceFacade(ServiceFacade.getInstance());
  }, [user]);

  const fetchUsers = useCallback(async () => {
    if (!serviceFacade) return;
    try {
      const usersData = await serviceFacade.getUsers();
      const usersMap = usersData.reduce((acc: { [key: string]: Friend }, user: Friend) => {
        acc[user._id] = user;
        return acc;
      }, {});
      setUsers(usersMap);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    }
  }, [serviceFacade]);

  // Set friends, subscribe to updates, and fetch users for pending requests
  useEffect(() => {
    if (!serviceFacade) return;
    // Initial load
    serviceFacade.getFriends().then(friendsData => {
      setFriends(friendsData);
      // Auto-select first friend on desktop if none is selected
      if (friendsData.length > 0 && !selectedFriend && !isMobile) {
        onSelectFriend(friendsData[0]);
      }
    });
    // Subscribe to updates
    const unsubscribeFriends = serviceFacade.getFriendsListUpdateObservable().subscribe(setFriends);
    // Load users once
    fetchUsers();
  
    return () => {
      unsubscribeFriends();
    };
  }, [serviceFacade, selectedFriend, isMobile, onSelectFriend, fetchUsers]);

  // Subscribe to pending requests observable
  useEffect(() => {
    if (!serviceFacade) return;
    
    // Initial load
    serviceFacade.getPendingFriendRequests().then(setPendingRequests);
    
    // Subscribe to updates
    const unsubscribe = serviceFacade.getPendingRequestsObservable().subscribe(setPendingRequests);
    
    return () => {
      unsubscribe();
    };
  }, [serviceFacade]);

  useEffect(() => {
    if (!serviceFacade) return;

    // subscribe to online status updates
    const unsubscribeFriendsOnlineStatus = serviceFacade.getFriendsOnlineStatusObservable().subscribe(setOnlineStatus);

    return () => {
      unsubscribeFriendsOnlineStatus();
    };
  }, [serviceFacade]);

  // Uses observable pattern internally
  const refreshData = useCallback(async() => {
    if (!serviceFacade) return;

    await serviceFacade.refreshFriends();
    await serviceFacade.getPendingFriendRequests();
  }, [serviceFacade]);

  return {
    friends,
    pendingRequests,
    users,
    error, 
    setError,
    refreshData,
    serviceFacade,
    onlineStatus,
  };
};
