import React, { useState } from 'react';
import { messageContentSchema } from '../../schemas/validation';
import { extractValidationError } from '../../helpers/validation-utils';

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
  const [validationError, setValidationError] = useState<string | null>(null);  const validateAndSend = () => {
    try {
      // Validate message content
      messageContentSchema.parse({ content: newMessage });
      setValidationError(null);
      handleSendMessage();
    } catch (error: unknown) {
      setValidationError(extractValidationError(error));
    }
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  if (!hasFriends) return null;  
  return (
    <div className="message-input-container">
      <div className='message-input-and-button'>
      <textarea
        value={newMessage}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Type your message"
        className="message-input"
        disabled={isLoading}
        spellCheck
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            validateAndSend();
          }
        }}
        rows={3}
        style={{ resize: 'vertical', width: '100%' }}
      />
      
      <button
        onClick={validateAndSend}
        className="send-button"
        disabled={isLoading || !newMessage.trim()}
      >
        Send
      </button>
      </div>
       {validationError && (
        <div className="validation-error" >
          {validationError}
        </div>
      )}
    </div>
  );
};

export default MessageInput;