const router       = require('express').Router();
const pool         = require('../config/db');
const User         = require('../models/User');
const Product      = require('../models/Product');
const WishlistItem = require('../models/WishlistItem');
const Notification = require('../models/Notification');

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

// POST /api/users/:id/seller-verification
router.post('/:id/seller-verification', async (req, res) => {
    try {
        const { idDocumentUrl, notes } = req.body;
        if (!idDocumentUrl) return res.status(400).json({ message: 'idDocumentUrl is required' });
        const existing = await User.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'User not found' });
        await pool.query(
            "UPDATE users SET role = 'Seller', sellerStatus = 'Pending', isVerified = 0, idDocumentUrl = ? WHERE id = ?",
            [idDocumentUrl, req.params.id]
        );
        await pool.query(
            `INSERT INTO seller_verifications (userId, idDocumentUrl, notes, status)
             VALUES (?, ?, ?, 'Pending')`,
            [req.params.id, idDocumentUrl, notes || null]
        );
        const user = await User.findById(req.params.id);
        try {
            await Notification.createForAdmins({
                type: 'seller_request',
                title: 'Seller approval request',
                message: `${user.username || user.fullName || user.email} submitted an ID for seller approval.`,
                relatedId: user.id,
                actionUrl: '/admin/admin.html'
            });
        } catch (notifyErr) {
            console.error('Failed to create admin notification:', notifyErr.message);
        }
        res.status(201).json({ success: true, message: 'Seller verification submitted for admin review.', user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/users/:id/reports
router.post('/:id/reports', async (req, res) => {
    try {
        const { reporterId, reason, details } = req.body;
        if (!reason) return res.status(400).json({ message: 'reason is required' });
        if (String(reporterId || '') === String(req.params.id)) {
            return res.status(400).json({ message: 'You cannot report yourself' });
        }
        const seller = await User.findById(req.params.id);
        if (!seller) return res.status(404).json({ message: 'Seller not found' });
        await pool.query(
            `INSERT INTO seller_reports (sellerId, reporterId, reason, details)
             VALUES (?, ?, ?, ?)`,
            [req.params.id, reporterId || null, reason, details || null]
        );
        res.status(201).json({ success: true, message: 'Report submitted for admin review.' });
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
