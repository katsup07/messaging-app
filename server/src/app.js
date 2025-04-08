require('dotenv').config();
const { socketIoController } = require('./socketio');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { setMessageRoutes } = require('./routes/messageRoutes');
const { setAuthRoutes } = require('./routes/authRoutes');
const { setFriendsRoutes } = require('./routes/friendsRoutes');
const { setFriendRequestRoutes } = require('./routes/friendRequestRoutes');
const { logger, logInfo } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');

const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketIoController.init(server)

// Configure CORS for different environments
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL] 
    : 'http://localhost:5173', // Vite's default dev port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// app.use(cors({
//   origin: ['https://messaging-app-client-ebon.vercel.app', 'http://localhost:5173'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

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