const router      = require('express').Router();
const Product     = require('../models/Product');
const WishlistItem = require('../models/WishlistItem');

// POST /api/products/add
router.post('/add', async (req, res) => {
    try {
        if (!req.body.name || req.body.price === undefined) {
            return res.status(400).json({ message: 'name and price are required' });
        }
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, message: 'Product created successfully!', data: product });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/products
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll(req.query);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/products/seller/:userId
router.get('/seller/:userId', async (req, res) => {
    try {
        const products = await Product.findBySeller(req.params.userId);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
    try {
        const existing = await Product.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Product not found' });
        const updated = await Product.update(req.params.id, req.body);
        if (!updated) return res.status(400).json({ message: 'No valid fields to update' });
        res.json({ success: true, message: 'Product updated successfully', data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
    try {
        const existing = await Product.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Product not found' });
        await Product.softDelete(req.params.id);
        res.json({ success: true, message: 'Product removed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/products/:id/wishlist
router.post('/:id/wishlist', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: 'userId is required' });
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const existing = await WishlistItem.findOne(userId, req.params.id);
        if (existing) return res.status(200).json({ success: true, data: existing });

        const item = await WishlistItem.create(userId, req.params.id);
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/products/:id/wishlist/:userId
router.delete('/:id/wishlist/:userId', async (req, res) => {
    try {
        await WishlistItem.delete(req.params.userId, req.params.id);
        res.json({ success: true, message: 'Wishlist item removed' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/products/:id  — MUST stay last
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await Product.incrementViews(req.params.id);
        product.views = (product.views || 0) + 1;
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
