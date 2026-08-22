import express from 'express';
import db from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, (req, res) => {
  try {
    const notifications = db.getCollection('notifications');
    const userNotifs = notifications.filter(
      n => n.recipientId === req.user.id || n.recipientId === 'all'
    );

    // Sort newest first
    userNotifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const unreadCount = userNotifs.filter(n => !n.read).length;

    return res.json({
      success: true,
      unreadCount,
      notifications: userNotifs
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving notifications.' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const notifications = db.getCollection('notifications');
    const notif = notifications.find(n => n.id === id);

    if (notif) {
      notif.read = true;
      db.setCollection('notifications', notifications);
    }

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark read error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Mark all as read
router.put('/mark-all/read', authenticateToken, (req, res) => {
  try {
    const notifications = db.getCollection('notifications');
    notifications.forEach(n => {
      if (n.recipientId === req.user.id || n.recipientId === 'all') {
        n.read = true;
      }
    });
    db.setCollection('notifications', notifications);

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all read error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

export default router;
