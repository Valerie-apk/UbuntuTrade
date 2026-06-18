const pool = require('../config/db');

const Notification = {
    async create({ userId, type, title, message, relatedId, actionUrl }) {
        try {
            const [result] = await pool.query(
                `INSERT INTO notifications (userId, type, title, message, relatedId, actionUrl, isRead, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`,
                [userId, type, title, message, relatedId || null, actionUrl || null]
            );
            return result.insertId;
        } catch (err) {
            console.error('Error creating notification:', err.message);
            throw err;
        }
    },

    async createForAdmins({ type, title, message, relatedId, actionUrl }) {
        try {
            const [admins] = await pool.query('SELECT id FROM users WHERE role = ?', ['Admin']);
            await Promise.all(admins.map(admin => this.create({
                userId: admin.id,
                type,
                title,
                message,
                relatedId,
                actionUrl
            })));
        } catch (err) {
            console.error('Error creating admin notifications:', err.message);
            throw err;
        }
    },

    async findByUser(userId) {
        try {
            const [notifications] = await pool.query(
                `SELECT * FROM notifications 
                 WHERE userId = ? 
                 ORDER BY createdAt DESC 
                 LIMIT 50`,
                [userId]
            );
            return notifications;
        } catch (err) {
            console.error('Error fetching notifications:', err.message);
            throw err;
        }
    },

    async findUnread(userId) {
        try {
            const [notifications] = await pool.query(
                `SELECT * FROM notifications 
                 WHERE userId = ? AND isRead = 0 
                 ORDER BY createdAt DESC`,
                [userId]
            );
            return notifications;
        } catch (err) {
            console.error('Error fetching unread notifications:', err.message);
            throw err;
        }
    },

    async getUnreadCount(userId) {
        try {
            const [[{ count }]] = await pool.query(
                `SELECT COUNT(*) as count FROM notifications 
                 WHERE userId = ? AND isRead = 0`,
                [userId]
            );
            return count;
        } catch (err) {
            console.error('Error getting unread count:', err.message);
            throw err;
        }
    },

    async markAsRead(notificationId) {
        try {
            await pool.query(
                `UPDATE notifications SET isRead = 1 WHERE id = ?`,
                [notificationId]
            );
        } catch (err) {
            console.error('Error marking notification as read:', err.message);
            throw err;
        }
    },

    async markAllAsRead(userId) {
        try {
            await pool.query(
                `UPDATE notifications SET isRead = 1 WHERE userId = ? AND isRead = 0`,
                [userId]
            );
        } catch (err) {
            console.error('Error marking all notifications as read:', err.message);
            throw err;
        }
    },

    async delete(notificationId) {
        try {
            await pool.query(
                `DELETE FROM notifications WHERE id = ?`,
                [notificationId]
            );
        } catch (err) {
            console.error('Error deleting notification:', err.message);
            throw err;
        }
    },

    async ensureTable() {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    userId INT NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT,
                    relatedId INT,
                    actionUrl VARCHAR(500),
                    isRead BOOLEAN DEFAULT 0,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_read (userId, isRead),
                    INDEX idx_created (createdAt)
                )
            `);
        } catch (err) {
            console.error('Error creating notifications table:', err.message);
            throw err;
        }
    }
};

module.exports = Notification;
