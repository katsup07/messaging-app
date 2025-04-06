const { Server } = require('socket.io');

let io;

const socketIoController = {
  init: (httpServer) => {
    if (!io)
      io = new Server(httpServer, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
      });
    
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