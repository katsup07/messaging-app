import React, { useEffect, useState, useRef, useCallback } from 'react';
import ApiService from '../services/ApiService';
import { User } from '../atoms/userAtom';
import { MdPersonAdd } from 'react-icons/md';

export interface Friend {
  id: number;
  username: string;
  email: string;
  isLoggedIn?: boolean;
}

interface FriendRequest {
  id: string;
  fromUserId: number;
  toUserId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface FriendsListProps {
  onSelectFriend: (friend: Friend) => void;
  selectedFriend: Friend | null;
  user: User;
}

const FriendsList: React.FC<FriendsListProps> = ({ onSelectFriend, selectedFriend, user }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [onlineStatus, setOnlineStatus] = useState<{[key: number]: boolean}>({});
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendId, setNewFriendId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [targetUser, setTargetUser] = useState<Friend | null>(null);
  const [users, setUsers] = useState<{[key: number]: Friend}>({});
  const retryCount = useRef(0);
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 5000;

  const fetchFriends = useCallback(async () => {
    const apiService = new ApiService(user);
    const friendsData = await apiService.getFriends();
    const usersData = await apiService.getUsers();
    
    // Create a map of user IDs to their login status and user data
    const statusMap = usersData.reduce((acc: {[key: number]: boolean}, user: Friend) => {
      acc[user.id] = user.isLoggedIn || false;
      return acc;
    }, {});

    const usersMap = usersData.reduce((acc: {[key: number]: Friend}, user: Friend) => {
      acc[user.id] = user;
      return acc;
    }, {});
    
    setOnlineStatus(statusMap);
    setUsers(usersMap);
    setFriends(friendsData);

    if (friendsData.length > 0 && !selectedFriend) {
      onSelectFriend(friendsData[0]);
    }
  },[user, onSelectFriend, selectedFriend]);

  const pollForOnlineStatusUpdates = useCallback(async () => {
    const interval = setInterval(async () => {
      const apiService = new ApiService(user);
      const usersData = await apiService.getUsers();
      
      const statusMap = usersData.reduce((acc: {[key: number]: boolean}, user: Friend) => {
        acc[user.id] = user.isLoggedIn || false;
        return acc;
      }, {});

      const usersMap = usersData.reduce((acc: {[key: number]: Friend}, user: Friend) => {
        acc[user.id] = user;
        return acc;
      }, {});
      
      setOnlineStatus(statusMap);
      setUsers(usersMap);
    }, 10000); // Poll every 10 seconds
    

    return () => clearInterval(interval);
  }, [user]);

  const setUpFriendsRequestSSE = useCallback(() => {
    let eventSource: EventSource | null = null;

    const connectToSSE = () => {
      if (!user) return;
      if (retryCount.current >= MAX_RETRY_ATTEMPTS) {
        setError('Failed to connect to friend request updates. Please refresh the page.');
        return;
      }

      const apiService = new ApiService(user);
      const url = `${apiService.baseFriendRequestUrl}/stream/${user.id}`;
      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        retryCount.current = 0;
        setError(null);
      };

      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const apiService = new ApiService(user);
        
        switch (message.type) {
          case 'requests':
            setPendingRequests(message.data);
            break;
          case 'friendsUpdate':
            // Refresh friends list when a friend request is accepted
            apiService.getFriends().then(friendsData => {
              setFriends(friendsData);
            });
            break;
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        retryCount.current += 1;

        if (retryCount.current < MAX_RETRY_ATTEMPTS) {
          setTimeout(connectToSSE, RETRY_DELAY);
        } else {
          setError('Failed to connect to friend request updates. Please refresh the page.');
        }
      };
    };

    connectToSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    }},[user]);

  // Fetch friends and poll for online status updates on mount
  useEffect(() => {
    fetchFriends();
    pollForOnlineStatusUpdates();
  }, [fetchFriends, pollForOnlineStatusUpdates]);

  // Set up SSE connection for friend requests
  useEffect(() => {
   setUpFriendsRequestSSE();
  }, [setUpFriendsRequestSSE]);
  
  const handleClick = (friend: Friend) => {
    onSelectFriend(friend);
  };

  const validateAndConfirmRequest = async () => {
    try {
      setError(null);
      const userId = parseInt(newFriendId);
      
      // Check if trying to add self
      if (userId === user.id) {
        setError("You cannot send a friend request to yourself");
        return;
      }

      const apiService = new ApiService(user);
      const users = await apiService.getUsers();
      const targetUser = users.find((u: Friend) => u.id === userId);

      if (!targetUser) {
        setError("User not found");
        return;
      }

      setTargetUser(targetUser);
      setShowConfirmation(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to validate user');
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      setError(null);
      const apiService = new ApiService(user);
      await apiService.sendFriendRequest(parseInt(newFriendId));
      setNewFriendId('');
      setShowAddFriend(false);
      setShowConfirmation(false);
      setTargetUser(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send friend request');
    }
  };

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    try {
      setError(null);
      const apiService = new ApiService(user);
      await apiService.respondToFriendRequest(requestId, accept);
      
      // Refresh friends list
      const friendsData = await apiService.getFriends();
      setFriends(friendsData);

      // No need to manually fetch pending requests since SSE will handle that
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to respond to friend request');
    }
  };

  return (
    <div className="friends-list">
      <div className="friends-header">
        <h3><span>{user.username}</span>'s Friends</h3>
        <button 
          className="icon-button"
          onClick={() => setShowAddFriend(!showAddFriend)}
          aria-label="Add friend"
        >
          <MdPersonAdd size={24} />
          <span className="tooltip">Add friend</span>
        </button>
      </div>

      {showAddFriend && (
        <div className="add-friend-form">
          <input
            type="number"
            value={newFriendId}
            onChange={(e) => setNewFriendId(e.target.value)}
            placeholder="Enter friend's ID"
            className="friend-input"
          />
          <button 
            onClick={validateAndConfirmRequest}
            className="send-request-button"
            disabled={!newFriendId}
          >
            Request
          </button>
        </div>
      )}

      {showConfirmation && targetUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Friend Request</h3>
            <p>Send friend request to {targetUser.username} (ID: {targetUser.id})?</p>
            <div className="modal-buttons">
              <button 
                className="modal-button cancel" 
                onClick={() => {
                  setShowConfirmation(false);
                  setTargetUser(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="modal-button confirm"
                onClick={handleSendFriendRequest}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {pendingRequests.length > 0 && (
        <div className="pending-requests">
          <h4>Pending Requests</h4>
          {pendingRequests.map(request => (
            <div key={request.id} className="friend-request">
              <span>From: {users[request.fromUserId]?.username || 'Unknown'}</span>
              <div className="request-buttons">
                <button 
                  onClick={() => handleRespondToRequest(request.id, true)}
                  className="accept-button"
                >
                  Accept
                </button>
                <button 
                  onClick={() => handleRespondToRequest(request.id, false)}
                  className="reject-button"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="friends-list-items">
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
    </div>
  );
};

export default FriendsList;