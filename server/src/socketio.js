const { Server } = require('socket.io');
const { logInfo } = require('./middleware/logger');

let io;

const socketIoController = {
  init: (httpServer) => {
    if (!io) {
      io = new Server(httpServer, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
          credentials: true
        },
        transports: ['polling'] // Use polling for Vercel compatibility
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