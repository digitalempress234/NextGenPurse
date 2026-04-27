import express from 'express';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// GET /api/notifications - Get user notifications
router.get('/', getNotifications);

// GET /api/notifications/unread-count - Get unread count
router.get('/unread-count', getUnreadCount);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', markAsRead);

// PUT /api/notifications/mark-all-read - Mark all as read
router.put('/mark-all-read', markAllAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', deleteNotification);

export default router;