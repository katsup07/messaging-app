require('dotenv').config();
const { socketIoController } = require('./socketio');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { setMessageRoutes } = require('./routes/messageRoutes');
const { setAuthRoutes } = require('./routes/authRoutes');
const { setFriendsRoutes } = require('./routes/friendsRoutes');
const { setFriendRequestRoutes } = require('./routes/friendRequestRoutes');
const { logger } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');

const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketIoController.init(server)

// Apply middleware
app.use(logger); // Add logger middleware early
app.use(cors());
app.use(express.json());

// Set up routes
setMessageRoutes(app);
setAuthRoutes(app);
setFriendsRoutes(app);
setFriendRequestRoutes(app);

// Error handling middleware must be after routes
app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('New client connected: ', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });

  socket.on('register-user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`user_${userId} registered for notifications`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port} in ${process.env.NODE_ENV} mode`);
});