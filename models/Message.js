const pool = require('../config/db');

const Message = {
    async findByConversation(conversationId) {
        const [rows] = await pool.query(
            `SELECT m.*, u.id AS sender_id, u.username AS sender_username, u.fullName AS sender_fullName, u.avatarUrl AS sender_avatarUrl
             FROM messages m
             LEFT JOIN users u ON m.senderId = u.id
             WHERE m.conversationId = ?
             ORDER BY m.createdAt ASC`,
            [conversationId]
        );
        return rows.map(row => ({
            id: row.id, conversationId: row.conversationId, senderId: row.senderId,
            body: row.body, isRead: !!row.isRead, createdAt: row.createdAt,
            sender: row.sender_id ? {
                id: row.sender_id, username: row.sender_username,
                fullName: row.sender_fullName, avatarUrl: row.sender_avatarUrl
            } : null
        }));
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async create(conversationId, senderId, body) {
        const [result] = await pool.query(
            'INSERT INTO messages (conversationId, senderId, body) VALUES (?, ?, ?)',
            [conversationId, senderId, body]
        );
        return this.findById(result.insertId);
    },

    async markRead(conversationId, excludeSenderId) {
        await pool.query(
            'UPDATE messages SET isRead = true WHERE conversationId = ? AND senderId != ?',
            [conversationId, excludeSenderId]
        );
    }
};

module.exports = Message;
