const { Server } = require('socket.io');

let io;

const socketIoController = {
  init: (httpServer) => {
    if (!io) {
      // Configure Socket.IO with proper CORS settings for production
      const corsOrigin = process.env.NODE_ENV === 'production'
        ? [process.env.CLIENT_URL]
        : 'http://localhost:5173'; //Vite's default dev port
      
      io = new Server(httpServer, {
        cors: {
          origin: corsOrigin,
          methods: ['GET', 'POST'],
          credentials: true
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