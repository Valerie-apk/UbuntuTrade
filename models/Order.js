const pool = require('../config/db');

const Order = {
    async findById(id) {
        const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (orders.length === 0) return null;
        const [items] = await pool.query(
            `SELECT oi.*, p.imageUrl, p.category,
                u.id AS seller_id, u.username AS seller_username, u.fullName AS seller_fullName
             FROM order_items oi
             LEFT JOIN products p ON oi.productId = p.id
             LEFT JOIN users u ON p.userId = u.id
             WHERE oi.orderId = ?`,
            [id]
        );
        const [payments] = await pool.query('SELECT * FROM payments WHERE orderId = ?', [id]);
        return { ...orders[0], items, payment: payments[0] || null };
    },

    async findByUser(userId) {
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', [userId]
        );
        return Promise.all(orders.map(async order => {
            const [items] = await pool.query(
                'SELECT oi.*, p.imageUrl FROM order_items oi LEFT JOIN products p ON oi.productId = p.id WHERE oi.orderId = ?',
                [order.id]
            );
            const [payments] = await pool.query('SELECT * FROM payments WHERE orderId = ?', [order.id]);
            return { ...order, items, payment: payments[0] || null };
        }));
    },

    async create({ userId, deliveryAddress, notes, subtotal, deliveryFee, total }) {
        const [result] = await pool.query(
            'INSERT INTO orders (userId, deliveryAddress, notes, subtotal, deliveryFee, total) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, deliveryAddress || null, notes || null, subtotal, deliveryFee, total]
        );
        return result.insertId;
    },

    async updateStatus(id, status) {
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    }
};

module.exports = Order;
