/* eslint-disable @typescript-eslint/no-explicit-any */
import { io } from 'socket.io-client';

// Get server URL from environment variables, fallback to localhost
const serverUrl = import.meta.env.VITE_API_BASE_URL 
  ? new URL(import.meta.env.VITE_API_BASE_URL).origin
  : 'http://localhost:5000';

// Singleton socket instance
const socket = io(serverUrl, {
  path: '/socket.io',
  transports: ['websocket','polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000, // accommodate slower connections
  withCredentials: true // cross-browser compatibility
});

// Track registration status
let isUserRegistered = false;
let currentUserId: string | null = null;

// Logging
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
  // Re-register user on reconnection if we have a userId
  if (currentUserId && !isUserRegistered) {
    registerUserWithSocket(currentUserId);
  }
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
  isUserRegistered = false;
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  isUserRegistered = false;
});

export const disconnectSocket = () => {
  currentUserId = null;
  isUserRegistered = false;
  socket.disconnect();
};

// Useful to guard against disconnects when network issues occur
export const connectSocket = () => {
  if (socket.connected) return;

  socket.connect();
};

// Helper function to register user with the socket
const registerUserWithSocket = (userId: string) => {
  socket.emit('register-user', userId.toString());
  isUserRegistered = true;
  console.log(`User ${userId} registered with socket ID: ${socket.id}`);
};

export const registerForLiveUpdates = (userId: string) => {
  if (!userId) return;
  
  // Store the userId for reconnections
  currentUserId = userId;
  
  if (socket.connected) {
    registerUserWithSocket(userId);
    return;
  }
  
  // If not connected, connect and register when ready
  socket.connect();
  
  // sets up a listener that will fire when the connection is successfully established, which might happen asynchronously.
  socket.once('connect', () => {
    // Only register if not already registered
    if (!isUserRegistered && currentUserId) {
      registerUserWithSocket(currentUserId);
    }
  });
};

export const socketSetup = (event: string, callback: (...args: any[]) => void) => socket.on(event, callback);

export const socketCleanup = (event: string, callback?: (...args: any[]) => void) => socket.off(event, callback);