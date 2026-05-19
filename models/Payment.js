const pool = require('../config/db');

const Payment = {
    async findByUser(userId) {
        const [rows] = await pool.query(
            `SELECT pay.*, o.status AS orderStatus, o.total AS orderTotal, o.deliveryAddress
             FROM payments pay
             LEFT JOIN orders o ON pay.orderId = o.id
             WHERE pay.userId = ?
             ORDER BY pay.createdAt DESC`,
            [userId]
        );
        return rows;
    },

    async findByOrder(orderId) {
        const [rows] = await pool.query('SELECT * FROM payments WHERE orderId = ?', [orderId]);
        return rows[0] || null;
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async create({ orderId, userId, amount, method = 'Card', transactionId }) {
        const [result] = await pool.query(
            "INSERT INTO payments (orderId, userId, amount, method, transactionId, status) VALUES (?, ?, ?, ?, ?, 'Successful')",
            [orderId, userId, amount, method, transactionId]
        );
        return this.findById(result.insertId);
    }
};

module.exports = Payment;
