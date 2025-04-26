/* eslint-disable @typescript-eslint/no-explicit-any */
import { io } from 'socket.io-client';

// Get server URL from environment variables, fallback to localhost
const serverUrl = import.meta.env.VITE_API_BASE_URL 
  ? new URL(import.meta.env.VITE_API_BASE_URL).origin
  : 'http://localhost:5000';

// Singleton socket instance
const socket = io(serverUrl, {
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

export const disconnectSocket = () => {
  socket.disconnect();
};

export const registerForLiveUpdates = (userId: string) => {
  if (!userId) return
    
  socket.emit('register-user', userId.toString());
  console.log(`User ${userId} registered with socket`);
};

export const socketSetup = (event: string, callback: (...args: any[]) => void) => socket.on(event, callback);

export const socketCleanup = (event: string, callback?: (...args: any[]) => void) => socket.off(event, callback);