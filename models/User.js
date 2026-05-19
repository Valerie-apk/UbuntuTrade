const pool = require('../config/db');

const User = {
    async findById(id) {
        const [rows] = await pool.query(
            'SELECT id, username, fullName, email, phone, avatarUrl, location, role, isVerified, rating, responseRate, createdAt FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    },

    async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] || null;
    },

    async findByEmailAndPassword(email, password) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        return rows[0] || null;
    },

    async findAll() {
        const [rows] = await pool.query(
            'SELECT id, username, fullName, email, phone, avatarUrl, location, role, isVerified, rating, responseRate, createdAt FROM users ORDER BY createdAt DESC'
        );
        return rows;
    },

    async create({ username, fullName, email, password, location }) {
        const [result] = await pool.query(
            'INSERT INTO users (username, fullName, email, password, location) VALUES (?, ?, ?, ?, ?)',
            [username, fullName || username, email, password, location || null]
        );
        return this.findById(result.insertId);
    },

    async update(id, fields) {
        const allowed = ['username', 'fullName', 'phone', 'avatarUrl', 'location', 'role', 'isVerified', 'rating', 'responseRate'];
        const cols = [], vals = [];
        allowed.forEach(f => {
            if (Object.prototype.hasOwnProperty.call(fields, f)) {
                cols.push(`\`${f}\` = ?`);
                vals.push(fields[f]);
            }
        });
        if (cols.length === 0) return null;
        vals.push(id);
        await pool.query(`UPDATE users SET ${cols.join(', ')} WHERE id = ?`, vals);
        return this.findById(id);
    }
};

module.exports = User;
