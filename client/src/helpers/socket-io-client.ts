import { io } from 'socket.io-client';
import { Message } from '../components/Chat';

// Get server URL from environment variables, fallback to localhost
const serverUrl = import.meta.env.VITE_API_BASE_URL 
  ? new URL(import.meta.env.VITE_API_BASE_URL).origin
  : 'http://localhost:5000';

export const socket = io(serverUrl, {
  path: '/socket.io',
  transports: ['websocket','polling']
});

// Logging
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

export const registerForLiveUpdates = (userId: string) => {
  if (!userId) return
    
  socket.emit('register-user', userId.toString());
  console.log(`User ${userId} registered with socket`);
};

export const messageSentLiveUpdate = (message: Message, receiverId: string) => {
  console.log('Sending message via socket:', message, receiverId);
  socket.emit('sent-message', { message, receiverId});
}



