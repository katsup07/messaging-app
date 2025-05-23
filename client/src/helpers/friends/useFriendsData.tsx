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
  const [users, setUsers] = useState<{ [key: number | string]: Friend }>({});
  const [error, setError] = useState<string | null>(null);
  const [serviceFacade, setServiceFacade] = useState<ServiceFacade | null>(null);

  useEffect(() => {
    if (!user){
      setServiceFacade(null);
      return;
    }
    
    setServiceFacade(ServiceFacade.getInstance(user));
  }, [user]);

  const fetchFriends = useCallback(async () => {
    if (!serviceFacade) return;
    try {
      setError(null);
      const friendsData = await serviceFacade.getFriends();
      const usersData = await serviceFacade.getUsers();

      const usersMap = usersData.reduce((acc: { [key: number | string]: Friend }, user: Friend) => {
        acc[user._id] = user;
        return acc;
      }, {});

      setUsers(usersMap);
      setFriends(friendsData);

      // Auto-select first friend on desktop if none is selected
      if (friendsData.length > 0 && !selectedFriend && !isMobile) {
        onSelectFriend(friendsData[0]);
      }
    } catch (err) {
      console.error('Failed to fetch friends:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch friends');
    }
  }, [serviceFacade, onSelectFriend, selectedFriend, isMobile]);

  const fetchPendingRequests = useCallback(async () => {
    if (!serviceFacade) return;
    try {
      setError(null);
      const results = await serviceFacade.getPendingFriendRequests();
      setPendingRequests(results);
    } catch (err) {
      console.error('Failed to fetch pending requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pending requests');
    }
  }, [serviceFacade]);

  const refreshData = useCallback(async() => {
    await serviceFacade?.refreshFriends();
    await fetchFriends();
    await fetchPendingRequests();
  }, [serviceFacade, fetchFriends, fetchPendingRequests]);

  useEffect(() => {
    if (serviceFacade) {
      refreshData();
    }
  }, [serviceFacade, refreshData]);

  return {
    friends,
    pendingRequests,
    users,
    error,
    setError,
    refreshData,
    serviceFacade,
  };
};
