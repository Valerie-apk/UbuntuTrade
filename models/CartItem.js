const pool = require('../config/db');

const CART_SQL = `
    SELECT ci.id, ci.userId, ci.productId, ci.quantity, ci.createdAt,
        p.name, p.price, p.imageUrl, p.status, p.category, p.location,
        u.id AS seller_id, u.username AS seller_username, u.fullName AS seller_fullName,
        u.location AS seller_location, u.avatarUrl AS seller_avatarUrl
    FROM cart_items ci
    JOIN products p ON ci.productId = p.id
    LEFT JOIN users u ON p.userId = u.id
`;

function format(row) {
    return {
        id: row.id, userId: row.userId, productId: row.productId,
        quantity: row.quantity, createdAt: row.createdAt,
        product: {
            id: row.productId, name: row.name, price: row.price,
            imageUrl: row.imageUrl, status: row.status, category: row.category, location: row.location,
            seller: row.seller_id ? {
                id: row.seller_id, username: row.seller_username,
                fullName: row.seller_fullName, location: row.seller_location, avatarUrl: row.seller_avatarUrl
            } : null
        }
    };
}

const CartItem = {
    async findByUser(userId) {
        const [rows] = await pool.query(CART_SQL + " WHERE ci.userId = ? AND p.status = 'Active' ORDER BY ci.createdAt DESC", [userId]);
        return rows.map(format);
    },

    async findOne(userId, productId) {
        const [rows] = await pool.query('SELECT * FROM cart_items WHERE userId = ? AND productId = ?', [userId, productId]);
        return rows[0] || null;
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM cart_items WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async upsert(userId, productId, quantity = 1) {
        const existing = await this.findOne(userId, productId);
        if (existing) {
            const newQty = existing.quantity + (Number(quantity) || 1);
            await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing.id]);
            return { item: await this.findById(existing.id), created: false };
        }
        const [result] = await pool.query(
            'INSERT INTO cart_items (userId, productId, quantity) VALUES (?, ?, ?)',
            [userId, productId, Number(quantity) || 1]
        );
        return { item: await this.findById(result.insertId), created: true };
    },

    async updateQuantity(id, quantity) {
        await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, id]);
        return this.findById(id);
    },

    async deleteById(id) {
        const [result] = await pool.query('DELETE FROM cart_items WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    async clearByUser(userId) {
        await pool.query('DELETE FROM cart_items WHERE userId = ?', [userId]);
    },

    buildSummary(items) {
        const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
        const deliveryFee = subtotal > 0 && subtotal < 1000 ? 60 : 0;
        return {
            itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
            subtotal, deliveryFee, total: subtotal + deliveryFee
        };
    }
};

module.exports = CartItem;
