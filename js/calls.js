// Calls module - handles WebRTC voice and video calls
const Calls = {
    currentCall: null,
    localStream: null,
    isVideoEnabled: false,
    isMuted: false,

    // Initialize call functionality
    init() {
        this.callScreen = document.getElementById('call-screen');
        this.chatArea = document.getElementById('chat-area');
        this.localVideo = document.getElementById('local-video');
        this.remoteVideo = document.getElementById('remote-video');
        this.callStatus = document.getElementById('call-status');
        this.muteBtn = document.getElementById('mute-btn');
        this.endCallBtn = document.getElementById('end-call-btn');
        this.videoToggleBtn = document.getElementById('video-toggle-btn');

        this.setupCallListeners();
    },

    setupCallListeners() {
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.endCallBtn.addEventListener('click', () => this.endCall());
        this.videoToggleBtn.addEventListener('click', () => this.toggleVideo());

        // Listen for incoming calls
        if (MatrixClientModule.client) {
            MatrixClientModule.client.on('Call.incoming', (call) => {
                this.handleIncomingCall(call);
            });
        }
    },

    // Start a new call
    async startCall(withVideo = false) {
        if (!MatrixClientModule.currentRoom) {
            alert('Please select a room first');
            return;
        }

        try {
            this.isVideoEnabled = withVideo;
            this.callStatus.textContent = 'Starting call...';
            this.showCallScreen();

            // Get local media stream
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: withVideo
            });

            this.localVideo.srcObject = this.localStream;

            // Create Matrix call
            const roomId = MatrixClientModule.currentRoom.roomId;
            this.currentCall = MatrixClientModule.client.createCall(roomId);

            // Set up call event listeners
            this.setupCallEventListeners();

            // Place the call
            await this.currentCall.placeCall(this.localStream);

            this.callStatus.textContent = 'Calling...';

            // Update stats
            const userId = MatrixClientModule.client.getUserId();
            await API.incrementCalls(userId);
            await API.awardXP(userId, 10);
            UI.updateStats();

        } catch (error) {
            console.error('Error starting call:', error);
            alert('Failed to start call: ' + error.message);
            this.endCall();
        }
    },

    // Handle incoming call
    handleIncomingCall(call) {
        this.currentCall = call;
        
        const answer = confirm('Incoming call. Accept?');
        
        if (answer) {
            this.answerCall();
        } else {
            call.hangup();
        }
    },

    // Answer an incoming call
    async answerCall() {
        try {
            this.callStatus.textContent = 'Answering call...';
            this.showCallScreen();

            // Get local media stream
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: this.isVideoEnabled
            });

            this.localVideo.srcObject = this.localStream;

            // Set up call event listeners
            this.setupCallEventListeners();

            // Answer the call
            await this.currentCall.answer(this.localStream);

            this.callStatus.textContent = 'Connected';

            // Update stats
            const userId = MatrixClientModule.client.getUserId();
            await API.incrementCalls(userId);
            await API.awardXP(userId, 10);
            UI.updateStats();

        } catch (error) {
            console.error('Error answering call:', error);
            alert('Failed to answer call: ' + error.message);
            this.endCall();
        }
    },

    // Set up call event listeners
    setupCallEventListeners() {
        if (!this.currentCall) return;

        this.currentCall.on('error', (error) => {
            console.error('Call error:', error);
            this.callStatus.textContent = 'Call error: ' + error.message;
        });

        this.currentCall.on('hangup', () => {
            this.callStatus.textContent = 'Call ended';
            setTimeout(() => this.endCall(), 2000);
        });

        this.currentCall.on('state', (state) => {
            console.log('Call state:', state);
            if (state === 'connected') {
                this.callStatus.textContent = 'Connected';
            } else if (state === 'connecting') {
                this.callStatus.textContent = 'Connecting...';
            }
        });

        this.currentCall.on('feeds_changed', () => {
            const feeds = this.currentCall.getRemoteFeeds();
            if (feeds.length > 0) {
                const remoteFeed = feeds[0];
                const remoteStream = remoteFeed.stream;
                this.remoteVideo.srcObject = remoteStream;
            }
        });
    },

    // Toggle mute
    toggleMute() {
        if (!this.localStream) return;

        this.isMuted = !this.isMuted;
        this.localStream.getAudioTracks().forEach(track => {
            track.enabled = !this.isMuted;
        });

        this.muteBtn.textContent = this.isMuted ? '🔇 Unmute' : '🎤 Mute';
    },

    // Toggle video
    toggleVideo() {
        if (!this.localStream) return;

        this.isVideoEnabled = !this.isVideoEnabled;
        this.localStream.getVideoTracks().forEach(track => {
            track.enabled = this.isVideoEnabled;
        });

        this.videoToggleBtn.textContent = this.isVideoEnabled ? '📹 Video On' : '📹 Video Off';
    },

    // End call
    endCall() {
        // Hang up the call
        if (this.currentCall) {
            this.currentCall.hangup();
            this.currentCall = null;
        }

        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // Clear video elements
        this.localVideo.srcObject = null;
        this.remoteVideo.srcObject = null;

        // Reset state
        this.isVideoEnabled = false;
        this.isMuted = false;
        this.muteBtn.textContent = '🎤 Mute';
        this.videoToggleBtn.textContent = '📹 Video';

        // Hide call screen
        this.hideCallScreen();
    },

    // Show call screen
    showCallScreen() {
        this.callScreen.classList.remove('hidden');
        this.chatArea.classList.add('hidden');
    },

    // Hide call screen
    hideCallScreen() {
        this.callScreen.classList.add('hidden');
        this.chatArea.classList.remove('hidden');
    }
};
