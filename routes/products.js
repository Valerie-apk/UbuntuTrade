const router = require('express').Router();
const { Op } = require('sequelize');
const { Product, User, WishlistItem } = require('../models');

const productInclude = [
    {
        model: User,
        as: 'seller',
        attributes: ['id', 'username', 'fullName', 'email', 'location', 'avatarUrl', 'isVerified', 'rating', 'responseRate']
    }
];

// POST: /api/products/add (Create a product)
router.post('/add', async (req, res) => {
    try {
        const {
            name,
            description,
            imageUrl,
            images,
            price,
            category,
            subcategory,
            condition,
            location,
            userId
        } = req.body;
        
        const newProduct = await Product.create({
            name,
            description,
            imageUrl: imageUrl || 'default-product.png', 
            images,
            price,
            category,
            subcategory,
            condition,
            location,
            userId
        });

        res.status(201).json({ 
            success: true,
            message: "Product created successfully!", 
            data: newProduct 
        });
    } catch (error) {
        // This will catch things like missing fields or Foreign Key errors
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// GET: /api/products (Fetch all from DB)
router.get('/', async (req, res) => {
    try {
        const {
            search,
            category,
            location,
            status = 'Active',
            minPrice,
            maxPrice,
            sort = 'newest'
        } = req.query;

        const where = {};

        if (status && status !== 'all') where.status = status;
        if (category) where.category = category;
        if (location) where.location = { [Op.like]: `%${location}%` };
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { category: { [Op.like]: `%${search}%` } }
            ];
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = Number(minPrice);
            if (maxPrice) where.price[Op.lte] = Number(maxPrice);
        }

        const orderMap = {
            newest: [['createdAt', 'DESC']],
            'price-low': [['price', 'ASC']],
            'price-high': [['price', 'DESC']],
            popular: [['views', 'DESC']]
        };

        const products = await Product.findAll({
            where,
            include: productInclude,
            order: orderMap[sort] || orderMap.newest
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: /api/products/seller/:userId (Fetch listings by seller)
router.get('/seller/:userId', async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { userId: req.params.userId },
            include: productInclude,
            order: [['createdAt', 'DESC']]
        });

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT: /api/products/:id (Update product)
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        await product.update(req.body);
        res.json({ success: true, message: "Product updated successfully", data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE: /api/products/:id (Soft remove product)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        await product.update({ status: 'Removed' });
        res.json({ success: true, message: "Product removed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST: /api/products/:id/wishlist
router.post('/:id/wishlist', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: "userId is required" });

        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const [wishlistItem, created] = await WishlistItem.findOrCreate({
            where: { userId, productId: req.params.id }
        });

        res.status(created ? 201 : 200).json({ success: true, data: wishlistItem });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE: /api/products/:id/wishlist/:userId
router.delete('/:id/wishlist/:userId', async (req, res) => {
    try {
        await WishlistItem.destroy({
            where: {
                userId: req.params.userId,
                productId: req.params.id
            }
        });

        res.json({ success: true, message: "Wishlist item removed" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET: /api/products/:id (Fetch single item)
// Note: Keep this BELOW the /add route so 'add' isn't treated as an ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, { include: productInclude });
        if (!product) return res.status(404).json({ message: "Product not found" });

        await product.increment('views');
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
