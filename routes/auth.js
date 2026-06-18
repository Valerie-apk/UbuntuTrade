const router = require('express').Router();
const User   = require('../models/User');
const Notification = require('../models/Notification');
const pool   = require('../config/db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, fullName, name, email, password, location } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const existing = await User.findByEmail(email);
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const displayName = username || fullName || name || email.split('@')[0];
        const user = await User.create({ username: displayName, fullName: fullName || name || displayName, email, password, location });
        try {
            await Notification.createForAdmins({
                type: 'new_user',
                title: 'New user registered',
                message: `${user.username || user.fullName || user.email} joined UbuntuTrade.`,
                relatedId: user.id,
                actionUrl: '/admin/admin.html'
            });
        } catch (notifyErr) {
            console.error('Failed to create admin notification:', notifyErr.message);
        }
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await User.findByEmailAndPassword(email, password);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const { password: _pw, ...safeUser } = user;
        res.json({ message: 'Login successful', token: 'sample_jwt_token', user: safeUser });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// POST /api/auth/set-password
router.post('/set-password', async (req, res) => {
    const { userId, newPassword } = req.body;
    try {
        if (!userId || !newPassword) return res.status(400).json({ message: 'userId and newPassword are required' });
        await pool.query('UPDATE users SET password = ?, mustChangePassword = 0 WHERE id = ?', [newPassword, userId]);
        const [[user]] = await pool.query('SELECT id, username, email, role, adminLevel, mustChangePassword FROM users WHERE id = ?', [userId]);
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router;
