const router   = require('express').Router();
const CartItem = require('../models/CartItem');
const Product  = require('../models/Product');

// GET /api/cart/:userId
router.get('/:userId', async (req, res) => {
    try {
        const items = await CartItem.findByUser(req.params.userId);
        res.json({ items, summary: CartItem.buildSummary(items) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function addToCart(req, res) {
    try {
        const { userId, productId, quantity = 1 } = req.body;
        if (!userId || !productId) {
            return res.status(400).json({ message: 'userId and productId are required' });
        }
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.status !== 'Active') {
            return res.status(409).json({ message: 'This product is no longer available' });
        }

        const { item, created } = await CartItem.upsert(userId, productId, quantity);
        res.status(created ? 201 : 200).json({ success: true, message: 'Added to cart', item });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// POST /api/cart/add
router.post('/add', addToCart);

// POST /api/cart
router.post('/', addToCart);

// PUT /api/cart/:id
router.put('/:id', async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || Number(quantity) < 1) {
            return res.status(400).json({ message: 'quantity must be at least 1' });
        }
        const existing = await CartItem.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Cart item not found' });

        const item = await CartItem.updateQuantity(req.params.id, quantity);
        res.json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/cart/clear/:userId
router.delete('/clear/:userId', async (req, res) => {
    try {
        await CartItem.clearByUser(req.params.userId);
        res.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/cart/:id
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await CartItem.deleteById(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Cart item not found' });
        res.json({ success: true, message: 'Cart item removed' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
