const router = require('express').Router();
const { Payment, Order } = require('../models');

// GET: /api/pay/:userId (Fetch all payments for a user)
router.get('/:userId', async (req, res) => {
    try {
        const payments = await Payment.findAll({
            where: { userId: req.params.userId },
            include: [{ model: Order, as: 'order' }],
            order: [['createdAt', 'DESC']]
        });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: /api/pay/checkout (Create a successful payment for an order)
router.post('/checkout', async (req, res) => {
    try {
        const { orderId, userId, amount, method = 'Card' } = req.body;

        if (!orderId || !userId || !amount) {
            return res.status(400).json({ message: "orderId, userId and amount are required" });
        }

        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const transactionId = `TXN_${Date.now()}`;
        const payment = await Payment.create({
            orderId,
            userId,
            amount,
            method,
            transactionId,
            status: 'Successful'
        });

        await order.update({ status: 'Paid' });

        res.status(201).json({
            status: "Payment Successful",
            transactionId,
            payment
        });
    } catch (error) {
        res.status(500).json({ status: "Payment Failed", error: error.message });
    }
});

module.exports = router;
