const router = require('express').Router();
const User = require('../models/user');

// POST: /api/auth/register
router.post('/register', async (req, res) => {
    // FIX: Added username here so it's not undefined
    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ where: { email } });
        
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // FIX: Added username to the creation object
        await User.create({ 
            username, 
            email, 
            password 
        });
        
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error", error: err.message });
    }
});

// POST: /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email, password } });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({ 
            message: "Login successful", 
            token: "sample_jwt_token", 
            user: user.email 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error", error: err.message });
    }
});

module.exports = router;