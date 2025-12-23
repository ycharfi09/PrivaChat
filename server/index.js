const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const db = new Database('privachat.db');

// Create tables if they don't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
        user_id TEXT PRIMARY KEY,
        display_name TEXT,
        avatar_url TEXT,
        bio TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS stats (
        user_id TEXT PRIMARY KEY,
        xp INTEGER DEFAULT 0,
        messages INTEGER DEFAULT 0,
        calls INTEGER DEFAULT 0,
        last_updated INTEGER DEFAULT (strftime('%s', 'now'))
    );
`);

console.log('Database initialized');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// API Routes

// Get user profile
app.get('/api/profile/:userId', (req, res) => {
    const { userId } = req.params;
    
    try {
        const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
        
        if (profile) {
            res.json(profile);
        } else {
            res.status(404).json({ error: 'Profile not found' });
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create or update user profile
app.put('/api/profile/:userId', (req, res) => {
    const { userId } = req.params;
    const { display_name, avatar_url, bio } = req.body;
    
    try {
        const stmt = db.prepare(`
            INSERT INTO profiles (user_id, display_name, avatar_url, bio)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                display_name = excluded.display_name,
                avatar_url = excluded.avatar_url,
                bio = excluded.bio
        `);
        
        stmt.run(userId, display_name, avatar_url, bio);
        
        const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
        res.json(profile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user stats
app.get('/api/stats/:userId', (req, res) => {
    const { userId } = req.params;
    
    try {
        let stats = db.prepare('SELECT * FROM stats WHERE user_id = ?').get(userId);
        
        if (!stats) {
            // Create default stats if they don't exist
            const stmt = db.prepare('INSERT INTO stats (user_id) VALUES (?)');
            stmt.run(userId);
            stats = db.prepare('SELECT * FROM stats WHERE user_id = ?').get(userId);
        }
        
        res.json({
            xp: stats.xp,
            messages: stats.messages,
            calls: stats.calls
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user stats
app.post('/api/stats/:userId', (req, res) => {
    const { userId } = req.params;
    const { type, increment } = req.body;
    
    if (!type || !['xp', 'messages', 'calls'].includes(type)) {
        return res.status(400).json({ error: 'Invalid stat type' });
    }
    
    try {
        // Ensure stats record exists
        const existingStats = db.prepare('SELECT * FROM stats WHERE user_id = ?').get(userId);
        if (!existingStats) {
            const stmt = db.prepare('INSERT INTO stats (user_id) VALUES (?)');
            stmt.run(userId);
        }
        
        // Update the specific stat
        const stmt = db.prepare(`
            UPDATE stats 
            SET ${type} = ${type} + ?, last_updated = strftime('%s', 'now')
            WHERE user_id = ?
        `);
        
        stmt.run(increment || 1, userId);
        
        const stats = db.prepare('SELECT * FROM stats WHERE user_id = ?').get(userId);
        res.json({
            xp: stats.xp,
            messages: stats.messages,
            calls: stats.calls
        });
    } catch (error) {
        console.error('Error updating stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'PrivaChat API is running' });
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`PrivaChat server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    db.close();
    process.exit(0);
});
