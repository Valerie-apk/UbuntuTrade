const router  = require('express').Router();
const Payment = require('../models/Payment');
const Order   = require('../models/Order');
const pool    = require('../config/db');

// GET /api/pay/:userId
router.get('/:userId', async (req, res) => {
    try {
        const payments = await Payment.findByUser(req.params.userId);
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/pay/checkout
router.post('/checkout', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { orderId, userId, amount, method = 'Card' } = req.body;
        if (!orderId || !userId || !amount) {
            return res.status(400).json({ message: 'orderId, userId and amount are required' });
        }
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        await conn.beginTransaction();

        const [existingPayments] = await conn.query('SELECT id FROM payments WHERE orderId = ? LIMIT 1', [orderId]);
        if (existingPayments.length > 0) {
            await conn.rollback();
            return res.status(409).json({ status: 'Payment Already Recorded' });
        }

        const transactionId = `TXN_${Date.now()}`;
        const [paymentResult] = await conn.query(
            "INSERT INTO payments (orderId, userId, amount, method, transactionId, status) VALUES (?, ?, ?, ?, ?, 'Successful')",
            [orderId, userId, amount, method, transactionId]
        );
        await conn.query('UPDATE orders SET status = ? WHERE id = ?', ['Paid', orderId]);
        await conn.query(
            `UPDATE products p
             JOIN order_items oi ON oi.productId = p.id
             SET p.status = 'Sold', p.soldCount = p.soldCount + oi.quantity
             WHERE oi.orderId = ? AND p.status = 'Active'`,
            [orderId]
        );
        await conn.query(
            `DELETE ci FROM cart_items ci
             JOIN order_items oi ON oi.productId = ci.productId
             WHERE oi.orderId = ?`,
            [orderId]
        );
        await conn.query(
            `DELETE wi FROM wishlist_items wi
             JOIN order_items oi ON oi.productId = wi.productId
             WHERE oi.orderId = ?`,
            [orderId]
        );

        await conn.commit();

        const payment = await Payment.findById(paymentResult.insertId);

        res.status(201).json({ status: 'Payment Successful', transactionId, payment });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ status: 'Payment Failed', error: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;
