const router    = require('express').Router();
const Order     = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const CartItem  = require('../models/CartItem');
const pool      = require('../config/db');

const deliveryFeeFor = subtotal => (subtotal > 0 ? 60 : 0);

// GET /api/orders/detail/:id
router.get('/detail/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/orders/:userId
router.get('/:userId', async (req, res) => {
    try {
        const orders = await Order.findByUser(req.params.userId);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/orders/:id/cancel
router.put('/:id/cancel', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: 'userId is required' });

        await conn.beginTransaction();

        const [[order]] = await conn.query('SELECT id, userId, status FROM orders WHERE id = ? FOR UPDATE', [req.params.id]);
        if (!order) {
            await conn.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }
        if (Number(order.userId) !== Number(userId)) {
            await conn.rollback();
            return res.status(403).json({ message: 'You cannot cancel this order' });
        }
        if (!['Pending', 'Paid', 'Processing'].includes(order.status)) {
            await conn.rollback();
            return res.status(409).json({ message: 'This order can no longer be cancelled' });
        }

        await conn.query('UPDATE orders SET status = ? WHERE id = ?', ['Cancelled', req.params.id]);
        await conn.query(
            `UPDATE products p
             JOIN order_items oi ON oi.productId = p.id
             SET p.status = 'Active', p.soldCount = GREATEST(p.soldCount - oi.quantity, 0)
             WHERE oi.orderId = ? AND p.status = 'Sold'`,
            [req.params.id]
        );

        await conn.commit();
        res.json({ success: true, message: 'Order cancelled' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, error: err.message });
    } finally {
        conn.release();
    }
});

// POST /api/orders/checkout
router.post('/checkout', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { userId, deliveryAddress, notes } = req.body;
        if (!userId) return res.status(400).json({ message: 'userId is required' });

        const [cartRows] = await conn.query(
            `SELECT ci.*, p.price, p.name AS productName, p.userId AS sellerId, p.status
             FROM cart_items ci
             JOIN products p ON ci.productId = p.id
             WHERE ci.userId = ?`,
            [userId]
        );
        if (cartRows.length === 0) return res.status(400).json({ message: 'Cart is empty' });
        const unavailable = cartRows.filter(item => item.status !== 'Active');
        if (unavailable.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Some items in your cart are no longer available',
                items: unavailable.map(item => item.productName)
            });
        }

        const subtotal    = cartRows.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
        const deliveryFee = deliveryFeeFor(subtotal);

        await conn.beginTransaction();

        const orderId = await Order.create({ userId, deliveryAddress, notes, subtotal, deliveryFee, total: subtotal + deliveryFee });

        const orderItems = await Promise.all(cartRows.map(item => {
            const unitPrice = Number(item.price);
            return OrderItem.create({
                orderId, productId: item.productId, sellerId: item.sellerId,
                productName: item.productName, unitPrice, quantity: item.quantity,
                lineTotal: unitPrice * item.quantity
            });
        }));

        await CartItem.clearByUser(userId);
        await conn.commit();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order: { id: orderId, userId, subtotal, deliveryFee, total: subtotal + deliveryFee, status: 'Pending', deliveryAddress, notes },
                items: orderItems
            }
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, error: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;
