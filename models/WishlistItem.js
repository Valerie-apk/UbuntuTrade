const pool = require('../config/db');

const WishlistItem = {
    async findOne(userId, productId) {
        const [rows] = await pool.query(
            'SELECT * FROM wishlist_items WHERE userId = ? AND productId = ?',
            [userId, productId]
        );
        return rows[0] || null;
    },

    async create(userId, productId) {
        const [result] = await pool.query(
            'INSERT INTO wishlist_items (userId, productId) VALUES (?, ?)',
            [userId, productId]
        );
        return { id: result.insertId, userId, productId };
    },

    async delete(userId, productId) {
        await pool.query('DELETE FROM wishlist_items WHERE userId = ? AND productId = ?', [userId, productId]);
    }
};

module.exports = WishlistItem;
