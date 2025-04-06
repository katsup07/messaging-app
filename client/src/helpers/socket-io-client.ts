import { io } from 'socket.io-client';

// Create a single socket instance
export const socket = io('http://localhost:5000');

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