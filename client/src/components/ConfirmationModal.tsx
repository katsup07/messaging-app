import React from 'react';
import { Friend } from '../types/friend';

interface ConfirmationModalProps {
  targetUser: Friend;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ targetUser, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirm Friend Request</h3>
        <p>Send friend request to {targetUser.username} (ID: {targetUser._id})?</p>
        <div className="modal-buttons">
          <button
            className="modal-button cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="modal-button confirm"
            onClick={onConfirm}
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
