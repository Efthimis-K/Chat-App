import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

app.use(express.static('public'));

const rooms = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', ({ username, room }) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = new Set();
    }

    rooms[room].add({ id: socket.id, username });

    socket.to(room).emit('user-joined', { username, users: Array.from(rooms[room]) });
    socket.emit('user-list', Array.from(rooms[room]));

    console.log(`User ${username} joined room: ${room}`);
  });

  socket.on('send-message', ({ username, room, message }) => {
    const messageData = {
      username,
      message,
      timestamp: new Date().toISOString()
    };

    io.to(room).emit('receive-message', messageData);
    console.log(`Message in ${room}: ${username}: ${message}`);
  });

  socket.on('leave-room', ({ username, room }) => {
    socket.leave(room);

    if (rooms[room]) {
      const user = Array.from(rooms[room]).find(u => u.id === socket.id);
      rooms[room].delete(user);

      io.to(room).emit('user-left', {
        username: username,
        users: Array.from(rooms[room])
      });

      console.log(`User ${username} left room: ${room}`);

      if (rooms[room].size === 0) {
        delete rooms[room];
      }
    }
  });

  socket.on('disconnect', () => {
    for (const room in rooms) {
      if (rooms[room].has(socket.id)) {
        const user = Array.from(rooms[room]).find(u => u.id === socket.id);
        rooms[room].delete(user);

        io.to(room).emit('user-left', {
          username: user?.username || 'Unknown',
          users: Array.from(rooms[room])
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
