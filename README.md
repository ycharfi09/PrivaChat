# PrivaChat 🔒

A private, self-hosted messaging and calling application built with Matrix protocol for end-to-end encrypted communication.

## Features

- **End-to-End Encrypted Messaging**: Built on Matrix (Synapse) protocol with industry-standard encryption
- **Voice & Video Calls**: WebRTC-based calling with support for voice and video
- **Privacy-Focused**: No data mining, no tracking, self-hosted solution
- **Clean Dark Mode UI**: Modern, responsive interface with dark theme
- **User Stats & XP**: Track your activity with custom REST API
- **Room Management**: Create and join encrypted chat rooms
- **Modular Architecture**: Clean separation of concerns for maintainability

## Tech Stack

### Frontend
- **HTML/CSS/JavaScript**: Pure web technologies, no frameworks
- **Matrix JS SDK**: Official Matrix client library for messaging and WebRTC calls
- **Dark Theme**: Modern, eye-friendly interface

### Backend
- **Matrix (Synapse)**: Self-hosted homeserver for encrypted messaging
- **Express.js**: REST API server for custom features
- **SQLite**: Lightweight database for profiles and stats
- **WebRTC**: Peer-to-peer voice and video calling

## Architecture

```
PrivaChat/
├── index.html          # Main HTML file
├── styles.css          # Dark mode styling
├── js/
│   ├── app.js         # Application entry point
│   ├── config.js      # Configuration settings
│   ├── matrix-client.js # Matrix protocol integration
│   ├── ui.js          # UI management
│   ├── calls.js       # WebRTC call handling
│   └── api.js         # Custom REST API client
├── server/
│   └── index.js       # Express REST API server
└── package.json       # Dependencies
```

## Setup Instructions

### Prerequisites

1. **Node.js** (v14 or higher)
2. **Matrix Homeserver** (Synapse or compatible)
   - You can use a public homeserver like `matrix.org` for testing
   - For production, set up your own Synapse server

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ycharfi09/PrivaChat.git
   cd PrivaChat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser to `http://localhost:3000`

## Configuration

Edit `js/config.js` to customize settings:

```javascript
const CONFIG = {
    // Custom API server URL
    API_URL: 'http://localhost:3000/api',
    
    // Matrix configuration
    MATRIX: {
        DEFAULT_HOMESERVER: 'https://matrix.org',
        STORAGE_KEY: 'privachat_session'
    },
    
    // Feature flags
    FEATURES: {
        VOICE_CALLS: true,
        VIDEO_CALLS: true,
        STATS_TRACKING: true
    }
};
```

## Usage

### First Time Setup

1. **Login**
   - Enter your Matrix homeserver URL (e.g., `https://matrix.org`)
   - Provide your Matrix username and password
   - Click "Login"

2. **Create or Join Rooms**
   - Click the "➕" button to create a new room
   - Click on any room in the sidebar to join the conversation

3. **Send Messages**
   - Type in the message input field
   - Press Enter or click "Send"

4. **Start Calls**
   - Click the phone icon (📞) for voice calls
   - Click the video icon (📹) for video calls

### Privacy & Security

- **End-to-End Encryption**: All messages are encrypted by default using Matrix's Olm/Megolm protocol
- **Self-Hosted**: Run your own Matrix homeserver for complete control
- **No Third-Party Tracking**: No analytics, no data collection
- **WebRTC**: Direct peer-to-peer calling for voice and video

## API Endpoints

The custom REST API provides the following endpoints:

### Profiles
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile/:userId` - Update user profile

### Stats
- `GET /api/stats/:userId` - Get user statistics (XP, messages, calls)
- `POST /api/stats/:userId` - Update user statistics

### Health
- `GET /api/health` - Check API status

## Development

### Project Structure

- **Modular JavaScript**: Each module handles a specific concern
  - `config.js`: Configuration management
  - `api.js`: Custom API interactions
  - `matrix-client.js`: Matrix protocol wrapper
  - `ui.js`: UI rendering and updates
  - `calls.js`: WebRTC call management
  - `app.js`: Application initialization

### Adding Features

1. **Frontend**: Add new modules in `js/` directory
2. **Backend**: Add new endpoints in `server/index.js`
3. **Styling**: Update `styles.css` for UI changes

## Security Considerations

- **Do Not Reinvent Encryption**: This app uses Matrix's battle-tested encryption
- **HTTPS Required**: Use HTTPS in production for secure connections
- **Secure Your Homeserver**: Follow Matrix security best practices
- **Regular Updates**: Keep dependencies updated for security patches

## Troubleshooting

### Connection Issues
- Verify homeserver URL is correct and accessible
- Check if homeserver supports client-server API
- Ensure CORS is enabled on your homeserver

### Call Issues
- Grant browser permissions for microphone/camera
- Check network connectivity (WebRTC requires open network)
- Verify both peers have compatible browsers

### Database Issues
- Delete `privachat.db` to reset stats and profiles
- Check file permissions in server directory

## License

MIT License - Feel free to use and modify for your needs.

## Contributing

Contributions welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions:
- Open an issue on GitHub
- Check Matrix.org documentation for protocol questions

## Acknowledgments

- **Matrix.org**: For the amazing protocol and SDK
- **Matrix JS SDK**: For the client library
- **WebRTC**: For enabling peer-to-peer communication
