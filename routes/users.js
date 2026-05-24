const router       = require('express').Router();
const User         = require('../models/User');
const Product      = require('../models/Product');
const WishlistItem = require('../models/WishlistItem');

// GET /api/users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const products = await Product.findBySeller(req.params.id);
        res.json({ ...user, products });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
    try {
        const existing = await User.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'User not found' });
        const updated = await User.update(req.params.id, req.body);
        if (!updated) return res.status(400).json({ message: 'No valid fields to update' });
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/users/:id/wishlist
router.get('/:id/wishlist', async (req, res) => {
    try {
        const items = await WishlistItem.findByUser(req.params.id);
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
