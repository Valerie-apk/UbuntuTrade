const router  = require('express').Router();
const pool    = require('../config/db');
const User    = require('../models/User');
const Product = require('../models/Product');

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const [[{ totalUsers }]]    = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
        const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products');
        const [[{ totalOrders }]]   = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
        const [[{ totalSales }]]    = await pool.query("SELECT COALESCE(SUM(total), 0) AS totalSales FROM orders WHERE status = 'Paid'");

        const [recentUsers]    = await pool.query('SELECT id, username, email, createdAt FROM users ORDER BY createdAt DESC LIMIT 5');
        const [recentProducts] = await pool.query('SELECT * FROM products ORDER BY createdAt DESC LIMIT 5');
        const [recentOrders]   = await pool.query('SELECT * FROM orders ORDER BY createdAt DESC LIMIT 5');

        res.json({ totalUsers, totalProducts, totalOrders, totalSales, recentUsers, recentProducts, recentOrders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/users
router.post('/users', async (req, res) => {
    const { username, fullName, email, password, phone, location, role } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
        const [[existing]] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) return res.status(400).json({ message: 'User with that email already exists' });
        const displayName = username || email.split('@')[0];
        const [result] = await pool.query(
            'INSERT INTO users (username, fullName, email, password, phone, location, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [displayName, fullName || displayName, email, password, phone || null, location || null, role || 'Buyer']
        );
        const [[newUser]] = await pool.query('SELECT id, username, email, role FROM users WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newUser });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/admin/products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.findAll({ status: 'all' });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/products/:id
router.put('/products/:id', async (req, res) => {
    try {
        const updated = await Product.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Product not found or no valid fields' });
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
    try {
        const [orders] = await pool.query(
            `SELECT o.*, u.username, u.email FROM orders o LEFT JOIN users u ON o.userId = u.id ORDER BY o.createdAt DESC`
        );
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
    try {
        const { username, fullName, email, phone, location, role, isVerified } = req.body;
        const fields = [];
        const values = [];
        if (username !== undefined) { fields.push('username = ?'); values.push(username); }
        if (fullName !== undefined) { fields.push('fullName = ?'); values.push(fullName); }
        if (email !== undefined) { fields.push('email = ?'); values.push(email); }
        if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
        if (location !== undefined) { fields.push('location = ?'); values.push(location); }
        if (role !== undefined) { fields.push('role = ?'); values.push(role); }
        if (isVerified !== undefined) { fields.push('isVerified = ?'); values.push(isVerified ? 1 : 0); }
        if (!fields.length) return res.status(400).json({ message: 'No fields to update' });
        values.push(req.params.id);
        await pool.query('UPDATE users SET ' + fields.join(', ') + ' WHERE id = ?', values);
        res.json({ success: true, message: 'User updated' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/admin/orders/:id
router.delete('/orders/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found' });
        res.json({ success: true, message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: 'status is required' });
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Order status updated' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
