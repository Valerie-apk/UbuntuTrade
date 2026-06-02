const router  = require('express').Router();
const pool    = require('../config/db');
const User    = require('../models/User');
const Product = require('../models/Product');

async function columnExists(table, column) {
    const [rows] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
    );
    return rows[0].count > 0;
}

async function ensureSellerSchema() {
    if (!(await columnExists('users', 'sellerStatus'))) {
        await pool.query("ALTER TABLE users ADD COLUMN sellerStatus ENUM('Pending','Approved','Flagged') DEFAULT 'Pending'");
    }
    if (!(await columnExists('users', 'isSuspended'))) {
        await pool.query('ALTER TABLE users ADD COLUMN isSuspended BOOLEAN DEFAULT false');
    }
    if (!(await columnExists('users', 'idDocumentUrl'))) {
        await pool.query('ALTER TABLE users ADD COLUMN idDocumentUrl VARCHAR(500)');
    }
    await pool.query(`
        CREATE TABLE IF NOT EXISTS seller_verifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            idDocumentUrl VARCHAR(500) NOT NULL,
            notes TEXT,
            status ENUM('Pending','Approved','Flagged') DEFAULT 'Pending',
            reviewedBy INT,
            reviewedAt DATETIME,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS seller_reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sellerId INT NOT NULL,
            reporterId INT,
            reason VARCHAR(255) NOT NULL,
            details TEXT,
            status ENUM('Open','Reviewed','Dismissed') DEFAULT 'Open',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (sellerId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (reporterId) REFERENCES users(id) ON DELETE SET NULL
        )
    `);
}

const sellerSchemaReady = ensureSellerSchema().catch(err => console.error('Seller schema setup failed:', err.message));

