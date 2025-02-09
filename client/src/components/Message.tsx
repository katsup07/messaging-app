import React from 'react';
import { useAtomValue } from 'jotai';
import { userAtom } from '../atoms/userAtom';

interface MessageProps {
  sender: string;
  content: string;
}

const Message: React.FC<MessageProps> = ({ content, sender }) => {
  const currentUser = useAtomValue(userAtom);
  const isCurrentUser = currentUser?.username === sender;

  return (
    <div className="message">
      <span className={`sender ${isCurrentUser ? 'current-user' : ''}`}>
        {sender}
      </span>
      {content}
    </div>
  );
};

export default Message;