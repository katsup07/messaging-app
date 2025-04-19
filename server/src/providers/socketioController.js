const { Server } = require('socket.io');
const { logInfo, logError } = require('../middleware/logger');
const { friendService } = require('../diContainer');

const onlineUsers = new Map();
let io;

const socketIoController = {
    init: (httpServer) => {
        if (!io) {
            // CORS settings for dev and production
            const corsOrigin = process.env.CLIENT_URL;
            io = new Server(httpServer, {
                cors: {
                    origin: corsOrigin,
                    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
                    allowedHeaders: ['Content-Type', 'Authorization'],
                    optionsSuccessStatus: 204 // For legacy browser support
                },
            });
            // Set up socket event handlers
            io.on('connection', (socket) => {
                logInfo(`New client connected: ${socket.id}`);
                
                socket.on('disconnect', () => {
                    let disconnectedUserId = null;
                    for (const [userId, socketId] of onlineUsers.entries()) {
                      if (socketId !== socket.id) continue;
                      // Remove user from online users map
                        disconnectedUserId = userId;
                        break;
                    }

                    if (!disconnectedUserId) return;
                      // Remove from online users
                      onlineUsers.delete(disconnectedUserId);
                      // Notify friends that user is offline
                      notifyFriendsOfStatusChange(disconnectedUserId, false);
                      logInfo(`Client disconnected: ${socket.id}`);

                });

                socket.on('register-user', (userId) => {
                    socket.join(`user_${userId}`);
                    // Store user as online
                    onlineUsers.set(userId, socket.id);
                    logInfo(`user_${userId} registered for notifications`);
                    // Notify friends that user is online
                    notifyFriendsOfStatusChange(userId, true);
                });

                socket.on('get-friends-status', async (userId) => {
                  notifyFriendsOfStatusChange(userId);
                });
            });
        }
    },
    
    getIO: () => {
        if (!io)
            throw new Error('Socket.io not initialized!');

        return io;
    },

    getOnlineUsers: () => {
      return new Map(onlineUsers);
    }
};

// Helpers
async function notifyFriendsOfStatusChange(userId, isOnline) {
  try {
    const friends = await friendService.getFriendsList(userId);
    // Notify each online friend about status change
    for (const friend of friends) {
      const friendSocketId = onlineUsers.get(friend._id);
      if (!friendSocketId) continue; 
      // Emit event to the friend's socket
        io.to(friendSocketId).emit('user-status-change', {
          userId,
          isOnline,
        });
      
    }
  } catch (err) {
    logError('Error notifying friends:', err);
  }
}

async function notifyFriendsOfStatusChange() {
  try {
    const friends = await friendService.getFriendsList(userId);
    // Compile status of each friend
    const friendsStatus = {};
    for (const friend of friends)
     friendsStatus[friend._id] = onlineUsers.has(friend._id);
    // Send back to requesting client
    socket.emit('friends-status', friendsStatus);
    } catch (err) {
      console.error('Error getting friends status:', err);
    }
}

module.exports = { socketIoController };