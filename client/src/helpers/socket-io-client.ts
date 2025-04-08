import { io } from 'socket.io-client';

// Get server URL from environment variables, fallback to localhost
const serverUrl = import.meta.env.VITE_API_BASE_URL 
  ? new URL(import.meta.env.VITE_API_BASE_URL).origin
  : 'http://localhost:5000';

export const socket = io(serverUrl, {
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

// Logging
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

// Helper for registering
export const registerUser = (userId: string | number) => {
  if (userId) {
    socket.emit('register-user', userId);
    console.log(`User ${userId} registered with socket`);
  }
};