require('dotenv').config();
const mysql = require('mysql2/promise');

async function seed() {
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

        // Drop & recreate all tables
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        for (const t of ['messages','conversations','payments','order_items','orders','wishlist_items','cart_items','seller_reports','seller_verifications','products','users']) {
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
                sellerStatus  ENUM('Pending','Approved','Flagged') DEFAULT 'Pending',
                isSuspended   BOOLEAN DEFAULT false,
                idDocumentUrl VARCHAR(500),
                rating        DECIMAL(3,2) DEFAULT 0,
                responseRate  INT DEFAULT 0,
                createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                adminLevel    INT DEFAULT 0,
                createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        await conn.query(`
            CREATE TABLE IF NOT EXISTS seller_verifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                idDocumentUrl VARCHAR(500) NOT NULL,
                notes TEXT,
                status ENUM('Pending','Approved','Flagged') DEFAULT 'Pending',
                reviewedBy INT,
                reviewedAt DATETIME,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        await conn.query(`
            CREATE TABLE IF NOT EXISTS seller_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sellerId INT NOT NULL,
                reporterId INT,
                reason VARCHAR(255) NOT NULL,
                details TEXT,
                status ENUM('Open','Reviewed','Dismissed') DEFAULT 'Open',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (sellerId) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (reporterId) REFERENCES users(id) ON DELETE SET NULL
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

        // ── Users ────────────────────────────────────────────────────────────────
        const users = [
            // Admin
            { username: 'admin',         fullName: 'Admin User',       email: 'admin@ubuntutrade.co.za',   password: 'admin123', location: 'Johannesburg, Gauteng', role: 'Admin',  isVerified: true,  rating: 5.0, responseRate: 100, avatarUrl: null },
            // Buyers
            { username: 'Amahle Zulu',   fullName: 'Amahle Zulu',      email: 'amahle@gmail.com',          password: 'pass123',  location: 'Durban, KwaZulu-Natal', role: 'Buyer',  isVerified: false, rating: 0,   responseRate: 0,   avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80' },
            { username: 'Katlego Moeti', fullName: 'Katlego Moeti',    email: 'katlego@gmail.com',         password: 'pass123',  location: 'Pretoria, Gauteng',     role: 'Buyer',  isVerified: false, rating: 0,   responseRate: 0,   avatarUrl: null },
            // Sellers
            { username: 'Sipho Dlamini', fullName: 'Sipho Dlamini',    email: 'sipho@ubuntutrade.co.za',   password: 'pass123',  location: 'Soweto, Gauteng',           role: 'Seller', isVerified: true,  rating: 4.9, responseRate: 98, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
            { username: 'Nomvula Dube',  fullName: 'Nomvula Dube',     email: 'nomvula@ubuntutrade.co.za', password: 'pass123',  location: 'Durban, KwaZulu-Natal',     role: 'Seller', isVerified: true,  rating: 4.7, responseRate: 95, avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80' },
            { username: 'Thabo Mkhize',  fullName: 'Thabo Mkhize',     email: 'thabo@ubuntutrade.co.za',   password: 'pass123',  location: 'Cape Town, Western Cape',   role: 'Seller', isVerified: true,  rating: 4.8, responseRate: 97, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
            { username: 'Lerato Nkosi',  fullName: 'Lerato Nkosi',     email: 'lerato@ubuntutrade.co.za',  password: 'pass123',  location: 'Pretoria, Gauteng',         role: 'Seller', isVerified: true,  rating: 4.6, responseRate: 91, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
            { username: 'Zola Mthembu',  fullName: 'Zola Mthembu',     email: 'zola@ubuntutrade.co.za',    password: 'pass123',  location: 'Johannesburg, Gauteng',     role: 'Seller', isVerified: true,  rating: 4.5, responseRate: 89, avatarUrl: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&q=80' },
        ];

        const userIds = {};
        for (const u of users) {
            const [r] = await conn.query(
                'INSERT INTO users (username, fullName, email, password, location, role, isVerified, sellerStatus, isSuspended, idDocumentUrl, rating, responseRate, avatarUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [u.username, u.fullName, u.email, u.password, u.location, u.role, u.isVerified, u.role === 'Seller' ? 'Approved' : 'Pending', false, u.role === 'Seller' ? '/uploads/sample-id-document.pdf' : null, u.rating, u.responseRate, u.avatarUrl]
                        const adminLevel = u.role === 'Admin' ? 3 : 0;
                        const [r] = await conn.query(
                            'INSERT INTO users (username, fullName, email, password, location, role, isVerified, sellerStatus, isSuspended, idDocumentUrl, rating, responseRate, avatarUrl, adminLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [u.username, u.fullName, u.email, u.password, u.location, u.role, u.isVerified, u.role === 'Seller' ? 'Approved' : 'Pending', false, u.role === 'Seller' ? '/uploads/sample-id-document.pdf' : null, u.rating, u.responseRate, u.avatarUrl, adminLevel]
            );
            userIds[u.email] = r.insertId;
        }
        const S = (email) => userIds[email];
        console.log(`Created ${users.length} users.`);

        // ── Products ─────────────────────────────────────────────────────────────
        const products = [
            // === ELECTRONICS — Phones ===
            {
                name: 'iPhone 14 Pro 256GB – Deep Purple',
                description: 'iPhone 14 Pro in perfect condition. Deep Purple. Battery health 94%. Always kept in a case with a screen protector. Comes with original box, charger, and USB-C cable.',
                price: 12500, category: 'Electronics', subcategory: 'Phones', condition: 'Like New',
                imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
                location: 'Soweto, Gauteng', views: 312, rating: 4.8, reviewCount: 24, soldCount: 2, seller: 'sipho@ubuntutrade.co.za'
            },
            {
                name: 'Samsung Galaxy S23 Ultra 256GB',
                description: 'Samsung Galaxy S23 Ultra in Phantom Black. 256GB storage, 12GB RAM. Minor scratch on the back not visible with a cover on. Comes with original box and S-Pen.',
                price: 10900, category: 'Electronics', subcategory: 'Phones', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80',
                location: 'Soweto, Gauteng', views: 198, rating: 4.7, reviewCount: 18, soldCount: 1, seller: 'sipho@ubuntutrade.co.za'
            },
            {
                name: 'Huawei P40 Pro – Blush Gold',
                description: 'Huawei P40 Pro in Blush Gold. 256GB, 8GB RAM. Leica quad camera. No Google services but fully functional with Huawei AppGallery. Battery life is excellent.',
                price: 5800, category: 'Electronics', subcategory: 'Phones', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&q=80',
                location: 'Pretoria, Gauteng', views: 134, rating: 4.4, reviewCount: 9, soldCount: 0, seller: 'lerato@ubuntutrade.co.za'
            },
            // === ELECTRONICS — Laptops ===
            {
                name: 'MacBook Pro M2 13-inch – Space Grey',
                description: 'MacBook Pro 13" with M2 chip, 8GB RAM, 256GB SSD in Space Grey. Excellent condition, no scratches. Comes with original MagSafe charger and box. Never left SA.',
                price: 19500, category: 'Electronics', subcategory: 'Laptops', condition: 'Like New',
                imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
                location: 'Soweto, Gauteng', views: 421, rating: 4.9, reviewCount: 31, soldCount: 3, seller: 'sipho@ubuntutrade.co.za'
            },
            {
                name: 'Dell XPS 15 – Core i7, 16GB RAM',
                description: 'Dell XPS 15 9510 with Intel Core i7-11800H, 16GB DDR4, 512GB NVMe SSD, NVIDIA RTX 3050 Ti. 15.6" OLED display. Great for design and coding. Charger included.',
                price: 14200, category: 'Electronics', subcategory: 'Laptops', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
                location: 'Cape Town, Western Cape', views: 287, rating: 4.6, reviewCount: 15, soldCount: 1, seller: 'thabo@ubuntutrade.co.za'
            },
            // === ELECTRONICS — Audio ===
            {
                name: 'Sony WH-1000XM5 Wireless Headphones',
                description: 'Sony WH-1000XM5 noise-cancelling headphones in black. Purchased 3 months ago, barely used. Industry-leading ANC. 30-hour battery life. Comes with case and cables.',
                price: 3400, category: 'Electronics', subcategory: 'Audio', condition: 'Like New',
                imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
                location: 'Pretoria, Gauteng', views: 289, rating: 4.9, reviewCount: 22, soldCount: 2, seller: 'lerato@ubuntutrade.co.za'
            },
            // === ELECTRONICS — TVs ===
            {
                name: 'Samsung 55" 4K QLED Smart TV',
                description: 'Samsung 55" 4K QLED Smart TV (2022 model). Works flawlessly — upgrading to 65". Remote, stand, and all original cables included. Collection only from Pretoria.',
                price: 7500, category: 'Electronics', subcategory: 'TVs', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80',
                location: 'Pretoria, Gauteng', views: 347, rating: 4.7, reviewCount: 19, soldCount: 1, seller: 'lerato@ubuntutrade.co.za'
            },
            // === ELECTRONICS — Cameras ===
            {
                name: 'Canon EOS R50 Mirrorless Camera',
                description: 'Canon EOS R50 with 18-45mm kit lens. Only 2,000 shutter actuations. Comes with camera bag, extra LP-E17 battery, and 64GB SD card. Perfect for photography beginners.',
                price: 8900, category: 'Electronics', subcategory: 'Cameras', condition: 'Like New',
                imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
                location: 'Pretoria, Gauteng', views: 412, rating: 4.8, reviewCount: 27, soldCount: 2, seller: 'lerato@ubuntutrade.co.za'
            },
            // === ELECTRONICS — Gaming ===
            {
                name: 'PlayStation 5 + 2 DualSense Controllers',
                description: 'PS5 disc edition in excellent condition. Comes with 2 DualSense controllers (one white, one Midnight Black), HDMI cable, and 3 games: Spider-Man, FIFA 24, and Hogwarts Legacy.',
                price: 9800, category: 'Electronics', subcategory: 'Gaming', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80',
                location: 'Johannesburg, Gauteng', views: 508, rating: 4.8, reviewCount: 33, soldCount: 3, seller: 'zola@ubuntutrade.co.za'
            },
            // === CLOTHING ===
            {
                name: 'Traditional Zulu Umbhaco Dress',
                description: 'Authentic handwoven Zulu Umbhaco dress in vibrant red, black and white. Size M. Worn once for a cultural event — still in perfect condition.',
                price: 850, category: 'Clothing', subcategory: 'Traditional', condition: 'Like New',
                imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
                location: 'Durban, KwaZulu-Natal', views: 145, rating: 4.9, reviewCount: 12, soldCount: 5, seller: 'nomvula@ubuntutrade.co.za'
            },
            {
                name: 'Puffer Winter Jacket – Navy, Large',
                description: 'Thick puffer jacket, dark navy blue, size Large. Rated for temperatures down to -5°C. No rips, no stains, barely worn. Perfect for Highveld winters.',
                price: 650, category: 'Clothing', subcategory: 'Jackets', condition: 'Like New',
                imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
                location: 'Durban, KwaZulu-Natal', views: 88, rating: 4.5, reviewCount: 6, soldCount: 2, seller: 'nomvula@ubuntutrade.co.za'
            },
            {
                name: 'Levi\'s 501 Original Jeans – W32 L34',
                description: 'Classic Levi\'s 501 straight-leg jeans in stonewash blue. Waist 32, Length 34. Excellent condition — washed and shrunk slightly so selling. No damage.',
                price: 480, category: 'Clothing', subcategory: 'Jeans', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
                location: 'Cape Town, Western Cape', views: 102, rating: 4.4, reviewCount: 7, soldCount: 1, seller: 'thabo@ubuntutrade.co.za'
            },
            {
                name: 'Vintage Denim Jacket – Size S',
                description: 'Vintage-style denim jacket, light blue wash, size Small. Distressed details and embroidered patches on sleeves. Great streetwear piece.',
                price: 390, category: 'Clothing', subcategory: 'Jackets', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=600&q=80',
                location: 'Johannesburg, Gauteng', views: 76, rating: 4.3, reviewCount: 5, soldCount: 0, seller: 'zola@ubuntutrade.co.za'
            },
            // === SHOES ===
            {
                name: 'Nike Air Max 270 – White/Black UK 9',
                description: 'Nike Air Max 270 in white and black. UK size 9. Worn about 5 times, still in great shape. Original box included. No sole wear visible.',
                price: 1200, category: 'Shoes', subcategory: 'Sneakers', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
                location: 'Durban, KwaZulu-Natal', views: 267, rating: 4.6, reviewCount: 9, soldCount: 3, seller: 'nomvula@ubuntutrade.co.za'
            },
            {
                name: 'Adidas Ultraboost 22 – Black UK 10',
                description: 'Adidas Ultraboost 22 running shoes in Core Black. UK size 10. Worn for 3 runs total. BOOST midsole still fully responsive. Original box included.',
                price: 1800, category: 'Shoes', subcategory: 'Running', condition: 'Like New',
                imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
                location: 'Johannesburg, Gauteng', views: 192, rating: 4.7, reviewCount: 13, soldCount: 2, seller: 'zola@ubuntutrade.co.za'
            },
            {
                name: 'Timberland 6-Inch Premium Boots – UK 8',
                description: 'Classic Timberland wheat nubuck boots, UK 8. Worn a handful of times — still look brand new. Water resistant. No scuffs. Original box and dust bag.',
                price: 2100, category: 'Shoes', subcategory: 'Boots', condition: 'Like New',
                imageUrl: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&q=80',
                location: 'Cape Town, Western Cape', views: 143, rating: 4.8, reviewCount: 10, soldCount: 1, seller: 'thabo@ubuntutrade.co.za'
            },
            // === HOME & LIVING ===
            {
                name: '3-Seater Grey Fabric Sofa',
                description: 'Comfortable 3-seater sofa in light grey fabric. Solid hardwood frame. Excellent condition — moving out and cannot transport it. Collection only from Cape Town CBD.',
                price: 3200, category: 'Home & Living', subcategory: 'Furniture', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
                location: 'Cape Town, Western Cape', views: 203, rating: 4.7, reviewCount: 14, soldCount: 1, seller: 'thabo@ubuntutrade.co.za'
            },
            {
                name: '10-Piece Stainless Steel Cookware Set',
                description: 'Complete 10-piece cookware set with non-stick granite coating. Includes 2 pots, 3 pans, 4 lids, and a steamer insert. Oven safe up to 220°C. Used only twice.',
                price: 1100, category: 'Home & Living', subcategory: 'Kitchen', condition: 'Like New',
                imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
                location: 'Cape Town, Western Cape', views: 119, rating: 4.8, reviewCount: 10, soldCount: 2, seller: 'thabo@ubuntutrade.co.za'
            },
            {
                name: 'Queen Size Bed Frame – Dark Wood',
                description: 'Solid dark wood queen-size bed frame with slatted base. No mattress. Minor scuff on one leg from moving. Otherwise in great condition. Disassembles easily.',
                price: 2400, category: 'Home & Living', subcategory: 'Furniture', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&q=80',
                location: 'Cape Town, Western Cape', views: 176, rating: 4.4, reviewCount: 8, soldCount: 0, seller: 'thabo@ubuntutrade.co.za'
            },
            {
                name: 'Nespresso Vertuo Coffee Machine',
                description: 'Nespresso VertuoPlus in matte black. Includes milk frother. Descaled and fully cleaned. Comes with 15 assorted Vertuo capsules. Perfect for home office.',
                price: 1800, category: 'Home & Living', subcategory: 'Kitchen', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&q=80',
                location: 'Soweto, Gauteng', views: 165, rating: 4.6, reviewCount: 11, soldCount: 1, seller: 'sipho@ubuntutrade.co.za'
            },
            // === ACCESSORIES ===
            {
                name: 'Apple Watch Series 8 – 45mm GPS',
                description: 'Apple Watch Series 8, 45mm, Midnight Aluminium case with GPS. Battery holds full charge. Comes with original box and three extra bands (Sport Loop, Solo Loop, Braided).',
                price: 4200, category: 'Accessories', subcategory: 'Smartwatches', condition: 'Like New',
                imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
                location: 'Johannesburg, Gauteng', views: 334, rating: 4.8, reviewCount: 20, soldCount: 2, seller: 'zola@ubuntutrade.co.za'
            },
            {
                name: 'Ray-Ban Aviator Classic – Gold/Green',
                description: 'Ray-Ban RB3025 Aviator Classic in gold frame with G-15 green lenses. Polarised. Comes with original hard case, cleaning cloth, and box. No scratches on lenses.',
                price: 1400, category: 'Accessories', subcategory: 'Eyewear', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
                location: 'Johannesburg, Gauteng', views: 143, rating: 4.5, reviewCount: 7, soldCount: 1, seller: 'zola@ubuntutrade.co.za'
            },
            {
                name: 'Louis Vuitton Speedy 30 Handbag',
                description: 'Authentic LV Speedy 30 in classic monogram canvas. Comes with authenticity card and dust bag. Some patina on handles from natural use — adds character. No cracks or peeling.',
                price: 8500, category: 'Accessories', subcategory: 'Handbags', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
                location: 'Durban, KwaZulu-Natal', views: 221, rating: 4.7, reviewCount: 16, soldCount: 1, seller: 'nomvula@ubuntutrade.co.za'
            },
            // === SPORTS ===
            {
                name: 'Trek Marlin 7 Mountain Bike – Size M',
                description: 'Trek Marlin 7 hardtail MTB, 2022. Matte Black, size M. Shimano 1x drivetrain, hydraulic disc brakes. Minor trail scuffs on the frame. Rides perfectly. Serviced 2 months ago.',
                price: 9500, category: 'Sports', subcategory: 'Cycling', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80',
                location: 'Johannesburg, Gauteng', views: 221, rating: 4.6, reviewCount: 11, soldCount: 1, seller: 'zola@ubuntutrade.co.za'
            },
            {
                name: 'Wilson Pro Staff RF97 Tennis Racket',
                description: 'Wilson Pro Staff RF97 V13 tennis racket. 97 sq in head, 340g strung. Strung with Luxilon Alu Power at 25kg. Light cosmetic scratches on frame. Grip replaced recently.',
                price: 2800, category: 'Sports', subcategory: 'Tennis', condition: 'Good',
                imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
                location: 'Pretoria, Gauteng', views: 87, rating: 4.5, reviewCount: 5, soldCount: 0, seller: 'lerato@ubuntutrade.co.za'
            },
            {
                name: 'Yoga Mat + 2 Resistance Bands',
                description: 'Premium 6mm thick non-slip yoga mat in sage green, plus 2 fabric resistance bands (medium and heavy). Never used — bought and then moved to gym. Bundle deal.',
                price: 350, category: 'Sports', subcategory: 'Fitness', condition: 'Brand New',
                imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
                location: 'Cape Town, Western Cape', views: 112, rating: 4.7, reviewCount: 8, soldCount: 3, seller: 'thabo@ubuntutrade.co.za'
            },
            // === JEWELRY ===
            {
                name: '14K White Gold Diamond Stud Earrings',
                description: '14K white gold diamond stud earrings with 0.5ct total weight (D-E colour, VS clarity). Comes with GIA certificate and original jewellery box. Perfect for gifting.',
                price: 6800, category: 'Jewelry', subcategory: 'Earrings', condition: 'Like New',
                imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
                location: 'Johannesburg, Gauteng', views: 158, rating: 4.9, reviewCount: 15, soldCount: 2, seller: 'zola@ubuntutrade.co.za'
            },
            {
                name: 'Sterling Silver Charm Bracelet',
                description: 'Beautiful 925 sterling silver charm bracelet with 8 charms (heart, star, elephant, feather, infinity, flower, key, moon). Gift box included. Never worn.',
                price: 680, category: 'Jewelry', subcategory: 'Bracelets', condition: 'Brand New',
                imageUrl: 'https://images.unsplash.com/photo-1573408301185-9519f94be03f?w=600&q=80',
                location: 'Durban, KwaZulu-Natal', views: 94, rating: 4.8, reviewCount: 9, soldCount: 4, seller: 'nomvula@ubuntutrade.co.za'
            },
        ];

        for (const p of products) {
            await conn.query(
                `INSERT INTO products (name, description, price, imageUrl, category, subcategory, \`condition\`, location, views, rating, reviewCount, soldCount, userId)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.name, p.description, p.price, p.imageUrl, p.category, p.subcategory, p.condition, p.location, p.views, p.rating, p.reviewCount, p.soldCount || 0, S(p.seller)]
            );
        }
        console.log(`Created ${products.length} products across ${[...new Set(products.map(p => p.category))].length} categories.`);

        console.log('\n Seed complete!\n');
        console.log('Admin login:');
        console.log('  admin@ubuntutrade.co.za / admin123');
        console.log('\nBuyer logins:');
        console.log('  amahle@gmail.com / pass123');
        console.log('  katlego@gmail.com / pass123');
        console.log('\nSeller logins (password: pass123):');
        users.filter(u => u.role === 'Seller').forEach(s => console.log(`  ${s.email}`));

    } catch (err) {
        console.error('Seed failed:', err.message);
        throw err;
    } finally {
        await conn.end();
        process.exit(0);
    }
}

seed();
