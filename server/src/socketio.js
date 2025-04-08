const { Server } = require('socket.io');
const { logInfo, logError } = require('./middleware/logger');

// Same allowed origins as in app.js
const allowedOrigins = [
  'https://messaging-app-client-ebon.vercel.app',  // Production client URL
  'https://messaging-app-client.vercel.app',        // Alternative production URL
  'http://localhost:5173'                           // Development URL
];

let io;

const socketIoController = {
  init: (httpServer) => {
    if (!io) {
      logInfo("Initializing Socket.IO server");
      io = new Server(httpServer, {
        cors: {
          origin: function(origin, callback) {
            // Allow requests with no origin
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.indexOf(origin) !== -1) {
              logInfo(`Socket.IO allowing origin: ${origin}`);
              callback(null, true);
            } else {
              logError(`Socket.IO rejected origin: ${origin}`);
              callback(new Error(`Origin ${origin} not allowed by Socket.IO CORS`), false);
            }
          },
          methods: ["GET", "POST"],
          credentials: true,
          allowedHeaders: ["Content-Type", "Authorization", "Accept"]
        },
        transports: ['polling'], // Force polling for Vercel deployments
        // These options help with Vercel deployments
        pingTimeout: 30000,
        pingInterval: 25000,
        upgradeTimeout: 10000,
        maxHttpBufferSize: 1e8
      });
      
      logInfo("Socket.IO server initialized");
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