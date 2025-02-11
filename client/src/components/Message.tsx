import React from 'react';
import { useAtomValue } from 'jotai';
import { userAtom } from '../atoms/userAtom';

interface MessageProps {
  sender: string;
  content: string;
  time: string;
  isRead?: boolean;
}

const Message: React.FC<MessageProps> = ({ content, sender, time, isRead = false }) => {
  const currentUser = useAtomValue(userAtom);
  const isCurrentUser = currentUser?.username === sender;
  
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`message ${isCurrentUser ? 'message-sent' : 'message-received'}`}>
      <span className={`sender ${isCurrentUser ? 'current-user' : ''}`}>
        {sender}
      </span>
      <div className="message-content">
        {content}
      </div>
      <div className="message-footer">
        <span className="message-time">{formatTime(time)}</span>
        {isCurrentUser && (
          <span className={`message-status ${isRead ? 'read' : 'sent'}`}>
            {isRead ? '✓✓' : '✓'}
          </span>
        )}
      </div>
    </div>
  );
};

export default Message;