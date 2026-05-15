const router = require('express').Router();
const { CartItem, Order, OrderItem, Product, Payment, User } = require('../models');

const deliveryFeeFor = subtotal => (subtotal > 0 && subtotal < 1000 ? 60 : 0);

// GET: /api/orders/detail/:id (Fetch one order with items and payment)
router.get('/detail/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            include: [{ model: User, as: 'seller', attributes: ['id', 'username', 'fullName'] }]
                        }
                    ]
                },
                { model: Payment, as: 'payment' }
            ]
        });

        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: /api/orders/:userId (Fetch all orders for a user)
router.get('/:userId', async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.params.userId },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                },
                { model: Payment, as: 'payment' }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: /api/orders/checkout (Create an order from a user's cart)
router.post('/checkout', async (req, res) => {
    try {
        const { userId, deliveryAddress, notes } = req.body;
        if (!userId) return res.status(400).json({ message: "userId is required" });

        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [{ model: Product, as: 'product' }]
        });

        if (!cartItems.length) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const subtotal = cartItems.reduce((sum, item) => {
            return sum + Number(item.product.price) * item.quantity;
        }, 0);
        const deliveryFee = deliveryFeeFor(subtotal);

        const order = await Order.create({
            userId,
            deliveryAddress,
            notes,
            subtotal,
            deliveryFee,
            total: subtotal + deliveryFee
        });

        const orderItems = await Promise.all(cartItems.map(item => {
            const unitPrice = Number(item.product.price);
            return OrderItem.create({
                orderId: order.id,
                productId: item.productId,
                sellerId: item.product.userId,
                productName: item.product.name,
                unitPrice,
                quantity: item.quantity,
                lineTotal: unitPrice * item.quantity
            });
        }));

        await CartItem.destroy({ where: { userId } });

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: { order, items: orderItems }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
