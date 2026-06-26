# Socket Chat Application

A premium real-time chat application with room-based communication, built with Node.js, Express, Socket.IO, and MongoDB. Features JWT-based authentication with user registration and login.

## Features

- **User Authentication** — Register and login with JWT-based token authentication
- **Real-time Messaging** — Instant message delivery via WebSockets (Socket.IO)
- **Room-based Chat** — Create and join chat rooms; messages are scoped per room
- **User Presence** — See who is currently in each room, updated in real-time
- **Persistent Users** — User accounts stored in MongoDB with bcrypt password hashing
- **Session Persistence** — JWT token stored client-side for persistent sessions
- **Timestamped Messages** — Every message includes an ISO timestamp

## Project Structure

```
chat-app/
├── public/               # Static assets (HTML, CSS, client-side JS)
├── src/
│   ├── middleware/
│   │   └── auth.js       # JWT verification middleware (HTTP + Socket.IO)
│   ├── models/
│   │   └── User.js       # Mongoose User model (username, password hash)
│   └── routes/
│       └── auth.js       # Auth routes: /api/login, /api/register, /api/logout
├── server.js             # Main server (Express + Socket.IO + MongoDB)
├── package.json          # Project dependencies and scripts
├── test_login.js         # Login test script
├── test_register.js      # Registration test script
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Architecture

1. **Server Initialization** — Express server with HTTP wrapper for Socket.IO; connects to MongoDB via Mongoose
2. **Authentication** — Users register (`POST /api/register`) or login (`POST /api/login`) to receive a JWT token (24h expiry)
3. **Socket.IO Connection** — Client connects with the JWT token in `auth.token`; verified by `socketAuthMiddleware`
4. **Room Management** — In-memory `rooms` object tracks users per room using Sets of `{ id, username }` objects
5. **Messaging** — Messages are broadcast to all users in the same room with sender username and timestamp
6. **Disconnect Cleanup** — On disconnect, user is removed from all rooms and other users are notified

### Socket.IO Events

| Event             | Direction                | Description                                                           |
| ----------------- | ------------------------ | --------------------------------------------------------------------- |
| `connection`      | Client → Server          | New client connects (authenticated via middleware)                    |
| `join-room`       | Client → Server          | User joins a room; server emits `user-joined` and `user-list`         |
| `send-message`    | Client → Server          | User sends a message; server broadcasts `receive-message` to the room |
| `leave-room`      | Client → Server          | User leaves a room; server emits `user-left`                          |
| `disconnect`      | Client → Server          | Client disconnects; cleanup removes user from all rooms               |
| `user-joined`     | Server → Client (room)   | Broadcast when a user joins the room                                  |
| `user-left`       | Server → Client (room)   | Broadcast when a user leaves the room or disconnects                  |
| `user-list`       | Server → Client (joiner) | Current user list sent to the user who just joined                    |
| `receive-message` | Server → Client (room)   | A new message in the room                                             |

### API Routes

| Method | Path            | Description                                          |
| ------ | --------------- | ---------------------------------------------------- |
| `POST` | `/api/register` | Register a new user (body: `{ username, password }`) |
| `POST` | `/api/login`    | Login (body: `{ username, password }`)               |
| `POST` | `/api/logout`   | Logout (returns `{ ok: true }`)                      |

## Setup Instructions

### Prerequisites

- **Node.js** (v24 LTS recommended)
- **npm** (comes with Node.js)
- **MongoDB** instance (local or remote, e.g. MongoDB Atlas)

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

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/chat-app?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

   | Variable     | Required | Description                                   |
   | ------------ | -------- | --------------------------------------------- |
   | `MONGO_URI`  | Yes      | MongoDB connection string                     |
   | `JWT_SECRET` | Yes      | Secret key used to sign and verify JWT tokens |
   | `PORT`       | No       | Server port (default: `5000`)                 |

4. **Start the development server**

   ```bash
   npm run dev
   ```

   For production:

   ```bash
   npm start
   ```

5. **Access the application**

   Open your browser and navigate to `http://localhost:<PORT>` (default: `5000`).

## Usage

1. Open the application in multiple browser tabs/windows
2. Register a new account (or login if you already have one)
3. Enter or select a room to join
4. Start chatting with other users in the same room
5. Messages appear instantly with timestamps and sender usernames
6. See real-time updates when users join or leave the room

## Dependencies

| Package          | Version         | Purpose                                |
| ---------------- | --------------- | -------------------------------------- |
| **express**      | ^5.2.1          | Web framework                          |
| **socket.io**    | ^4.8.3          | Real-time bidirectional communication  |
| **mongoose**     | ^9.7.2          | MongoDB ODM                            |
| **bcryptjs**     | ^3.0.3          | Password hashing                       |
| **jsonwebtoken** | ^9.0.3          | JWT token signing and verification     |
| **dotenv**       | ^16.4.7         | Environment variable loading           |
| **nodemon**      | ^3.1.14 _(dev)_ | Auto-restart server during development |

## License

ISC — see `package.json` for details.
