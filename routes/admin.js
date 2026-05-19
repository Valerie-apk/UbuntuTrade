const router = require('express').Router();
const pool   = require('../config/db');

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

module.exports = router;
