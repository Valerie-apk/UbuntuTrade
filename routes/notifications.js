const router = require('express').Router();
const Notification = require('../models/Notification');

// Ensure table exists on startup
Notification.ensureTable().catch(err => console.error('Failed to create notifications table:', err.message));

// GET /api/notifications/:userId
router.get('/:userId', async (req, res) => {
    try {
        const notifications = await Notification.findByUser(req.params.userId);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/notifications/unread/:userId
router.get('/unread/:userId', async (req, res) => {
    try {
        const notifications = await Notification.findUnread(req.params.userId);
        const count = await Notification.getUnreadCount(req.params.userId);
        res.json({ notifications, count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/notifications/count/:userId
router.get('/count/:userId', async (req, res) => {
    try {
        const count = await Notification.getUnreadCount(req.params.userId);
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
    try {
        await Notification.markAsRead(req.params.id);
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/notifications/markAll/:userId/read
router.put('/markAll/:userId/read', async (req, res) => {
    try {
        await Notification.markAllAsRead(req.params.userId);
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
    try {
        await Notification.delete(req.params.id);
        res.json({ success: true, message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
