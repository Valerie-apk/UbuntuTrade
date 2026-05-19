const router       = require('express').Router();
const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');

// GET /api/messages/conversations/:userId
router.get('/conversations/:userId', async (req, res) => {
    try {
        const conversations = await Conversation.findByUser(req.params.userId);
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/messages/conversations
router.post('/conversations', async (req, res) => {
    try {
        const { productId, buyerId, sellerId } = req.body;
        if (!buyerId || !sellerId) {
            return res.status(400).json({ message: 'buyerId and sellerId are required' });
        }
        const existing = await Conversation.findOne(productId, buyerId, sellerId);
        if (existing) return res.status(200).json({ success: true, data: existing });

        const conversation = await Conversation.create(productId, buyerId, sellerId);
        res.status(201).json({ success: true, data: conversation });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/messages/conversations/:conversationId/messages
router.get('/conversations/:conversationId/messages', async (req, res) => {
    try {
        const messages = await Message.findByConversation(req.params.conversationId);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/messages/conversations/:conversationId/messages
router.post('/conversations/:conversationId/messages', async (req, res) => {
    try {
        const { senderId, body } = req.body;
        if (!senderId || !body) {
            return res.status(400).json({ message: 'senderId and body are required' });
        }
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

        const message = await Message.create(req.params.conversationId, senderId, body);
        const unreadField = Number(senderId) === Number(conversation.buyerId) ? 'unreadForSeller' : 'unreadForBuyer';
        await Conversation.updateLastMessage(req.params.conversationId, body, unreadField);

        res.status(201).json({ success: true, data: message });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT /api/messages/conversations/:conversationId/read
router.put('/conversations/:conversationId/read', async (req, res) => {
    try {
        const { userId } = req.body;
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

        const unreadField = Number(userId) === Number(conversation.buyerId) ? 'unreadForBuyer' : 'unreadForSeller';
        await Conversation.markRead(req.params.conversationId, unreadField);
        await Message.markRead(req.params.conversationId, userId);

        res.json({ success: true, message: 'Conversation marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
