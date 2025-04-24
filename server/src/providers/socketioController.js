const { Server } = require('socket.io');
const { logInfo, logError } = require('../middleware/logger');

const onlineUsers = new Map();
let io;
let notificationService;
let friendService;

const socketIoController = {
    init: (httpServer, services) => {
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
            
            if (services) {
                notificationService = services.notificationService;
                friendService = services.friendService;
            }
            
            // Set up socket event handlers
            io.on('connection', (socket) => {
                logInfo(`New client connected: ${socket.id}`);
                
                socket.on('disconnect', async() => {
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
                    if (notificationService && friendService) {
                        await notificationService.notifyStatusChange(
                            disconnectedUserId, 
                            false,
                            friendService
                        );
                    }
                    
                    logInfo(`Client disconnected: ${socket.id}`);
                });

                socket.on('register-user', async(userId) => {
                    socket.join(`user_${userId}`);
                    // Store user as online
                    onlineUsers.set(userId, socket.id);
                    logInfo(`user_${userId} registered for notifications`);
                    
                    // Notify friends that user is online using notification service
                    if (notificationService && friendService) {
                        await notificationService.notifyStatusChange(
                            userId, 
                            true,
                            friendService
                        );
                    }
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
        return onlineUsers;
    }
};

module.exports = { socketIoController };