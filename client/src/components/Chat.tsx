import React, { useEffect, useState, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import ApiService from '../services/ApiService';
import Message from './Message';

interface Message {
  sender: string;
  content: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const user = useAtomValue(userAtom);

  const apiService = useMemo(() => new ApiService(), []);

  useEffect(() => {
    const fetchMessages = async () => {
      const fetchedMessages = await apiService.getMessages();
      setMessages(fetchedMessages);
    };

    fetchMessages();
  }, [apiService]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && user) {
      const message = { sender: user.username, content: newMessage };

      await apiService.sendMessage(message);
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
   
    <div className="messages-container">
      {messages.map((message, index) => (
        <Message key={index} sender={message.sender} content={message.content} />
      ))}
    </div>
    <input
      type="text"
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      placeholder="Type your message"
      className="message-input"
    />
    <button onClick={handleSendMessage} className="send-button">
      Send
    </button>
  </div>
  );
};

export default Chat;