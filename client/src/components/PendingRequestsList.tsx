import React from 'react';
import { Friend, FriendRequest } from '../types/friend';

interface PendingRequestsListProps {
  pendingRequests: FriendRequest[];
  users: { [key: string]: Friend };
  onRespond: (requestId: string, accept: boolean) => void;
}

const PendingRequestsList: React.FC<PendingRequestsListProps> = ({ pendingRequests, users, onRespond }) => {
  if (pendingRequests.length === 0) {
    return null; // Don't render anything if there are no requests
  }

  return (
    <div className="pending-requests">
      <h4>Pending Requests</h4>
      {pendingRequests.map((request, index) => (
        <div key={request._id + index.toString()} className="friend-request">
          <span>From: {users[request.fromUserId]?.username || 'Unknown'}</span>
          <div className="request-buttons">
            <button
              onClick={() => onRespond(request._id, true)}
              className="accept-button"
            >
              Accept
            </button>
            <button
              onClick={() => onRespond(request._id, false)}
              className="reject-button"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingRequestsList;
