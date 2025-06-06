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


### 📋 Key Features
- **Authentication**: Complete signup/login workflows with JWT refresh token mechanism
- **Friend System**: Send, accept, and reject friend requests with real-time notifications
- **Real-time Messaging**: Live chat with typing indicators and message status tracking
- **User Status**: Online/offline status tracking for friends
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Theme Support**: Light and dark mode toggle
- **Security**: Password hashing, token versioning, and comprehensive auth middleware

## 🏗️ Architecture & Implementation

This project follows **Clean Architecture** and **Domain-Driven Design** principles with clear separation of concerns:

### Backend Architecture
- **Interface Layer**: Controllers and routes handling HTTP requests
- **Application Layer**: Services coordinating domain actions  
- **Repository Layer**: Data access abstraction for MongoDB
- **Dependency Injection**: Services receive dependencies rather than creating them
- **NotificationService**: Abstracts Socket.IO communication from business logic

### Frontend Architecture  
- **Component-based**: React with TypeScript for type safety
- **State Management**: Jotai for efficient, atomic state updates
- **Service Layer**: Dedicated services for API communication and caching
- **Observable Pattern**: Real-time updates using custom Observable implementation

### Security Features
- **JWT Authentication**: Separate access/refresh tokens with versioning
- **Password Security**: bcrypt hashing with salt rounds
- **Token Management**: Automatic refresh and invalidation mechanisms
- **Request Validation**: Zod schemas for input validation

## 🔮 Future Enhancements(Coming in the future)
- End-to-end encryption for messages
- Additional profile features
- Group chat functionality
- Voice and video calling features
