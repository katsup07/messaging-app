require('dotenv').config();
const { morgan, morganFormat } = require('../config/morganConfig');
const { mongoDbManager } = require('../providers/mongoDbManager');
const { accessLogStream } = require('./middleware/logger');
const { socketIoController } = require('../providers/socketioController');
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
socketIoController.init(server);

// Configure CORS for different environments
const corsOptions = {
    origin: process.env.CLIENT_URL, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
};

// Middleware
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan(morganFormat, { stream: accessLogStream }));

// Set up routes
setMessageRoutes(app);
setAuthRoutes(app);
setFriendsRoutes(app);
setFriendRequestRoutes(app);

// Global error handler
app.use(errorHandler);

// Initialize server with database connection
mongoDbManager.connectToMongoDB()
    .then(() => {
        server.listen(port, () => {
            logInfo(`Server is running on http://localhost:${port} in ${process.env.NODE_ENV} mode`);
        });
    })
    .catch(err => {
        logError('Failed to initialize server:', err);
        process.exit(1);
    });