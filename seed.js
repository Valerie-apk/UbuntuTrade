require('dotenv').config();
const mysql = require('mysql2/promise');

async function seed() {
    // Connect without specifying a database first so we can create it
    const conn = await mysql.createConnection({
        host:     process.env.DB_HOST || '127.0.0.1',
        user:     process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        port:     Number(process.env.DB_PORT) || 3306,
        multipleStatements: true
    });

    const db = process.env.DB_NAME || 'TradeDataBase';

    try {
        console.log('Connected to MySQL...');

        await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db}\``);
        await conn.query(`USE \`${db}\``);
        console.log(`Using database: ${db}`);

        // ── Drop & recreate tables to ensure correct schema ───────────────────
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        for (const t of ['messages','conversations','payments','order_items','orders','wishlist_items','cart_items','products','users']) {
            await conn.query(`DROP TABLE IF EXISTS ${t}`);
        }
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');

        await conn.query(`
            CREATE TABLE IF NOT EXISTS users (
                id            INT AUTO_INCREMENT PRIMARY KEY,
                username      VARCHAR(255) NOT NULL,
                fullName      VARCHAR(255),
                email         VARCHAR(255) NOT NULL UNIQUE,
                password      VARCHAR(255) NOT NULL,
                phone         VARCHAR(50),
                avatarUrl     VARCHAR(500),
                location      VARCHAR(255),
                role          ENUM('Buyer','Seller','Admin') DEFAULT 'Buyer',
                isVerified    BOOLEAN DEFAULT false,
                rating        DECIMAL(3,2) DEFAULT 0,
                responseRate  INT DEFAULT 0,
                createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        await conn.query(`
            CREATE TABLE IF NOT EXISTS products (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                name        VARCHAR(255) NOT NULL,
                description TEXT,
                price       DECIMAL(10,2) NOT NULL,
                imageUrl    VARCHAR(500) DEFAULT 'default-product.png',
                images      JSON,
                status      ENUM('Active','Sold','Pending','Removed') DEFAULT 'Active',
                category    VARCHAR(100),
                subcategory VARCHAR(100),
                \`condition\` ENUM('Brand New','Like New','Good','Used'),
                location    VARCHAR(255),
                department  VARCHAR(100),
                views       INT DEFAULT 0,
                soldCount   INT DEFAULT 0,
                rating      DECIMAL(3,2) DEFAULT 0,
                reviewCount INT DEFAULT 0,
                userId      INT,
                createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        await conn.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id        INT AUTO_INCREMENT PRIMARY KEY,
                userId    INT NOT NULL,
                productId INT NOT NULL,
                quantity  INT NOT NULL DEFAULT 1,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_cart (userId, productId),
                FOREIGN KEY (userId)    REFERENCES users(id)    ON DELETE CASCADE,
                FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
            )
        `);
        await conn.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                userId          INT NOT NULL,
                status          ENUM('Pending','Paid','Cancelled','Delivered') DEFAULT 'Pending',
                subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0,
                deliveryFee     DECIMAL(10,2) NOT NULL DEFAULT 0,
                total           DECIMAL(10,2) NOT NULL DEFAULT 0,
                deliveryAddress VARCHAR(500),
                notes           TEXT,
                createdAt       DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            )
        `);
        await conn.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                orderId     INT NOT NULL,
                productId   INT NOT NULL,
                sellerId    INT,
                productName VARCHAR(255) NOT NULL,
                unitPrice   DECIMAL(10,2) NOT NULL,
                quantity    INT NOT NULL DEFAULT 1,
                lineTotal   DECIMAL(10,2) NOT NULL,
                createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (orderId) REFERENCES orders(id)
            )
        `);
        await conn.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id            INT AUTO_INCREMENT PRIMARY KEY,
                orderId       INT NOT NULL,
                userId        INT NOT NULL,
                amount        DECIMAL(10,2) NOT NULL,
                method        ENUM('Card','EFT','Cash','Wallet') DEFAULT 'Card',
                status        ENUM('Pending','Successful','Failed','Refunded') DEFAULT 'Successful',
                transactionId VARCHAR(255) NOT NULL UNIQUE,
                createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (orderId) REFERENCES orders(id),
                FOREIGN KEY (userId)  REFERENCES users(id)
            )
        `);
        await conn.query(`
            CREATE TABLE IF NOT EXISTS conversations (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                productId       INT,
                buyerId         INT NOT NULL,
                sellerId        INT NOT NULL,
                lastMessage     TEXT,
                unreadForBuyer  INT DEFAULT 0,
                unreadForSeller INT DEFAULT 0,
                createdAt       DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (buyerId)  REFERENCES users(id),
                FOREIGN KEY (sellerId) REFERENCES users(id)
            )
        `);
        await conn.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id             INT AUTO_INCREMENT PRIMARY KEY,
                conversationId INT NOT NULL,
                senderId       INT NOT NULL,
                body           TEXT NOT NULL,
                isRead         BOOLEAN DEFAULT false,
                createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (conversationId) REFERENCES conversations(id),
                FOREIGN KEY (senderId)       REFERENCES users(id)
            )
        `);
        await conn.query(`
            CREATE TABLE IF NOT EXISTS wishlist_items (
                id        INT AUTO_INCREMENT PRIMARY KEY,
                userId    INT NOT NULL,
                productId INT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_wishlist (userId, productId),
                FOREIGN KEY (userId)    REFERENCES users(id)    ON DELETE CASCADE,
                FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
            )
        `);

        console.log('Tables created.');

        // ── Seed users ────────────────────────────────────────────────────────
        const sellers = [
            { username: 'Sipho Dlamini',  fullName: 'Sipho Dlamini',  email: 'sipho@ubuntutrade.co.za',   password: 'pass123', location: 'Soweto, Gauteng',           role: 'Seller', isVerified: true,  rating: 4.9, responseRate: 98, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
            { username: 'Nomvula Dube',   fullName: 'Nomvula Dube',   email: 'nomvula@ubuntutrade.co.za', password: 'pass123', location: 'Durban, KwaZulu-Natal',     role: 'Seller', isVerified: true,  rating: 4.7, responseRate: 95, avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80' },
            { username: 'Thabo Mkhize',   fullName: 'Thabo Mkhize',   email: 'thabo@ubuntutrade.co.za',   password: 'pass123', location: 'Cape Town, Western Cape',   role: 'Seller', isVerified: true,  rating: 4.8, responseRate: 97, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
            { username: 'Lerato Nkosi',   fullName: 'Lerato Nkosi',   email: 'lerato@ubuntutrade.co.za',  password: 'pass123', location: 'Pretoria, Gauteng',         role: 'Seller', isVerified: false, rating: 4.5, responseRate: 90, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
            { username: 'Zola Mthembu',   fullName: 'Zola Mthembu',   email: 'zola@ubuntutrade.co.za',    password: 'pass123', location: 'Johannesburg, Gauteng',     role: 'Seller', isVerified: true,  rating: 4.6, responseRate: 92, avatarUrl: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&q=80' }
        ];

        const userIds = [];
        for (const s of sellers) {
            const [r] = await conn.query(
                'INSERT INTO users (username, fullName, email, password, location, role, isVerified, rating, responseRate, avatarUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [s.username, s.fullName, s.email, s.password, s.location, s.role, s.isVerified, s.rating, s.responseRate, s.avatarUrl]
            );
            userIds.push(r.insertId);
        }
        console.log(`Created ${userIds.length} users.`);

        // ── Seed products ─────────────────────────────────────────────────────
        const products = [
            // Sipho (index 0)
            { name: 'iPhone 14 Pro - 256GB', description: 'iPhone 14 Pro in perfect condition. Deep Purple colour. Battery health 94%. Always used with a case and screen protector. Comes with original box, charger, and cable.', price: 12500, imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80', category: 'Electronics', subcategory: 'Phones',    condition: 'Like New', location: 'Soweto, Gauteng',         department: 'Unisex',         views: 312, rating: 4.8, reviewCount: 24, sellerIdx: 0 },
            { name: 'Samsung Galaxy S23 Ultra', description: 'Samsung Galaxy S23 Ultra, Phantom Black. 256GB storage, 12GB RAM. Minor scratch on the back not visible with cover.', price: 10900, imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80', category: 'Electronics', subcategory: 'Phones',    condition: 'Good',     location: 'Soweto, Gauteng',         department: 'Unisex',         views: 198, rating: 4.7, reviewCount: 18, sellerIdx: 0 },
            { name: 'MacBook Pro M2 - 13"',     description: 'MacBook Pro 13-inch with M2 chip. 8GB RAM, 256GB SSD. Space Grey. Excellent condition. Comes with original charger.',        price: 19500, imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', category: 'Electronics', subcategory: 'Laptops',   condition: 'Like New', location: 'Soweto, Gauteng',         department: 'Unisex',         views: 421, rating: 4.9, reviewCount: 31, sellerIdx: 0 },
            // Nomvula (index 1)
            { name: 'Traditional Zulu Umbhaco Dress', description: 'Authentic handwoven Zulu Umbhaco dress in vibrant red, black and white. Size M. Worn once for a cultural event.', price: 850, imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80', category: 'Clothing',    subcategory: 'Traditional', condition: 'Like New', location: 'Durban, KwaZulu-Natal',   department: 'Womens',         views: 145, rating: 4.9, reviewCount: 12, sellerIdx: 1 },
            { name: 'Nike Air Max 270 - Size UK 9', description: 'Nike Air Max 270 in white and black. Size UK 9. Worn about 5 times, still in great shape. Original box included.', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', category: 'Shoes',       subcategory: 'Sneakers',   condition: 'Good',     location: 'Durban, KwaZulu-Natal',   department: 'Mens',           views: 267, rating: 4.6, reviewCount: 9,  sellerIdx: 1 },
            { name: 'Puffer Winter Jacket - Large', description: 'Thick puffer jacket for Joburg winters. Dark navy blue, size Large. No rips or stains. Barely worn.', price: 650, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80', category: 'Clothing',    subcategory: 'Jackets',    condition: 'Like New', location: 'Durban, KwaZulu-Natal',   department: 'Unisex',         views: 88,  rating: 4.5, reviewCount: 6,  sellerIdx: 1 },
            // Thabo (index 2)
            { name: '3-Seater Grey Fabric Sofa', description: 'Comfortable 3-seater sofa in light grey fabric. Excellent condition. Moving out and cannot take it. Collection only from Cape Town.', price: 3200, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', category: 'Home & Living', subcategory: 'Furniture', condition: 'Good',     location: 'Cape Town, Western Cape', department: 'Home & General', views: 203, rating: 4.7, reviewCount: 14, sellerIdx: 2 },
            { name: '10-Piece Stainless Steel Cookware Set', description: 'Complete 10-piece cookware set with non-stick coating. Includes pots, pans, and lids. Used twice.', price: 1100, imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', category: 'Home & Living', subcategory: 'Kitchen',   condition: 'Like New', location: 'Cape Town, Western Cape', department: 'Home & General', views: 119, rating: 4.8, reviewCount: 10, sellerIdx: 2 },
            { name: 'Queen Size Bed Frame - Dark Wood', description: 'Solid dark wood queen-size bed frame. No mattress included. Minor scuff on one leg. Great condition overall.', price: 2400, imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&q=80', category: 'Home & Living', subcategory: 'Furniture', condition: 'Good',     location: 'Cape Town, Western Cape', department: 'Home & General', views: 176, rating: 4.4, reviewCount: 8,  sellerIdx: 2 },
            // Lerato (index 3)
            { name: 'Sony WH-1000XM5 Headphones', description: 'Sony WH-1000XM5 wireless noise-cancelling headphones in black. Purchased 3 months ago, barely used.', price: 3400, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', category: 'Electronics', subcategory: 'Audio',    condition: 'Like New', location: 'Pretoria, Gauteng',         department: 'Unisex',         views: 289, rating: 4.9, reviewCount: 22, sellerIdx: 3 },
            { name: 'Samsung 55" 4K QLED Smart TV', description: 'Samsung 55-inch 4K QLED Smart TV. Works perfectly. Selling because I upgraded to 65".', price: 7500, imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80', category: 'Electronics', subcategory: 'TVs',      condition: 'Good',     location: 'Pretoria, Gauteng',         department: 'Home & General', views: 347, rating: 4.7, reviewCount: 19, sellerIdx: 3 },
            { name: 'Canon EOS R50 Mirrorless Camera', description: 'Canon EOS R50 with 18-45mm kit lens. Only 2,000 shutter count. Comes with bag, extra battery, and 64GB card.', price: 8900, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80', category: 'Electronics', subcategory: 'Cameras',  condition: 'Like New', location: 'Pretoria, Gauteng',         department: 'Unisex',         views: 412, rating: 4.8, reviewCount: 27, sellerIdx: 3 },
            // Zola (index 4)
            { name: 'Apple Watch Series 8 - 45mm GPS', description: 'Apple Watch Series 8, 45mm, Midnight Aluminium Case. GPS model. Battery holds full charge. Comes with original box and two extra bands.', price: 4200, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', category: 'Accessories', subcategory: 'Smartwatches', condition: 'Like New', location: 'Johannesburg, Gauteng',   department: 'Unisex',  views: 334, rating: 4.8, reviewCount: 20, sellerIdx: 4 },
            { name: 'Trek Marlin 7 Mountain Bike', description: 'Trek Marlin 7 mountain bike, 2022 model. Matte Black. Size M. Hydraulic disc brakes. Minor trail scratches on frame.', price: 9500, imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80', category: 'Sports',      subcategory: 'Cycling',      condition: 'Good',     location: 'Johannesburg, Gauteng',   department: 'Unisex',  views: 221, rating: 4.6, reviewCount: 11, sellerIdx: 4 },
            { name: '14K Gold & Diamond Stud Earrings', description: 'Genuine 14K white gold diamond stud earrings. 0.5 carat total weight. Comes with original jewellery box and certificate.', price: 6800, imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', category: 'Jewelry',     subcategory: 'Earrings',     condition: 'Like New', location: 'Johannesburg, Gauteng',   department: 'Womens',  views: 158, rating: 4.9, reviewCount: 15, sellerIdx: 4 },
            { name: 'Adidas Ultraboost 22 - Size UK 10', description: 'Adidas Ultraboost 22 running shoes in Core Black. UK size 10. Worn for 3 runs total. Box included.', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80', category: 'Shoes',       subcategory: 'Running',      condition: 'Like New', location: 'Johannesburg, Gauteng',   department: 'Mens',    views: 192, rating: 4.7, reviewCount: 13, sellerIdx: 4 },
            { name: 'Ray-Ban Aviator Classic Sunglasses', description: 'Ray-Ban RB3025 Aviator Classic in gold frame with green G-15 lenses. Comes with original case and box.', price: 1400, imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80', category: 'Accessories', subcategory: 'Eyewear',      condition: 'Good',     location: 'Johannesburg, Gauteng',   department: 'Unisex',  views: 143, rating: 4.5, reviewCount: 7,  sellerIdx: 4 },
            { name: 'PlayStation 5 Console + 2 Controllers', description: 'PS5 disc edition in excellent condition. Comes with 2 DualSense controllers, HDMI cable, and 3 games.', price: 9800, imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80', category: 'Electronics', subcategory: 'Gaming',       condition: 'Good',     location: 'Johannesburg, Gauteng',   department: 'Unisex',  views: 508, rating: 4.8, reviewCount: 33, sellerIdx: 4 }
        ];

        for (const p of products) {
            await conn.query(
                `INSERT INTO products (name, description, price, imageUrl, category, subcategory, \`condition\`, location, department, views, rating, reviewCount, userId)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.name, p.description, p.price, p.imageUrl, p.category, p.subcategory, p.condition, p.location, p.department, p.views, p.rating, p.reviewCount, userIds[p.sellerIdx]]
            );
        }
        console.log(`Created ${products.length} products.`);

        console.log('\nSeed complete! Login with any seller (password: pass123):');
        sellers.forEach(s => console.log(`  ${s.email}`));

    } catch (err) {
        console.error('Seed failed:', err.message);
    } finally {
        await conn.end();
        process.exit(0);
    }
}

seed();
