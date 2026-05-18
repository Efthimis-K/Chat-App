# Socket Chat Application

A real-time chat application built with Node.js, Express, and Socket.IO that supports room-based communication.

## Features

- Real-time messaging using WebSockets (Socket.IO)
- Room-based chat system (users can join/leave rooms)
- User presence tracking (see who's in each room)
- Persistent username per session
- Timestamped messages
- Responsive design (serves static files from `public` directory)

## Project Structure

```
chat-app/
├── public/           # Static assets (HTML, CSS, client-side JS)
├── server.js         # Main server logic (Express + Socket.IO)
├── package.json      # Project dependencies and scripts
├── .env              # Environment variables (PORT)
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Logic Overview

1. **Server Initialization**: Express server created with HTTP wrapper for Socket.IO
2. **Middleware**: Serves static files from `public/` and enables CORS for all origins
3. **Socket.IO Events**:
   - `connection`: Handles new client connections
   - `join-room`: Users join a room, updates room user list, notifies others
   - `send-message`: Broadcasts messages to all users in the same room
   - `leave-room`: Users leave a room, updates user list
   - `disconnect`: Handles client disconnections, cleans up room data
4. **Room Management**: In-memory `rooms` object tracks users per room using Sets
5. **Server Start**: Listens on port from `.env` or defaults to 5000

## Setup Instructions

### Prerequisites

- Node.js (v24 LTS recommended)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env` (if not already present)
   - Adjust PORT if needed (default: 3000 from .env, fallback: 5000)

4. **Start the development server**
   ```bash
   npm run dev
   ```
   For production:
   ```bash
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:<PORT>` (where PORT is from .env or 5000)

### Environment Variables

Create a `.env` file in the root directory with:
```
PORT=3000
```

## Usage

1. Open the application in multiple browser tabs/windows
2. Enter a username and select/join a room
3. Start chatting with others in the same room
4. See real-time updates when users join/leave rooms
5. Messages appear instantly with timestamps

## Dependencies

- **express**: ^5.2.1 - Web framework for Node.js
- **socket.io**: ^4.8.3 - Real-time bidirectional event-based communication
- **nodemon**: ^3.1.14 (dev) - Auto-restarts server during development


## License

This project is licensed under the ISC License - see the `package.json` file for details.