### Installation and Development
// Client
<br/>`npm install`
<br/>`npm run dev`

// Server
<br/>`npm install`
<br/>`npm start`

### Notes
- A mongoDB database needs to be connected to use this project as is. An .env file in the server folder with the following keys is required:
MONGODB_URI,
JWT_SECRET,
ACCESS_TOKEN_EXPIRATION,
REFRESH_TOKEN_SECRET,
REFRESH_TOKEN_EXPIRATION,
PORT,
NODE_ENV.
- [Demo Video](https://youtu.be/mEsYUYDX8vM)

## 🧰 Tech Stack
- Frontend: React.js
- Backend: Express.js, Node.js
- Database: MongoDB
- Deployment: Vercel (frontend), Railway (backend)
  
### Friends List and Chat
![Vite-React-TS-02-16-2025_07_04_PM](https://github.com/user-attachments/assets/cf701d83-cea5-4475-a957-8f7521141339)
### Invite Friends
![Vite-React-TS-02-16-2025_07_09_PM](https://github.com/user-attachments/assets/be4d376b-47c1-4eae-a6f8-a93b388d7971)
### Login Screen
![new-signup-screen](https://github.com/user-attachments/assets/0e0b44ca-c163-4580-bf0e-ef02276a6b65)
### Light Theme
![light-theme](https://github.com/user-attachments/assets/bf5602fb-b747-4452-9ce5-7b8dafeb8fa7)

### Details
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
- Real-time messaging with message status indicators(In progress)
- User online status tracking
- Responsive UI that works across device sizes
