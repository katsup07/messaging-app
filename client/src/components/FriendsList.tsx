import React, { useEffect, useState } from 'react';
import ApiService from '../services/ApiService';
import { User } from '../atoms/userAtom';

export interface Friend {
  id: number;
  username: string;
  email: string;
  isLoggedIn?: boolean;
}

interface FriendsListProps {
  onSelectFriend: (friend: Friend) => void;
  selectedFriend: Friend | null;
  user: User;
}

const FriendsList: React.FC<FriendsListProps> = ({ onSelectFriend, selectedFriend, user }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [onlineStatus, setOnlineStatus] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    const fetchFriends = async () => {
      const apiService = new ApiService(user);
      const friendsData = await apiService.getFriends();
      const usersData = await apiService.getUsers();
      
      // Create a map of user IDs to their login status
      const statusMap = usersData.reduce((acc: {[key: number]: boolean}, user: Friend) => {
        acc[user.id] = user.isLoggedIn || false;
        return acc;
      }, {});
      
      setOnlineStatus(statusMap);
      setFriends(friendsData);
      if (friendsData.length > 0 && !selectedFriend) {
        onSelectFriend(friendsData[0]);
      }
    };

    fetchFriends();
    
    // Poll for online status updates
    const interval = setInterval(async () => {
      const apiService = new ApiService(user);
      const usersData = await apiService.getUsers();
      const statusMap = usersData.reduce((acc: {[key: number]: boolean}, user: Friend) => {
        acc[user.id] = user.isLoggedIn || false;
        return acc;
      }, {});
      setOnlineStatus(statusMap);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [user, onSelectFriend, selectedFriend]);
  
  const handleClick = (friend: Friend) => {
    onSelectFriend(friend);
  };

  return (
    <div className="friends-list" style={{ width: '200px', padding: '10px' }}>
      <h3><span>{user.username}</span>'s Friends</h3>
      {friends.map(friend => (
        <div
          key={friend.id}
          className={`friend-item ${selectedFriend?.id === friend.id ? 'active' : ''} ${onlineStatus[friend.id] ? 'online' : ''}`}
          onClick={() => handleClick(friend)}
        >
          {friend.username}
        </div>
      ))}
    </div>
  );
};

export default FriendsList;