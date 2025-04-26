import React from 'react';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  hasFriends: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  isLoading,
  hasFriends
}) => {
  if (!hasFriends) return null;
  
  return (
    <div className="message-input-container">
      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message"
        className="message-input"
        disabled={isLoading}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        rows={1}
      />
      <button
        onClick={handleSendMessage}
        className="send-button"
        disabled={isLoading || !newMessage.trim()}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;