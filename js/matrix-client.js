// Matrix client module - handles Matrix protocol interactions
const MatrixClientModule = {
    client: null,
    currentRoom: null,
    rooms: new Map(),

    // Initialize and login to Matrix
    async login(homeserver, username, password) {
        try {
            // Create Matrix client
            this.client = matrixcs.createClient({
                baseUrl: homeserver
            });

            // Login
            const response = await this.client.login('m.login.password', {
                user: username,
                password: password
            });

            console.log('Login successful:', response);

            // Reinitialize client with access token
            this.client = matrixcs.createClient({
                baseUrl: homeserver,
                accessToken: response.access_token,
                userId: response.user_id
            });

            // Start syncing
            await this.startSync();

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Start syncing with the Matrix server
    async startSync() {
        // Set up event listeners
        this.client.on('Room.timeline', (event, room, toStartOfTimeline) => {
            if (toStartOfTimeline) return;
            if (event.getType() === 'm.room.message') {
                this.handleMessage(event, room);
            }
        });

        this.client.on('Room', (room) => {
            this.rooms.set(room.roomId, room);
            UI.updateRoomsList();
        });

        this.client.on('sync', (state, prevState, data) => {
            if (state === 'PREPARED') {
                console.log('Sync completed, ready to use');
                this.loadRooms();
            }
        });

        // Start client
        await this.client.startClient({ initialSyncLimit: 10 });
    },

    // Load all rooms
    loadRooms() {
        const rooms = this.client.getRooms();
        rooms.forEach(room => {
            this.rooms.set(room.roomId, room);
        });
        UI.updateRoomsList();
    },

    // Handle incoming messages
    handleMessage(event, room) {
        const sender = event.getSender();
        const content = event.getContent();
        
        if (room.roomId === this.currentRoom?.roomId) {
            UI.displayMessage({
                sender: sender,
                text: content.body,
                timestamp: event.getTs()
            });
        }

        // Award XP for sending messages (if it's the current user)
        if (sender === this.client.getUserId()) {
            API.awardXP(sender, 5);
            API.incrementMessages(sender);
            UI.updateStats();
        }
    },

    // Send a message
    async sendMessage(text) {
        if (!this.currentRoom) {
            throw new Error('No room selected');
        }

        try {
            await this.client.sendTextMessage(this.currentRoom.roomId, text);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    // Create a new room
    async createRoom(roomName) {
        try {
            const room = await this.client.createRoom({
                name: roomName,
                visibility: 'private',
                preset: 'trusted_private_chat'
            });
            console.log('Room created:', room.room_id);
            return room;
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    },

    // Join a room
    async joinRoom(roomId) {
        try {
            await this.client.joinRoom(roomId);
            console.log('Joined room:', roomId);
        } catch (error) {
            console.error('Error joining room:', error);
            throw error;
        }
    },

    // Switch to a different room
    switchRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            this.currentRoom = room;
            UI.displayRoom(room);
            this.loadRoomMessages(room);
        }
    },

    // Load messages for a room
    loadRoomMessages(room) {
        const timeline = room.timeline;
        const messages = [];

        for (let i = Math.max(0, timeline.length - 50); i < timeline.length; i++) {
            const event = timeline[i];
            if (event.getType() === 'm.room.message') {
                messages.push({
                    sender: event.getSender(),
                    text: event.getContent().body,
                    timestamp: event.getTs()
                });
            }
        }

        UI.displayMessages(messages);
    },

    // Get user display name
    getUserDisplayName(userId) {
        const member = this.currentRoom?.getMember(userId);
        return member?.name || userId;
    },

    // Logout
    async logout() {
        if (this.client) {
            await this.client.logout();
            this.client.stopClient();
            this.client = null;
            this.currentRoom = null;
            this.rooms.clear();
        }
    }
};
