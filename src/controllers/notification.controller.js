import notificationService from '../services/notification.service.js';
import asyncHandler from 'express-async-handler';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 20, includeRead = 'true' } = req.query;

    const result = await notificationService.getUserNotifications(
        userId,
        parseInt(page),
        parseInt(limit),
        includeRead === 'true'
    );

    res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: result.pagination
    });
});

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
        success: true,
        data: { unreadCount: count }
    });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await notificationService.markAsRead(notificationId, userId);

    res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification
    });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const result = await notificationService.markAllAsRead(userId);

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        data: { modifiedCount: result.modifiedCount }
    });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const notificationId = req.params.id;

    await notificationService.deleteNotification(notificationId, userId);

    res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
    });
});