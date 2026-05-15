const router = require('express').Router();
const { Op } = require('sequelize');
const { Conversation, Message, Product, User } = require('../models');

const conversationInclude = [
    { model: Product, as: 'product', attributes: ['id', 'name', 'imageUrl', 'price'] },
    { model: User, as: 'buyer', attributes: ['id', 'username', 'fullName', 'avatarUrl'] },
    { model: User, as: 'seller', attributes: ['id', 'username', 'fullName', 'avatarUrl'] }
];

// GET: /api/messages/conversations/:userId (Fetch all conversations for a user)
router.get('/conversations/:userId', async (req, res) => {
    try {
        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { buyerId: req.params.userId },
                    { sellerId: req.params.userId }
                ]
            },
            include: conversationInclude,
            order: [['updatedAt', 'DESC']]
        });

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: /api/messages/conversations (Create or find a conversation)
router.post('/conversations', async (req, res) => {
    try {
        const { productId, buyerId, sellerId } = req.body;
        if (!buyerId || !sellerId) {
            return res.status(400).json({ message: "buyerId and sellerId are required" });
        }

        const [conversation, created] = await Conversation.findOrCreate({
            where: { productId: productId || null, buyerId, sellerId },
            defaults: { productId, buyerId, sellerId }
        });

        res.status(created ? 201 : 200).json({ success: true, data: conversation });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET: /api/messages/conversations/:conversationId/messages (Fetch messages in a conversation)
router.get('/conversations/:conversationId/messages', async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: { conversationId: req.params.conversationId },
            include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'fullName', 'avatarUrl'] }],
            order: [['createdAt', 'ASC']]
        });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: /api/messages/conversations/:conversationId/messages (Send a message)
router.post('/conversations/:conversationId/messages', async (req, res) => {
    try {
        const { senderId, body } = req.body;
        if (!senderId || !body) {
            return res.status(400).json({ message: "senderId and body are required" });
        }

        const conversation = await Conversation.findByPk(req.params.conversationId);
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        const message = await Message.create({
            conversationId: req.params.conversationId,
            senderId,
            body
        });

        const unreadField = Number(senderId) === Number(conversation.buyerId) ? 'unreadForSeller' : 'unreadForBuyer';
        await conversation.increment(unreadField);
        await conversation.update({ lastMessage: body });

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT: /api/messages/conversations/:conversationId/read (Mark a conversation as read)
router.put('/conversations/:conversationId/read', async (req, res) => {
    try {
        const { userId } = req.body;
        const conversation = await Conversation.findByPk(req.params.conversationId);
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        const unreadUpdate = Number(userId) === Number(conversation.buyerId)
            ? { unreadForBuyer: 0 }
            : { unreadForSeller: 0 };

        await conversation.update(unreadUpdate);
        await Message.update(
            { isRead: true },
            {
                where: {
                    conversationId: req.params.conversationId,
                    senderId: { [Op.ne]: userId }
                }
            }
        );

        res.json({ success: true, message: "Conversation marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
