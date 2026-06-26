let socket = null;
let currentUsername = "";
let currentRoom = "";

const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");
const loginForm = document.getElementById("loginForm");
const toggleSignupBtn = document.getElementById("toggleSignup");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const authToggleText = document.querySelector(".auth-toggle");

let isSignupMode = false;
const messageForm = document.getElementById("messageForm");
const messagesContainer = document.getElementById("messagesContainer");
const messages = document.getElementById("messages");
const userList = document.getElementById("userList");
const currentUserEl = document.getElementById("currentUser");
const currentRoomEl = document.getElementById("currentRoom");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");
const logoutBtn = document.getElementById("logoutBtn");

function connectSocket(token) {
  socket = io({ auth: { token } });

  socket.on("connect_error", (err) => {
    if (err.message === "Unauthorized") {
      localStorage.removeItem("token");
      showLoginScreen();
    }
  });

  socket.on("user-joined", ({ username, users }) => {
    addSystemMessage(`${username} joined the room`);
    updateUserList(users);
  });

  socket.on("user-left", ({ username, users }) => {
    addSystemMessage(`${username} left the room`);
    updateUserList(users);
  });

  socket.on("receive-message", ({ username, message, timestamp }) => {
    addMessage(username, message, timestamp, username === currentUsername);
  });

  socket.on("user-list", (users) => {
    updateUserList(users);
  });

  socket.on("disconnect", () => {
    addSystemMessage("Disconnected from server");
  });

  socket.on("connect", () => {
    if (currentUsername && currentRoom) {
      socket.emit("join-room", { room: currentRoom });
    }
  });
}

function showLoginScreen() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  messages.innerHTML = "";
  userList.innerHTML = "";
  currentUsername = "";
  currentRoom = "";
  chatScreen.style.display = "none";
  loginScreen.style.display = "flex";
  document.getElementById("usernameInput").value = "";
  document.getElementById("passwordInput").value = "";
  document.getElementById("roomSelect").selectedIndex = 0;
  const roomSelect = document.getElementById("roomSelect");
  roomSelect.style.display = "";
  roomSelect.required = true;
  isSignupMode = false;
  loginSubmitBtn.textContent = "Join Chat";
  toggleSignupBtn.textContent = "Sign up";
  authToggleText.childNodes[0].textContent = "Don't have an account? ";
  document.getElementById("loginScreen").querySelector("h1").textContent =
    "Welcome to Chat";
}

toggleSignupBtn.addEventListener("click", () => {
  isSignupMode = !isSignupMode;
  loginSubmitBtn.textContent = isSignupMode ? "Sign Up" : "Join Chat";
  toggleSignupBtn.textContent = isSignupMode ? "Log in" : "Sign up";
  authToggleText.childNodes[0].textContent = isSignupMode
    ? "Already have an account? "
    : "Don't have an account? ";
  document.getElementById("loginScreen").querySelector("h1").textContent =
    isSignupMode ? "Create Account" : "Welcome to Chat";
  const roomSelect = document.getElementById("roomSelect");
  roomSelect.style.display = isSignupMode ? "none" : "";
  roomSelect.required = !isSignupMode;
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("usernameInput").value.trim();
  const password = document.getElementById("passwordInput").value;
  const room = document.getElementById("roomSelect").value;

  if (username && password && (isSignupMode || room)) {
    const endpoint = isSignupMode ? "/api/register" : "/api/login";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        addSystemMessage(
          data.error || (isSignupMode ? "Sign up failed" : "Login failed"),
        );
        return;
      }

      if (isSignupMode) {
        addSystemMessage("Account created successfully! You can now log in.");
        document.getElementById("usernameInput").value = "";
        document.getElementById("passwordInput").value = "";
        toggleSignupBtn.click();
        return;
      }

      const { token } = await res.json();
      localStorage.setItem("token", token);
      currentUsername = username;
      currentRoom = room;

      connectSocket(token);

      loginScreen.style.display = "none";
      chatScreen.style.display = "flex";

      currentUserEl.textContent = username;
      currentRoomEl.textContent = currentRoom;

      addSystemMessage(`You joined the ${currentRoom} room`);
    } catch {
      addSystemMessage(isSignupMode ? "Sign up failed" : "Login failed");
    }
  }
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (message && socket) {
    socket.emit("send-message", {
      room: currentRoom,
      message,
    });

    messageInput.value = "";
    messageInput.focus();
  }
});

leaveRoomBtn.addEventListener("click", () => {
  if (currentUsername && currentRoom && socket) {
    socket.emit("leave-room", { room: currentRoom });

    messages.innerHTML = "";
    userList.innerHTML = "";

    currentUsername = "";
    currentRoom = "";

    chatScreen.style.display = "none";
    loginScreen.style.display = "flex";

    document.getElementById("usernameInput").value = "";
    document.getElementById("passwordInput").value = "";
    document.getElementById("roomSelect").selectedIndex = 0;
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  showLoginScreen();
});

function addMessage(username, message, timestamp, isOwn) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isOwn ? "own" : ""}`;

  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
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
  const systemDiv = document.createElement("div");
  systemDiv.className = "system-message";
  systemDiv.textContent = text;

  messages.appendChild(systemDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateUserList(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user.username;
    if (user.username === currentUsername) {
      li.style.background = "rgba(102, 126, 234, 0.2)";
      li.textContent += " (You)";
    }
    userList.appendChild(li);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
