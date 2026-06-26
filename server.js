import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
import authRouter from "./src/routes/auth.js";
import { socketAuthMiddleware } from "./src/middleware/auth.js";

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI || !JWT_SECRET) {
  console.error("MONGO_URI and JWT_SECRET environment variables are required");
  process.exit(1);
}

mongoose.connect(MONGO_URI).catch((err) => {
  console.error("Failed to connect to MongoDB:", err.message);
  process.exit(1);
});

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static("public"));
app.use("/api", authRouter);

io.use(socketAuthMiddleware);

const rooms = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.username} (${socket.id})`);

  socket.on("join-room", ({ room }) => {
    const username = socket.user.username;
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = new Set();
    }

    rooms[room].add({ id: socket.id, username });

    socket
      .to(room)
      .emit("user-joined", { username, users: Array.from(rooms[room]) });
    socket.emit("user-list", Array.from(rooms[room]));

    console.log(`User ${username} joined room: ${room}`);
  });

  socket.on("send-message", ({ room, message }) => {
    const username = socket.user.username;
    const messageData = {
      username,
      message,
      timestamp: new Date().toISOString(),
    };

    io.to(room).emit("receive-message", messageData);
    console.log(`Message in ${room}: ${username}: ${message}`);
  });

  socket.on("leave-room", ({ room }) => {
    const username = socket.user.username;
    socket.leave(room);

    if (rooms[room]) {
      const user = Array.from(rooms[room]).find((u) => u.id === socket.id);
      rooms[room].delete(user);

      io.to(room).emit("user-left", {
        username: username,
        users: Array.from(rooms[room]),
      });

      console.log(`User ${username} left room: ${room}`);

      if (rooms[room].size === 0) {
        delete rooms[room];
      }
    }
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      if (rooms[room].has(socket.id)) {
        const user = Array.from(rooms[room]).find((u) => u.id === socket.id);
        rooms[room].delete(user);

        io.to(room).emit("user-left", {
          username: user?.username || "Unknown",
          users: Array.from(rooms[room]),
        });

        console.log(`User ${user?.username} left room: ${room}`);

        if (rooms[room].size === 0) {
          delete rooms[room];
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
