import React, { useState } from 'react';

interface AddFriendFormProps {
  onValidateAndConfirm: (friendId: string) => void;
}

const AddFriendForm: React.FC<AddFriendFormProps> = ({ onValidateAndConfirm }) => {
  const [newFriendId, setNewFriendId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFriendId.trim()) {
      onValidateAndConfirm(newFriendId);
      // Optionally clear the input here or let the parent handle it
      // setNewFriendId(''); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-friend-form">
      <input
        value={newFriendId}
        onChange={(e) => setNewFriendId(e.target.value)}
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
    </form>
  );
};

export default AddFriendForm;
