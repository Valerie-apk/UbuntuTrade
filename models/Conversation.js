const pool = require('../config/db');

const CONV_SQL = `
    SELECT c.*,
        p.id AS prod_id, p.name AS prod_name, p.imageUrl AS prod_imageUrl, p.price AS prod_price,
        b.id AS buyer_id, b.username AS buyer_username, b.fullName AS buyer_fullName, b.avatarUrl AS buyer_avatarUrl,
        s.id AS seller_id, s.username AS seller_username, s.fullName AS seller_fullName, s.avatarUrl AS seller_avatarUrl
    FROM conversations c
    LEFT JOIN products p ON c.productId = p.id
    LEFT JOIN users b ON c.buyerId = b.id
    LEFT JOIN users s ON c.sellerId = s.id
`;

function format(row) {
    return {
        id: row.id, productId: row.productId, buyerId: row.buyerId, sellerId: row.sellerId,
        lastMessage: row.lastMessage, unreadForBuyer: row.unreadForBuyer, unreadForSeller: row.unreadForSeller,
        createdAt: row.createdAt, updatedAt: row.updatedAt,
        product: row.prod_id ? { id: row.prod_id, name: row.prod_name, imageUrl: row.prod_imageUrl, price: row.prod_price } : null,
        buyer:   row.buyer_id  ? { id: row.buyer_id,  username: row.buyer_username,  fullName: row.buyer_fullName,  avatarUrl: row.buyer_avatarUrl  } : null,
        seller:  row.seller_id ? { id: row.seller_id, username: row.seller_username, fullName: row.seller_fullName, avatarUrl: row.seller_avatarUrl } : null
    };
}

const Conversation = {
    async findByUser(userId) {
        const [rows] = await pool.query(
            CONV_SQL + ' WHERE c.buyerId = ? OR c.sellerId = ? ORDER BY c.updatedAt DESC',
            [userId, userId]
        );
        return rows.map(format);
    },

    async findOne(productId, buyerId, sellerId) {
        const [rows] = await pool.query(
            'SELECT id FROM conversations WHERE productId <=> ? AND buyerId = ? AND sellerId = ?',
            [productId || null, buyerId, sellerId]
        );
        if (rows.length === 0) return null;
        return this.findById(rows[0].id);
    },

    async findById(id) {
        const [rows] = await pool.query(CONV_SQL + ' WHERE c.id = ?', [id]);
        return rows[0] ? format(rows[0]) : null;
    },

    async create(productId, buyerId, sellerId) {
        const [result] = await pool.query(
            'INSERT INTO conversations (productId, buyerId, sellerId) VALUES (?, ?, ?)',
            [productId || null, buyerId, sellerId]
        );
        return this.findById(result.insertId);
    },

    async updateLastMessage(id, body, unreadField) {
        await pool.query(
            `UPDATE conversations SET lastMessage = ?, ${unreadField} = ${unreadField} + 1 WHERE id = ?`,
            [body, id]
        );
    },

    async markRead(id, unreadField) {
        await pool.query(`UPDATE conversations SET ${unreadField} = 0 WHERE id = ?`, [id]);
    }
};

module.exports = Conversation;
