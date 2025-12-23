// UI module - handles all UI interactions and updates
const UI = {
    // Initialize UI
    init() {
        this.loginScreen = document.getElementById('login-screen');
        this.chatScreen = document.getElementById('chat-screen');
        this.loginBtn = document.getElementById('login-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.loginError = document.getElementById('login-error');
        this.roomsList = document.getElementById('rooms-list');
        this.messagesContainer = document.getElementById('messages-container');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.currentRoomName = document.getElementById('current-room-name');
        this.createRoomBtn = document.getElementById('create-room-btn');
        this.createRoomModal = document.getElementById('create-room-modal');
        this.userDisplayName = document.getElementById('user-display-name');
        
        // Stats elements
        this.userXP = document.getElementById('user-xp');
        this.userMessages = document.getElementById('user-messages');
        this.userCalls = document.getElementById('user-calls');

        this.setupEventListeners();
    },

    setupEventListeners() {
        // Login
        this.loginBtn.addEventListener('click', () => this.handleLogin());
        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        // Logout
        this.logoutBtn.addEventListener('click', () => this.handleLogout());

        // Send message
        this.sendBtn.addEventListener('click', () => this.handleSendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSendMessage();
        });

        // Create room
        this.createRoomBtn.addEventListener('click', () => this.showCreateRoomModal());
        document.getElementById('cancel-room-btn').addEventListener('click', () => this.hideCreateRoomModal());
        document.getElementById('confirm-room-btn').addEventListener('click', () => this.handleCreateRoom());

        // Call buttons
        document.getElementById('voice-call-btn').addEventListener('click', () => Calls.startCall(false));
        document.getElementById('video-call-btn').addEventListener('click', () => Calls.startCall(true));
    },

    async handleLogin() {
        const homeserver = document.getElementById('homeserver').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!homeserver || !username || !password) {
            this.showLoginError('Please fill in all fields');
            return;
        }

        this.loginBtn.disabled = true;
        this.loginBtn.textContent = 'Logging in...';
        this.loginError.textContent = '';

        try {
            await MatrixClientModule.login(homeserver, username, password);
            this.showChatScreen();
            this.userDisplayName.textContent = username;
            
            // Load user stats
            this.updateStats();
        } catch (error) {
            this.showLoginError('Login failed: ' + error.message);
        } finally {
            this.loginBtn.disabled = false;
            this.loginBtn.textContent = 'Login';
        }
    },

    async handleLogout() {
        await MatrixClientModule.logout();
        this.showLoginScreen();
        this.clearChat();
    },

    showLoginError(message) {
        this.loginError.textContent = message;
    },

    showLoginScreen() {
        this.loginScreen.classList.remove('hidden');
        this.chatScreen.classList.add('hidden');
    },

    showChatScreen() {
        this.loginScreen.classList.add('hidden');
        this.chatScreen.classList.remove('hidden');
    },

    updateRoomsList() {
        this.roomsList.innerHTML = '';
        
        MatrixClientModule.rooms.forEach((room, roomId) => {
            const roomElement = document.createElement('div');
            roomElement.className = 'room-item';
            if (MatrixClientModule.currentRoom?.roomId === roomId) {
                roomElement.classList.add('active');
            }

            const roomName = room.name || 'Unnamed Room';
            
            roomElement.innerHTML = `
                <div class="room-name">${this.escapeHtml(roomName)}</div>
            `;

            roomElement.addEventListener('click', () => {
                MatrixClientModule.switchRoom(roomId);
            });

            this.roomsList.appendChild(roomElement);
        });
    },

    displayRoom(room) {
        this.currentRoomName.textContent = room.name || 'Unnamed Room';
        this.messageInput.disabled = false;
        this.sendBtn.disabled = false;
        document.getElementById('voice-call-btn').disabled = false;
        document.getElementById('video-call-btn').disabled = false;
        
        // Update active room in list
        this.updateRoomsList();
    },

    displayMessages(messages) {
        this.messagesContainer.innerHTML = '';
        messages.forEach(msg => this.displayMessage(msg));
        this.scrollToBottom();
    },

    displayMessage(message) {
        // Remove welcome message if it exists
        const welcomeMsg = this.messagesContainer.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'message';

        const displayName = MatrixClientModule.getUserDisplayName(message.sender);
        const initial = displayName.charAt(0).toUpperCase();
        const time = new Date(message.timestamp).toLocaleTimeString();

        messageElement.innerHTML = `
            <div class="message-avatar">${initial}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${this.escapeHtml(displayName)}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-text">${this.escapeHtml(message.text)}</div>
            </div>
        `;

        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    },

    async handleSendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;

        try {
            await MatrixClientModule.sendMessage(text);
            this.messageInput.value = '';
        } catch (error) {
            alert('Failed to send message: ' + error.message);
        }
    },

    showCreateRoomModal() {
        this.createRoomModal.classList.remove('hidden');
        document.getElementById('room-name-input').focus();
    },

    hideCreateRoomModal() {
        this.createRoomModal.classList.add('hidden');
        document.getElementById('room-name-input').value = '';
    },

    async handleCreateRoom() {
        const roomName = document.getElementById('room-name-input').value.trim();
        if (!roomName) {
            alert('Please enter a room name');
            return;
        }

        try {
            await MatrixClientModule.createRoom(roomName);
            this.hideCreateRoomModal();
        } catch (error) {
            alert('Failed to create room: ' + error.message);
        }
    },

    async updateStats() {
        const userId = MatrixClientModule.client?.getUserId();
        if (!userId) return;

        const stats = await API.getUserStats(userId);
        this.userXP.textContent = stats.xp;
        this.userMessages.textContent = stats.messages;
        this.userCalls.textContent = stats.calls;
    },

    clearChat() {
        this.roomsList.innerHTML = '';
        this.messagesContainer.innerHTML = '<div class="welcome-message"><h2>Welcome to PrivaChat! 🔒</h2><p>Select a room from the sidebar or create a new one to start chatting.</p></div>';
        this.messageInput.value = '';
        this.messageInput.disabled = true;
        this.sendBtn.disabled = true;
        this.currentRoomName.textContent = 'Select a room';
        this.userXP.textContent = '0';
        this.userMessages.textContent = '0';
        this.userCalls.textContent = '0';
    },

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
