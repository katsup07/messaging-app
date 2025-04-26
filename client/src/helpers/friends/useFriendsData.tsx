import { useState, useEffect, useCallback } from 'react';
import ApiService from '../../services/ApiService';
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
  const [apiService, setApiService] = useState<ApiService | null>(null);

  useEffect(() => {
    if (!user){
      setApiService(null);
      return;
    }
    
    setApiService(ApiService.getInstance(user));
  }, [user]);

  const fetchFriends = useCallback(async () => {
    if (!apiService) return;
    try {
      setError(null);
      const friendsData = await apiService.getFriends();
      const usersData = await apiService.getUsers();

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
  }, [apiService, onSelectFriend, selectedFriend, isMobile]);

  const fetchPendingRequests = useCallback(async () => {
    if (!apiService) return;
    try {
      setError(null);
      const results = await apiService.getPendingFriendRequests();
      setPendingRequests(results);
    } catch (err) {
      console.error('Failed to fetch pending requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pending requests');
    }
  }, [apiService]);

  const refreshData = useCallback(() => {
    fetchFriends();
    fetchPendingRequests();
  }, [fetchFriends, fetchPendingRequests]);

  useEffect(() => {
    if (apiService) {
      refreshData();
    }
  }, [apiService, refreshData]);

  return {
    friends,
    pendingRequests,
    users,
    error,
    setError,
    refreshData,
    apiService,
  };
};