async function requireSellerSchema() {
    await sellerSchemaReady;
}

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        await requireSellerSchema();
        const [[{ totalUsers }]]    = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
        const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products');
        const [[{ totalOrders }]]   = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
        const [[{ totalSales }]]    = await pool.query("SELECT COALESCE(SUM(total), 0) AS totalSales FROM orders WHERE status = 'Paid'");
        const [[sellerStats]]       = await pool.query(`SELECT
            SUM(role = 'Seller') AS totalSellers,
            SUM(role = 'Seller' AND sellerStatus = 'Pending') AS pendingSellers,
            SUM(role = 'Seller' AND sellerStatus = 'Approved') AS approvedSellers,
            SUM(role = 'Seller' AND sellerStatus = 'Flagged') AS flaggedSellers
            FROM users`);

        const [recentUsers]    = await pool.query('SELECT id, username, email, role, createdAt FROM users ORDER BY createdAt DESC LIMIT 5');
        const [recentProducts] = await pool.query('SELECT * FROM products ORDER BY createdAt DESC LIMIT 5');
        const [recentOrders]   = await pool.query('SELECT * FROM orders ORDER BY createdAt DESC LIMIT 5');

        res.json({ totalUsers, totalProducts, totalOrders, totalSales, sellerStats, recentUsers, recentProducts, recentOrders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/users
router.post('/users', async (req, res) => {
    const { username, fullName, email, password, phone, location, role } = req.body;
        const { username, fullName, email, password, phone, location, role, adminLevel } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
        const [[existing]] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) return res.status(400).json({ message: 'User with that email already exists' });
        const displayName = username || email.split('@')[0];
        const [result] = await pool.query(
            'INSERT INTO users (username, fullName, email, password, phone, location, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [displayName, fullName || displayName, email, password, phone || null, location || null, role || 'Buyer']
                    'INSERT INTO users (username, fullName, email, password, phone, location, role, adminLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [displayName, fullName || displayName, email, password, phone || null, location || null, role || 'Buyer', adminLevel || 0]
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
        await requireSellerSchema();
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
        await requireSellerSchema();
        const { username, fullName, email, phone, location, role, isVerified, sellerStatus, isSuspended, idDocumentUrl } = req.body;
            const { username, fullName, email, phone, location, role, isVerified, sellerStatus, isSuspended, idDocumentUrl, adminLevel } = req.body;
        const fields = [];
        const values = [];
        if (username !== undefined) { fields.push('username = ?'); values.push(username); }
        if (fullName !== undefined) { fields.push('fullName = ?'); values.push(fullName); }
        if (email !== undefined) { fields.push('email = ?'); values.push(email); }
        if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
        if (location !== undefined) { fields.push('location = ?'); values.push(location); }
        if (role !== undefined) { fields.push('role = ?'); values.push(role); }
        if (isVerified !== undefined) { fields.push('isVerified = ?'); values.push(isVerified ? 1 : 0); }
        if (sellerStatus !== undefined) { fields.push('sellerStatus = ?'); values.push(sellerStatus); }
        if (isSuspended !== undefined) { fields.push('isSuspended = ?'); values.push(isSuspended ? 1 : 0); }
        if (idDocumentUrl !== undefined) { fields.push('idDocumentUrl = ?'); values.push(idDocumentUrl || null); }
        if (adminLevel !== undefined) { fields.push('adminLevel = ?'); values.push(adminLevel || 0); }
        if (!fields.length) return res.status(400).json({ message: 'No fields to update' });
        values.push(req.params.id);
        await pool.query('UPDATE users SET ' + fields.join(', ') + ' WHERE id = ?', values);
        res.json({ success: true, message: 'User updated' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/admin/sellers
router.get('/sellers', async (req, res) => {
    try {
        await requireSellerSchema();
        const [rows] = await pool.query(`
            SELECT u.id, u.username, u.fullName, u.email, u.phone, u.location, u.avatarUrl,
                u.role, u.isVerified, u.sellerStatus, u.isSuspended, u.idDocumentUrl,
                u.rating, u.responseRate, u.createdAt,
                COUNT(DISTINCT p.id) AS productCount,
                COALESCE(SUM(p.soldCount), 0) AS soldCount,
                COALESCE(SUM(p.views), 0) AS totalViews,
                COUNT(DISTINCT sr.id) AS reportCount,
                COUNT(DISTINCT CASE WHEN sr.status = 'Open' THEN sr.id END) AS openReportCount,
                MAX(sv.createdAt) AS latestVerificationAt
            FROM users u
            LEFT JOIN products p ON p.userId = u.id
            LEFT JOIN seller_reports sr ON sr.sellerId = u.id
            LEFT JOIN seller_verifications sv ON sv.userId = u.id
            WHERE u.role = 'Seller' OR u.idDocumentUrl IS NOT NULL
            GROUP BY u.id
            ORDER BY FIELD(u.sellerStatus, 'Pending', 'Flagged', 'Approved'), u.createdAt DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/sellers/:id
router.get('/sellers/:id', async (req, res) => {
    try {
        await requireSellerSchema();
        const [[seller]] = await pool.query(`
            SELECT id, username, fullName, email, phone, location, avatarUrl, role, isVerified,
                sellerStatus, isSuspended, idDocumentUrl, rating, responseRate, createdAt
            FROM users WHERE id = ?
        `, [req.params.id]);
        if (!seller) return res.status(404).json({ message: 'Seller not found' });
        const [[stats]] = await pool.query(`
            SELECT COUNT(*) AS productCount, COALESCE(SUM(soldCount), 0) AS soldCount,
                COALESCE(SUM(views), 0) AS totalViews,
                COALESCE(AVG(rating), 0) AS averageProductRating
            FROM products WHERE userId = ?
        `, [req.params.id]);
        const [products] = await pool.query('SELECT id, name, status, price, views, soldCount, createdAt FROM products WHERE userId = ? ORDER BY createdAt DESC LIMIT 20', [req.params.id]);
        const [reports] = await pool.query(`
            SELECT sr.*, r.username AS reporterUsername, r.email AS reporterEmail
            FROM seller_reports sr
            LEFT JOIN users r ON sr.reporterId = r.id
            WHERE sr.sellerId = ?
            ORDER BY sr.createdAt DESC
        `, [req.params.id]);
        const [verifications] = await pool.query('SELECT * FROM seller_verifications WHERE userId = ? ORDER BY createdAt DESC', [req.params.id]);
        const [orders] = await pool.query(`
            SELECT oi.id, oi.orderId, oi.productName, oi.quantity, oi.lineTotal, o.status, o.createdAt
            FROM order_items oi
            LEFT JOIN orders o ON o.id = oi.orderId
            WHERE oi.sellerId = ?
            ORDER BY o.createdAt DESC
            LIMIT 20
        `, [req.params.id]);
        res.json({ seller, stats, products, reports, verifications, orders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/sellers/:id/status
router.put('/sellers/:id/status', async (req, res) => {
    try {
        await requireSellerSchema();
        const { sellerStatus, isSuspended, adminId } = req.body;
        const allowed = ['Pending', 'Approved', 'Flagged'];
        if (!allowed.includes(sellerStatus)) return res.status(400).json({ message: 'Invalid sellerStatus' });
        await pool.query(
            `UPDATE users SET role = 'Seller', sellerStatus = ?, isVerified = ?, isSuspended = ? WHERE id = ?`,
            [sellerStatus, sellerStatus === 'Approved' ? 1 : 0, isSuspended ? 1 : 0, req.params.id]
        );
        await pool.query(
            `UPDATE seller_verifications
             SET status = ?, reviewedBy = ?, reviewedAt = NOW()
             WHERE userId = ? AND status = 'Pending'
             ORDER BY createdAt DESC LIMIT 1`,
            [sellerStatus, adminId || null, req.params.id]
        );
        res.json({ success: true, message: 'Seller status updated' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT /api/admin/seller-reports/:id/status
router.put('/seller-reports/:id/status', async (req, res) => {
    try {
        await requireSellerSchema();
        const { status } = req.body;
        if (!['Open', 'Reviewed', 'Dismissed'].includes(status)) return res.status(400).json({ message: 'Invalid report status' });
        await pool.query('UPDATE seller_reports SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Report updated' });
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
