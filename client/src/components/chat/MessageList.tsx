import React, { RefObject } from 'react';
import Message from './Message';
import { Message as MessageType } from '../../types/message';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  error: string | null;
  messagesContainerRef: RefObject<HTMLDivElement>;
  isFriendSenderOrReceiver: (message: MessageType) => boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  error,
  messagesContainerRef,
  isFriendSenderOrReceiver
}) => {
  return (
    <div className="messages-container" ref={messagesContainerRef}>
      {error && <div className="error-message">{error}</div>}
      {isLoading && messages.length === 0 ? (
        <div className="loading-spinner">Loading messages...</div>
      ) : messages.length === 0 ? (
        <em>No message history exists.</em>
      ) : (
        <>
          {messages.filter(isFriendSenderOrReceiver).map((message, index) => (
            <Message
              key={`${message.senderId}-${message.time}-${index}`}
              senderId={message.senderId.toString()}
              sender={message.sender}
              content={message.content}
              time={message.time}
              isRead={message.isRead}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default MessageList;