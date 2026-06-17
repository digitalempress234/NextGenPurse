import notificationService from '../services/notification.service.js';
import asyncHandler from 'express-async-handler';
export const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 20, includeRead = 'true' } = req.query;
    const result = await notificationService.getUserNotifications(userId, Number(page), Number(limit), includeRead === 'true');
    res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: result.pagination
    });
});
export const getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const count = await notificationService.getUnreadCount(userId);
    res.status(200).json({
        success: true,
        data: { unreadCount: count }
    });
});
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
export const markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const result = await notificationService.markAllAsRead(userId);
    res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        data: { modifiedCount: result.modifiedCount }
    });
});
export const deleteNotification = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const notificationId = req.params.id;
    await notificationService.deleteNotification(notificationId, userId);
    res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
    });
});
//# sourceMappingURL=notification.controller.js.map