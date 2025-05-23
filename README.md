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
![Vite-React-TS-02-16-2025_07_04_PM](https://github.com/user-attachments/assets/cf701d83-cea5-4475-a957-8f7521141339)
### Invite Friends
![Vite-React-TS-02-16-2025_07_09_PM](https://github.com/user-attachments/assets/be4d376b-47c1-4eae-a6f8-a93b388d7971)
### User Settings
![settings](https://github.com/user-attachments/assets/9c263353-3fb6-4fe3-9830-c72c9a45e15c)
### Login Screen
![new-signup-screen](https://github.com/user-attachments/assets/0e0b44ca-c163-4580-bf0e-ef02276a6b65)
### Light Theme
![light-theme](https://github.com/user-attachments/assets/bf5602fb-b747-4452-9ce5-7b8dafeb8fa7)

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
