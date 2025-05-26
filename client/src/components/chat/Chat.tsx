import { useState, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { userAtom } from '../../atoms/userAtom';
import ServiceFacade from '../../services/ServiceFacade';
import React from 'react';
import { Friend } from '../../types/friend';
import useScrollToBottom from '../../helpers/useScrollToBottom';
import { useMessageSocket } from '../../helpers/messages/useMessageSocket';
import { Message } from '../../types/message';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useMessages } from '../../helpers/messages/useMessagesHook';

interface Props {
  selectedFriend: Friend | null;
}

const Chat: React.FC<Props> = ({ selectedFriend }) => {
  const [newMessage, setNewMessage] = useState<string>('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const user = useAtomValue(userAtom);
  const serviceFacade = ServiceFacade.getInstance();

  const { messages, isLoading, error, sendMessage, hasFriends } = useMessages(
    user, 
    selectedFriend, 
    serviceFacade
  );
  useMessageSocket(user?._id, serviceFacade);
  useScrollToBottom(messagesContainerRef, [messages, selectedFriend]);

  const handleSendMessage = async () => {
  if (!newMessage.trim()) return;

    try {
      await sendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const isFriendSenderOrReceiver = (message: Message) => {
    const userToFriend = message.senderId === user?._id && message.receiverId === selectedFriend?._id;
    const friendToUser = message.senderId === selectedFriend?._id && message.receiverId === user?._id;
    
    return userToFriend || friendToUser;
  };

  return (
    <div className="chat-container">
      <MessageList 
        messages={messages}
        isLoading={isLoading}
        error={error}
        messagesContainerRef={messagesContainerRef}
        isFriendSenderOrReceiver={isFriendSenderOrReceiver}
      />
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        hasFriends={hasFriends}
      />
    </div>
  );
};

export default Chat;