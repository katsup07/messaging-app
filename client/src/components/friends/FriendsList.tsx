import React, { useState } from 'react';
import { User } from '../../atoms/userAtom';
import { MdPersonAdd } from 'react-icons/md';
import { Friend } from '../../types/friend';
import { useFriendsData } from '../../helpers/friends/useFriendsData';
import AddFriendForm from './AddFriendForm';
import ConfirmationModal from '../ConfirmationModal';
import PendingRequestsPopover from './PendingRequestsPopover';
import FriendsListView from './FriendsListView';
import { useFriendStatusSocket } from '../../helpers/friends/useFriendStatusSocket';
import { useFriendRequestSocket } from '../../helpers/friends/useFriendRequestSocket';

interface FriendsListProps {
  onSelectFriend: (friend: Friend) => void;
  selectedFriend: Friend | null;
  user: User;
  isMobile: boolean;
  toggleFriendsListModal?: () => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ 
  onSelectFriend, 
  selectedFriend, 
  user, 
  isMobile, 
  toggleFriendsListModal 
}) => {
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [targetUser, setTargetUser] = useState<Friend | null>(null);
  const [friendIdToValidate, setFriendIdToValidate] = useState<string>('');

 
  const { friends, pendingRequests, users, error, setError, refreshData, serviceFacade } = 
    useFriendsData(user, onSelectFriend, selectedFriend, isMobile);

  const { onlineStatus } = useFriendStatusSocket(user?._id);
  useFriendRequestSocket(user?._id, serviceFacade);

  const handleFriendSelect = (friend: Friend) => {
    onSelectFriend(friend);
  };

  const handleValidateAndConfirm = async (friendId: string) => {
    if (!serviceFacade) return;
      setFriendIdToValidate(friendId);

    try {
      setError(null);
      if (friendId === user._id) {
        setError("You cannot send a friend request to yourself");
        return;
      }
      const usersList = await serviceFacade.getUsers();
      const targetUserFound = usersList.find((u: Friend) => u._id === friendId);
      
      if (!targetUserFound) {
        setError("User not found");
        return;
      }
      setTargetUser(targetUserFound);
      setShowConfirmation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate user');
    }
  };

  const handleSendFriendRequest = async () => {
    if (!serviceFacade || !friendIdToValidate) return;

    try {
      setError(null);
      await serviceFacade.sendFriendRequest(friendIdToValidate);
      setShowAddFriend(false);
      setShowConfirmation(false);
      setTargetUser(null);
      setFriendIdToValidate('');
      refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send friend request');
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setTargetUser(null);
    setFriendIdToValidate('');
  };

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    if (!serviceFacade) return;
    try {
      setError(null);
      await serviceFacade.respondToFriendRequest(requestId, accept);
      refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to respond to friend request');
    }
  };
  return (
    <div className="friends-list">
      <div className="friends-header">
        <h3>{user.username}'s Friends</h3>
        <div className="friends-header-controls">
          <PendingRequestsPopover
            pendingRequests={pendingRequests}
            users={users}
            onRespond={handleRespondToRequest}
          />
          <button
            className="icon-button"
            onClick={() => setShowAddFriend(!showAddFriend)}
            aria-label="Add friend"
          >
            <MdPersonAdd size={24} />
            <span className="tooltip">Add friend</span>
          </button>
          {isMobile && toggleFriendsListModal && (
            <button
              className="close-button"
              onClick={toggleFriendsListModal}
              aria-label="Close friends list"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {showAddFriend && (
        <AddFriendForm onValidateAndConfirm={handleValidateAndConfirm} />
      )}

      {showConfirmation && targetUser && (
        <ConfirmationModal
          targetUser={targetUser}
          onConfirm={handleSendFriendRequest}
          onCancel={handleCancelConfirmation}
        />
      )}      {error && <div className="error-message">{error}</div>}

      <FriendsListView
        friends={friends}
        selectedFriend={selectedFriend}
        onlineStatus={onlineStatus}
        onSelectFriend={handleFriendSelect}
      />
    </div>
  );
};

export default FriendsList;
