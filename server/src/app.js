require('dotenv').config();
const { socketIoController } = require('./socketio');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { setMessageRoutes } = require('./routes/messageRoutes');
const { setAuthRoutes } = require('./routes/authRoutes');
const { setFriendsRoutes } = require('./routes/friendsRoutes');
const { setFriendRequestRoutes } = require('./routes/friendRequestRoutes');

const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketIoController.init(server)

app.use(cors());
app.use(express.json());

setMessageRoutes(app);
setAuthRoutes(app);
setFriendsRoutes(app);
setFriendRequestRoutes(app);

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
  console.log(`Server is running on http://localhost:${port}`);
});