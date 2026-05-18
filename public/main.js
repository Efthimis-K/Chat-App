const socket = io();

let currentUsername = '';
let currentRoom = '';

const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const loginForm = document.getElementById('loginForm');
const messageForm = document.getElementById('messageForm');
const messagesContainer = document.getElementById('messagesContainer');
const messages = document.getElementById('messages');
const userList = document.getElementById('userList');
const currentUserEl = document.getElementById('currentUser');
const currentRoomEl = document.getElementById('currentRoom');
const leaveRoomBtn = document.getElementById('leaveRoomBtn');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('usernameInput').value.trim();
  const room = document.getElementById('roomSelect').value;

  if (username && room) {
    currentUsername = username;
    currentRoom = room;

    socket.emit('join-room', { username, room });

    loginScreen.style.display = 'none';
    chatScreen.style.display = 'flex';

    currentUserEl.textContent = username;
    currentRoomEl.textContent = room;

    addSystemMessage(`You joined the ${room} room`);
  }
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();

  if (message) {
    socket.emit('send-message', {
      username: currentUsername,
      room: currentRoom,
      message
    });

    messageInput.value = '';
    messageInput.focus();
  }
});

leaveRoomBtn.addEventListener('click', () => {
  if (currentUsername && currentRoom) {
    socket.emit('leave-room', { username: currentUsername, room: currentRoom });

    messages.innerHTML = '';
    userList.innerHTML = '';

    currentUsername = '';
    currentRoom = '';

    chatScreen.style.display = 'none';
    loginScreen.style.display = 'flex';

    document.getElementById('usernameInput').value = '';
    document.getElementById('roomSelect').selectedIndex = 0;
  }
});

socket.on('user-joined', ({ username, users }) => {
  addSystemMessage(`${username} joined the room`);
  updateUserList(users);
});

socket.on('user-left', ({ username, users }) => {
  addSystemMessage(`${username} left the room`);
  updateUserList(users);
});

socket.on('receive-message', ({ username, message, timestamp }) => {
  addMessage(username, message, timestamp, username === currentUsername);
});

socket.on('user-list', (users) => {
  updateUserList(users);
});

socket.on('disconnect', () => {
  addSystemMessage('Disconnected from server');
});

socket.on('connect', () => {
  if (currentUsername && currentRoom) {
    socket.emit('join-room', { username: currentUsername, room: currentRoom });
  }
});

function addMessage(username, message, timestamp, isOwn) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isOwn ? 'own' : ''}`;

  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  messageDiv.innerHTML = `
    <div class="username">${username}</div>
    <div class="content">${escapeHtml(message)}</div>
    <div class="timestamp">${time}</div>
  `;

  messages.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addSystemMessage(text) {
  const systemDiv = document.createElement('div');
  systemDiv.className = 'system-message';
  systemDiv.textContent = text;

  messages.appendChild(systemDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateUserList(users) {
  userList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user.username;
    if (user.username === currentUsername) {
      li.style.background = 'rgba(102, 126, 234, 0.2)';
      li.textContent += ' (You)';
    }
    userList.appendChild(li);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
