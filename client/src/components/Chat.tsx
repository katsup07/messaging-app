import { useEffect, useState, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import ApiService from '../services/ApiService';
import Message from './Message';
import React from 'react';
import { Friend } from './FriendsList';

interface Message {
  senderId: number;
  sender: string;
  content: string;
  receiverId: number;
  time: string; // ISO string
}

interface Props {
  selectedFriend: Friend | null;
}

const Chat: React.FC<Props> = ({ selectedFriend}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const user = useAtomValue(userAtom);

  const apiService = useMemo(() => new ApiService(user), [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      const fetchedMessages = await apiService.getMessages();
      const sortedMessages = fetchedMessages.sort((a: Message, b: Message) => new Date(a.time).getTime() - new Date(b.time).getTime());
      setMessages(sortedMessages);
    };

    if (selectedFriend) {
      apiService.setSelectedFriend(selectedFriend);
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [apiService, selectedFriend]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend || !user) return;

      const messageData = { 
        senderId: user.id,
        time: new Date().toISOString(),
        sender: user.username, 
        content: newMessage, 
        receiver: selectedFriend, 
        receiverId: selectedFriend.id,
      };

      await apiService.sendMessage(messageData);
      setMessages([...messages, messageData]);
      setNewMessage('');
  };

  const isFriendSenderOrReceiver = (message: Message) => {
    const isFriendSender = message.senderId === selectedFriend?.id;
    const isFriendReceiver = message.receiverId === selectedFriend?.id;
    return isFriendSender || isFriendReceiver;
  }

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.filter(isFriendSenderOrReceiver).map((message, index) => (
          <Message key={index} sender={message.sender} content={message.content} />
        ))}
      </div>
      <div className="message-input-container">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
          className="message-input"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          rows={1}
        />
        <button onClick={handleSendMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;