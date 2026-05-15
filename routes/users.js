const router = require('express').Router();
const { User, Product } = require('../models');

// GET: /api/users (Fetch all users)
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: /api/users/:id (Fetch one user with their products)
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Product, as: 'products' }]
        });

        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT: /api/users/:id (Update a user profile)
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const allowedFields = ['username', 'fullName', 'phone', 'avatarUrl', 'location', 'role', 'isVerified', 'rating', 'responseRate'];
        const updates = {};

        allowedFields.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        });

        await user.update(updates);
        const responseUser = user.toJSON();
        delete responseUser.password;

        res.json({ success: true, data: responseUser });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
