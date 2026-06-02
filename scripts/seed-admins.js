require('dotenv').config();
const mysql = require('mysql2/promise');

async function seedAdmins() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        port: Number(process.env.DB_PORT) || 3306,
        multipleStatements: true
    });
    const db = process.env.DB_NAME || 'TradeDataBase';
    try {
        await conn.query(`USE \`${db}\``);
        const admins = [
            { username: 'admin', fullName: 'Admin User', email: 'admin@ubuntutrade.co.za', password: 'admin123', adminLevel: 3, mustChangePassword: 1, location: 'Johannesburg' }
        ];
        for (const a of admins) {
            const [[existing]] = await conn.query('SELECT id FROM users WHERE email = ?', [a.email]);
            if (existing) {
                console.log('Admin exists, updating adminLevel and mustChangePassword for', a.email);
                await conn.query('UPDATE users SET adminLevel = ?, mustChangePassword = ? WHERE id = ?', [a.adminLevel || 0, a.mustChangePassword ? 1 : 0, existing.id]);
            } else {
                console.log('Inserting admin', a.email);
                await conn.query(
                    'INSERT INTO users (username, fullName, email, password, location, role, adminLevel, mustChangePassword) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [a.username, a.fullName, a.email, a.password, a.location || null, 'Admin', a.adminLevel || 0, a.mustChangePassword ? 1 : 0]
                );
            }
        }
        console.log('Admin seeding complete');
    } catch (err) {
        console.error('Admin seed failed:', err.message);
    } finally {
        await conn.end();
        process.exit(0);
    }
}

seedAdmins();
