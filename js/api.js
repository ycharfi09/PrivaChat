// API module for custom REST endpoints (profiles, XP, stats)
const API = {
    // Get user profile
    async getUserProfile(userId) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/profile/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    },

    // Update user profile
    async updateUserProfile(userId, profileData) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });
            if (!response.ok) {
                throw new Error('Failed to update profile');
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating profile:', error);
            return null;
        }
    },

    // Get user stats
    async getUserStats(userId) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/stats/${userId}`);
            if (!response.ok) {
                // If stats don't exist, return default values
                return { xp: 0, messages: 0, calls: 0 };
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            return { xp: 0, messages: 0, calls: 0 };
        }
    },

    // Update user stats
    async updateStats(userId, statType, increment = 1) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/stats/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type: statType, increment })
            });
            if (!response.ok) {
                throw new Error('Failed to update stats');
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating stats:', error);
            return null;
        }
    },

    // Award XP
    async awardXP(userId, amount) {
        return this.updateStats(userId, 'xp', amount);
    },

    // Increment message count
    async incrementMessages(userId) {
        return this.updateStats(userId, 'messages', 1);
    },

    // Increment call count
    async incrementCalls(userId) {
        return this.updateStats(userId, 'calls', 1);
    }
};
