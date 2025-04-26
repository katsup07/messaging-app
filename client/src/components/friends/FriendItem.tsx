import React from 'react';
import { Friend } from '../../types/friend';

interface FriendItemProps {
  friend: Friend;
  isSelected: boolean;
  isOnline: boolean;
  onSelect: (friend: Friend) => void;
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, isSelected, isOnline, onSelect }) => {
  const itemClass = `
    friend-item 
    ${isSelected && !friend.isPending ? 'active' : ''} 
    ${isOnline ? 'online' : ''} 
    ${friend.isPending ? 'pending-requests' : ''}
  `.trim();

  return (
    <div
      className={itemClass}
      onClick={() => onSelect(friend)}
    >
      {friend.username}
      {friend.isPending && <span className="pending-text">(Pending)</span>}
    </div>
  );
};

export default FriendItem;
