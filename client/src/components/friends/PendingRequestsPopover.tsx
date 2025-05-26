import React, { useState, useRef, useEffect } from 'react';
import { Friend, FriendRequest } from '../../types/friend';
import { MdNotifications, MdClose } from 'react-icons/md';

interface PendingRequestsPopoverProps {
  pendingRequests: FriendRequest[];
  users: { [key: string]: Friend };
  onRespond: (requestId: string, accept: boolean) => void;
}

const PendingRequestsPopover: React.FC<PendingRequestsPopoverProps> = ({ 
  pendingRequests, 
  users, 
  onRespond 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  const handleRespond = (requestId: string, accept: boolean) => {
    onRespond(requestId, accept);
    // Keep popover open so user can see the result and handle multiple requests
  };

  // Always render the button, even with 0 requests, for testing
  const hasRequests = pendingRequests.length > 0;

  return (
    <div className="pending-requests-popover-container">      <button
        ref={buttonRef}
        className="icon-button pending-notification-button"
        onClick={handleToggle}
        aria-label={`${pendingRequests.length} pending friend request${pendingRequests.length > 1 ? 's' : ''}`}
      >
        <MdNotifications size={24} />
        {hasRequests && (
          <span className="notification-badge">{pendingRequests.length}</span>
        )}
        <span className="tooltip">Pending Requests ({pendingRequests.length})</span>
      </button>

      {isOpen && (
        <div ref={popoverRef} className="pending-requests-popover">
          <div className="popover-header">
            <h4>Friend Requests</h4>
            <button
              className="close-popover-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <MdClose size={16} />
            </button>
          </div>
            <div className="popover-content">
            {hasRequests ? (
              pendingRequests.map((request, index) => (
                <div key={request._id + index.toString()} className="friend-request-item">
                  <div className="request-info">
                    <div className="request-avatar">👤</div>
                    <div className="request-details">
                      <span className="request-username">
                        {users[request.fromUserId]?.username || 'Unknown'}
                      </span>
                      <span className="request-subtitle">wants to be friends</span>
                    </div>
                  </div>
                  <div className="request-actions">
                    <button
                      onClick={() => handleRespond(request._id, true)}
                      className="accept-button-popover"
                      title="Accept request"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleRespond(request._id, false)}
                      className="reject-button-popover"
                      title="Reject request"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-requests-message">
                <p>No pending friend requests</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequestsPopover;
