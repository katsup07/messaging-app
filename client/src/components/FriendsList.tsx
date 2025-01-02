import React, { useState } from 'react';

export interface Friend {
  id: number;
  name: string;
}

interface FriendsListProps {
  friends: Friend[];
  onSelectFriend: (friendName: string) => void;
  selectedFriend: string | null;
}

const FriendsList: React.FC<FriendsListProps> = ({ friends, onSelectFriend, selectedFriend }) => {
  
  const handleClick = (friendName: string) => {
    onSelectFriend(friendName);
  };

  return (
    <div className="friends-list" style={{ width: '200px', padding: '10px' }}>
      <h3>Friends</h3>
      {friends.map(friend => (
        <div
          key={friend.id}
          className={`friend-item ${selectedFriend === friend.name ? 'active' : ''}`}
          onClick={() => handleClick(friend.name)}
          style={{
            cursor: 'pointer',
            marginBottom: '5px',
            border: '1px solid #4c5287',
            padding: '5px',
            borderRadius: '5px'
          }}
        >
          {friend.name}
        </div>
      ))}
    </div>
  );
};

export default FriendsList;