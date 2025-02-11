import React, { useEffect, useState } from 'react';
import ApiService from '../services/ApiService';
import { User } from '../atoms/userAtom';

export interface Friend {
  id: number;
  username: string;
  email: string;
}

interface FriendsListProps {
  onSelectFriend: (friend: Friend) => void;
  selectedFriend: Friend | null;
  user: User;
}

const FriendsList: React.FC<FriendsListProps> = ({ onSelectFriend, selectedFriend, user }) => {
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      const apiService = new ApiService(user);
      const data = await apiService.getFriends();
      setFriends(data);
      onSelectFriend(data[0]);
    };

    fetchFriends();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , []);
  
  const handleClick = (friend: Friend) => {
    onSelectFriend(friend);
  };

  return (
    <div className="friends-list" style={{ width: '200px', padding: '10px' }}>
      <h3><span>{user.username}</span>'s Friends</h3>
      {friends.map(friend => (
        <div
          key={friend.id}
          className={`friend-item ${selectedFriend?.username === friend.username ? 'active' : 'not-active'}`}
          onClick={() => handleClick(friend)}
        >
          {friend.username}
        </div>
      ))}
    </div>
  );
};

export default FriendsList;