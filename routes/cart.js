const router = require('express').Router();
const { CartItem, Product, User } = require('../models');

const cartInclude = [
    {
        model: Product,
        as: 'product',
        include: [
            {
                model: User,
                as: 'seller',
                attributes: ['id', 'username', 'fullName', 'location', 'avatarUrl']
            }
        ]
    }
];

function buildCartSummary(cartItems) {
    const subtotal = cartItems.reduce((sum, item) => {
        const price = Number(item.product ? item.product.price : 0);
        return sum + price * item.quantity;
    }, 0);
    const deliveryFee = subtotal > 0 && subtotal < 1000 ? 60 : 0;

    return {
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee
    };
}

// GET: /api/cart/:userId (Fetch a user's cart with totals)
router.get('/:userId', async (req, res) => {
    try {
        const cartItems = await CartItem.findAll({
            where: { userId: req.params.userId },
            include: cartInclude,
            order: [['createdAt', 'DESC']]
        });

        res.json({ items: cartItems, summary: buildCartSummary(cartItems) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: /api/cart/add (Add a product to the cart)
router.post('/add', (req, res) => {
    addToCart(req, res);
});

// POST: /api/cart (Add a product to the cart)
router.post('/', addToCart);

async function addToCart(req, res) {
    try {
        const { userId, productId, quantity = 1 } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ message: "userId and productId are required" });
        }

        const product = await Product.findByPk(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const [cartItem, created] = await CartItem.findOrCreate({
            where: { userId, productId },
            defaults: { quantity }
        });

        if (!created) {
            await cartItem.increment('quantity', { by: Number(quantity) || 1 });
            await cartItem.reload();
        }

        res.status(created ? 201 : 200).json({
            success: true,
            message: "Added to cart",
            item: cartItem
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// PUT: /api/cart/:id (Update a cart item quantity)
router.put('/:id', async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || Number(quantity) < 1) {
            return res.status(400).json({ message: "quantity must be at least 1" });
        }

        const cartItem = await CartItem.findByPk(req.params.id);
        if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

        await cartItem.update({ quantity });
        res.json({ success: true, item: cartItem });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE: /api/cart/clear/:userId (Clear all cart items for a user)
router.delete('/clear/:userId', async (req, res) => {
    try {
        await CartItem.destroy({ where: { userId: req.params.userId } });
        res.json({ success: true, message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE: /api/cart/:id (Remove a cart item)
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await CartItem.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: "Cart item not found" });

        res.json({ success: true, message: "Cart item removed" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
