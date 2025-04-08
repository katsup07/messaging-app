require('dotenv').config();
const { socketIoController } = require('./socketio');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { setMessageRoutes } = require('./routes/messageRoutes');
const { setAuthRoutes } = require('./routes/authRoutes');
const { setFriendsRoutes } = require('./routes/friendsRoutes');
const { setFriendRequestRoutes } = require('./routes/friendRequestRoutes');
const { logger, logInfo, logError } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');

const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketIoController.init(server)

// Set specific allowed origins for security
const allowedOrigins = [
  'https://messaging-app-client-ebon.vercel.app',  // Production client URL
  'https://messaging-app-client.vercel.app',        // Alternative production URL
  'http://localhost:5173'                           // Development URL
];

// Configure CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logError(`CORS blocked request from origin: ${origin}`);
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false
};

// Log all incoming requests
app.use((req, res, next) => {
  logInfo(`Incoming request: ${req.method} ${req.url} from origin ${req.headers.origin}`);
  next();
});

// Middleware
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());

// Set up routes
setMessageRoutes(app);
setAuthRoutes(app);
setFriendsRoutes(app);
setFriendRequestRoutes(app);

// Global error handler
app.use(errorHandler);

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

server.listen(port, () => {
  logInfo(`Server is running on http://localhost:${port} in ${process.env.NODE_ENV} mode`);
});