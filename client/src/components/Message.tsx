import React from 'react';

interface MessageProps {
  sender: string;
  content: string;
}

const Message: React.FC<MessageProps> = ({ content, sender }) => {
  return <div className="message"><span className="sender">{sender}</span>: {content}</div>;
};

export default Message;