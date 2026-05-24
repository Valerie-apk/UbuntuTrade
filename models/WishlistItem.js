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
    },

    async findByUser(userId) {
        const [rows] = await pool.query(
            `SELECT wi.id, wi.userId, wi.productId, wi.createdAt,
                p.name, p.price, p.imageUrl, p.status, p.category, p.location,
                u.id AS seller_id, u.username AS seller_username
             FROM wishlist_items wi
             JOIN products p ON wi.productId = p.id
             LEFT JOIN users u ON p.userId = u.id
             WHERE wi.userId = ? ORDER BY wi.createdAt DESC`,
            [userId]
        );
        return rows.map(row => ({
            id: row.id, userId: row.userId, productId: row.productId, createdAt: row.createdAt,
            product: { id: row.productId, name: row.name, price: row.price, imageUrl: row.imageUrl, status: row.status, category: row.category, location: row.location,
                seller: row.seller_id ? { id: row.seller_id, username: row.seller_username } : null }
        }));
    }
};

module.exports = WishlistItem;
