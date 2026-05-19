const pool = require('../config/db');

const OrderItem = {
    async create({ orderId, productId, sellerId, productName, unitPrice, quantity, lineTotal }) {
        const [result] = await pool.query(
            'INSERT INTO order_items (orderId, productId, sellerId, productName, unitPrice, quantity, lineTotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [orderId, productId, sellerId || null, productName, unitPrice, quantity, lineTotal]
        );
        return { id: result.insertId, orderId, productId, sellerId, productName, unitPrice, quantity, lineTotal };
    },

    async findByOrder(orderId) {
        const [rows] = await pool.query(
            'SELECT oi.*, p.imageUrl FROM order_items oi LEFT JOIN products p ON oi.productId = p.id WHERE oi.orderId = ?',
            [orderId]
        );
        return rows;
    }
};

module.exports = OrderItem;
