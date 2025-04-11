const { Server } = require('socket.io');

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
    }
    
    return io;
  },
  getIO: () => {
    if (!io)
      throw new Error('Socket.io not initialized!');

    return io;
  },
}

module.exports = {
 socketIoController,
};