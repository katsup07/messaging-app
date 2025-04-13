const { Server } = require('socket.io');
const { logInfo } = require('../src/middleware/logger');

let io;

const socketIoController = {
    init: (httpServer) => {
        if (!io) {
            // Configure Socket.IO with proper CORS settings for production
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
                    logInfo(`Client disconnected: ${socket.id}`);
                });

                socket.on('register-user', (userId) => {
                    socket.join(`user_${userId}`);
                    logInfo(`user_${userId} registered for notifications`);
                });
            });
        }
    },
    
    getIO: () => {
        if (!io)
            throw new Error('Socket.io not initialized!');

        return io;
    }
};

module.exports = { socketIoController };