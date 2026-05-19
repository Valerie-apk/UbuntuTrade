const pool = require('../config/db');

const BASE_SQL = `
    SELECT p.*,
        u.id AS seller_id, u.username AS seller_username, u.fullName AS seller_fullName,
        u.email AS seller_email, u.location AS seller_location, u.avatarUrl AS seller_avatarUrl,
        u.isVerified AS seller_isVerified, u.rating AS seller_rating, u.responseRate AS seller_responseRate
    FROM products p
    LEFT JOIN users u ON p.userId = u.id
`;

function format(row) {
    return {
        id: row.id, name: row.name, description: row.description, price: row.price,
        imageUrl: row.imageUrl, images: row.images, status: row.status,
        category: row.category, subcategory: row.subcategory, condition: row.condition,
        location: row.location, department: row.department, views: row.views,
        soldCount: row.soldCount, rating: row.rating, reviewCount: row.reviewCount,
        userId: row.userId, createdAt: row.createdAt, updatedAt: row.updatedAt,
        seller: row.seller_id ? {
            id: row.seller_id, username: row.seller_username, fullName: row.seller_fullName,
            email: row.seller_email, location: row.seller_location, avatarUrl: row.seller_avatarUrl,
            isVerified: !!row.seller_isVerified, rating: row.seller_rating, responseRate: row.seller_responseRate
        } : null
    };
}

const Product = {
    async findAll({ search, category, location, status = 'Active', minPrice, maxPrice, userId, sort = 'newest' } = {}) {
        let sql = BASE_SQL + ' WHERE 1=1';
        const params = [];
        if (status && status !== 'all') { sql += ' AND p.status = ?';    params.push(status); }
        if (category)  { sql += ' AND p.category = ?';                   params.push(category); }
        if (location)  { sql += ' AND p.location LIKE ?';                params.push(`%${location}%`); }
        if (userId)    { sql += ' AND p.userId = ?';                     params.push(userId); }
        if (search)    { sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
        if (minPrice)  { sql += ' AND p.price >= ?';                     params.push(Number(minPrice)); }
        if (maxPrice)  { sql += ' AND p.price <= ?';                     params.push(Number(maxPrice)); }
        const orderMap = { newest: 'p.createdAt DESC', 'price-low': 'p.price ASC', 'price-high': 'p.price DESC', popular: 'p.views DESC' };
        sql += ` ORDER BY ${orderMap[sort] || 'p.createdAt DESC'}`;
        const [rows] = await pool.query(sql, params);
        return rows.map(format);
    },

    async findById(id) {
        const [rows] = await pool.query(BASE_SQL + ' WHERE p.id = ?', [id]);
        return rows[0] ? format(rows[0]) : null;
    },

    async findBySeller(userId) {
        const [rows] = await pool.query(BASE_SQL + ' WHERE p.userId = ? ORDER BY p.createdAt DESC', [userId]);
        return rows.map(format);
    },

    async create({ name, description, imageUrl, images, price, category, subcategory, condition, location, department, userId }) {
        const [result] = await pool.query(
            `INSERT INTO products (name, description, imageUrl, images, price, category, subcategory, \`condition\`, location, department, userId)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description || null, imageUrl || 'default-product.png',
             images ? JSON.stringify(images) : null,
             price, category || null, subcategory || null, condition || null,
             location || null, department || null, userId || null]
        );
        return this.findById(result.insertId);
    },

    async update(id, fields) {
        const allowed = ['name', 'description', 'imageUrl', 'price', 'category', 'subcategory', 'condition', 'location', 'department', 'status'];
        const cols = [], vals = [];
        allowed.forEach(f => {
            if (Object.prototype.hasOwnProperty.call(fields, f)) {
                cols.push(`\`${f}\` = ?`);
                vals.push(fields[f]);
            }
        });
        if (cols.length === 0) return null;
        vals.push(id);
        await pool.query(`UPDATE products SET ${cols.join(', ')} WHERE id = ?`, vals);
        return this.findById(id);
    },

    async softDelete(id) {
        await pool.query("UPDATE products SET status = 'Removed' WHERE id = ?", [id]);
    },

    async incrementViews(id) {
        await pool.query('UPDATE products SET views = views + 1 WHERE id = ?', [id]);
    }
};

module.exports = Product;
