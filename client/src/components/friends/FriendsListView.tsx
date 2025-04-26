import React from 'react';
import { Friend } from '../../types/friend';
import FriendItem from './FriendItem';

interface FriendsListViewProps {
  friends: Friend[];
  selectedFriend: Friend | null;
  onlineStatus: { [key: string]: boolean };
  onSelectFriend: (friend: Friend) => void;
}

const FriendsListView: React.FC<FriendsListViewProps> = ({
  friends,
  selectedFriend,
  onlineStatus,
  onSelectFriend
}) => {
  return (
    <div className="friends-list-items">
      {friends.filter((f: Friend) => !f.isRejected).map((friend: Friend) => (
        <FriendItem
          key={friend._id}
          friend={friend}
          isSelected={selectedFriend?._id === friend._id}
          isOnline={!!onlineStatus[friend._id]}
          onSelect={onSelectFriend}
        />
      ))}
    </div>
  );
};

export default FriendsListView;