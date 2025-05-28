import React, { useState } from 'react';
import { friendIdSchema } from '../../schemas/validation';
import { extractValidationError } from '../../helpers/validation-utils';

interface AddFriendFormProps {
  onValidateAndConfirm: (friendId: string) => void;
}

const AddFriendForm: React.FC<AddFriendFormProps> = ({ onValidateAndConfirm }) => {
  const [newFriendId, setNewFriendId] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate friend ID format
      friendIdSchema.parse({ friendId: newFriendId.trim() });
      setValidationError(null);
      onValidateAndConfirm(newFriendId.trim());
    } catch (error: unknown) {
      setValidationError(extractValidationError(error));
    }
  };

  const handleInputChange = (value: string) => {
    setNewFriendId(value);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="add-friend-form">
      <div className="input-and-button">
      <input
        value={newFriendId}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Enter friend's ID"
        className="friend-input"
        aria-label="Friend ID"
      />
      <button
        type="submit"
        className="send-request-button"
        disabled={!newFriendId.trim()}
      >
        Request
      </button>
      </div>
       {validationError && (
        <div className="validation-error">
          {validationError}
        </div>
      )}
    </form>
  );
};

export default AddFriendForm;
