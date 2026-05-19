const router  = require('express').Router();
const Payment = require('../models/Payment');
const Order   = require('../models/Order');

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
    try {
        const { orderId, userId, amount, method = 'Card' } = req.body;
        if (!orderId || !userId || !amount) {
            return res.status(400).json({ message: 'orderId, userId and amount are required' });
        }
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const transactionId = `TXN_${Date.now()}`;
        const payment = await Payment.create({ orderId, userId, amount, method, transactionId });
        await Order.updateStatus(orderId, 'Paid');

        res.status(201).json({ status: 'Payment Successful', transactionId, payment });
    } catch (err) {
        res.status(500).json({ status: 'Payment Failed', error: err.message });
    }
});

module.exports = router;
