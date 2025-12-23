// Configuration for PrivaChat
const CONFIG = {
    // Custom API server URL (for profiles, XP, stats)
    // Uses relative URL to work in any deployment environment
    API_URL: window.location.origin + '/api',
    
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
