## ⚙️ Overview 
This is a fullstack messaging app built using Clean Architecture principles. It features custom dependency injection, secure JWT authentication, real-time messaging with Socket.IO, and persistent logging for application monitoring in production. It offers features like friend requests, real-time chat, user status tracking, and live updates.

The frontend leverages React, TypeScript, Jotai for state management, and Vite for fast development, delivering a modern, responsive UI with light/dark theme support. The backend follows a layered structure (routes → controllers → services → repositories) and includes custom logging and middleware for validation, authentication, and error handling, with MongoDB for data storage

The frontend and backend are deployed separately (Vercel / Railway), and the project supports both local and Docker-based containerized development environments. The app is live [here](https://messaging-app-client-ebon.vercel.app/).

## 🚀 Installation and Development

### 🖥️ Client Folder
`npm install`
<br/>`npm run dev`

### 🔧 Server Folder
`npm install`
<br/>`npm start`



### or

## 🐳 Docker Development Environment(Optional)

This project supports fully containerized development using [Docker](https://www.docker.com/get-started/), enabling minimal local environment setup.
From the root folder, you can run both the client and server with a single command: `npm run docker:start`. 
<br/> <sub>Note: The local files are mounted into the containers, so any changes made locally will automatically be reflected inside the container, with live reload enabled.</sub>

![Desktop Screenshot 2025 04 16 - 14 12 47 62](https://github.com/user-attachments/assets/b95ee49a-3734-4cc5-9f89-11491da2835d)


## 🔐 Environment Variables(.env)
### server
- MONGODB_URI
- JWT_SECRET
- ACCESS_TOKEN_EXPIRATION
- REFRESH_TOKEN_SECRET
- REFRESH_TOKEN_EXPIRATION
- PORT
- NODE_ENV
- CLIENT_URL
### client
- VITE_API_BASE_URL

## 📝 Note
🛢️ A mongoDB database needs to be connected to use this project as is.

## 🧰 Tech Stack
- **Frontend**: React.js, TypeScript, Jotai (state management) 
  _(deployed on Vercel)_
- **Backend**: Node.js, Express.js, Socket.IO, JavaScript, Zod (validation)  
  _(deployed on Railway)_
- **Database**: MongoDB

## 🎥 Video
[Demo Video](https://youtu.be/mEsYUYDX8vM)

## 🖼️ Images  
### Press Play to Watch GIF ▶️
![message-app](https://github.com/user-attachments/assets/ef3ad7ee-6e4f-4e0a-ab7f-8f1814b5307c)
### Friends List and Chat
![Vite-React-TS-05-30-2025_03_46_PM](https://github.com/user-attachments/assets/bc384d17-2612-41ac-aeaf-a77aaeea9ce8)
### Invite Friends
![Vite-React-TS-05-30-2025_03_49_PM](https://github.com/user-attachments/assets/871b5b18-6085-4695-887d-f87bd5eaddda)
### Request Notifications
![Vite-React-TS-05-30-2025_03_52_PM](https://github.com/user-attachments/assets/6bd517bb-c703-486f-b883-373807bd8d73)
### User Settings
![Vite-React-TS-05-30-2025_03_47_PM (1)](https://github.com/user-attachments/assets/2f8425fe-5fbb-400d-9534-8b14c700e996)
### Login Screen
![Vite-React-TS-05-30-2025_03_53_PM](https://github.com/user-attachments/assets/5c7dd293-3386-4ab0-bc9f-1d9b03a77dcc)
### Light Theme
![Vite-React-TS-05-30-2025_03_47_PM](https://github.com/user-attachments/assets/3b63327f-4c66-4b37-a78f-3d03b7e2f736)


### 📋 Details
Frontend (React + TypeScript)
- Built with React, TypeScript, and Vite
- Uses Jotai for state management (a more modern alternative to Redux)
- Implements responsive design with light/dark theme support
- Features comprehensive UI components for messaging, friend requests, and user authentication
- Structured code organization with proper separation of concerns

Backend (Node.js + Express)
- Express server with RESTful API endpoints
- MongoDB integration with proper repository patterns
- JWT authentication with refresh token mechanism
- Socket.io implementation for real-time communication
- Dependency injection

Security Implementations
- JWT with separate access and refresh tokens for enhanced security
- Password hashing with bcrypt using salt rounds
- Token versioning mechanism for invalidation (preventing reuse of old tokens)
- Comprehensive auth middleware with error handling

Architecture
- Clear separation between frontend and backend
- Repository pattern for data access abstraction
- Service layer for business logic encapsulation
- Controller layer handling API endpoints
- Proper error handling and status codes

Features
- User authentication with signup/login workflows
- Friend request system with accept/reject functionality
- Real-time messaging with message status indicators(Currently in progress)
- User online status tracking
- Responsive UI that works across device sizes

## 🏗️ Clean Architecture Implementation
This project follows Domain-Driven Design and Clean Architecture principles:

- **Interface Layer**: Controllers and routes that handle HTTP requests
- **Application Layer**: Services that coordinate domain actions
- **Repository Layer**: External concerns like databases and messaging

The architecture employs the Dependency Inversion Principle, ensuring high-level modules don't depend on low-level implementations. Key architectural features include:

- **NotificationService**: Abstracts all real-time communication, decoupling controllers from Socket.IO
- **Strong boundary enforcement**: Each layer has a clear responsibility
- **Dependency injection**: Services receive their dependencies rather than creating them
- **Loose coupling**: Components depend on abstractions rather than concrete implementations

## 💻 Real-time Communication
- Socket.IO implementation with clean architectural separation
- Centralized notification system for consistent real-time events
- Proper handling of user connection/disconnection events
- Live status updates for friends
- Real-time message delivery with typing indicators

## 🔮 Future Enhancements(Coming in the future)
- Enhanced notifications and real-time features
- End-to-end encryption for messages
- Additional profile features
- Group chat functionality
- Voice and video calling features
