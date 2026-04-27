import Notification from '../models/Notification.js';

class NotificationService {
    // Create a new notification
    async createNotification(recipientId, title, message, type, data = {}, priority = 'medium') {
        try {
            return await Notification.create({
                recipient: recipientId,
                title,
                message,
                type,
                data,
                priority,
                isRead: false,
            });
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // Get notifications for a user
    async getUserNotifications(userId, page = 1, limit = 20, includeRead = true) {
        try {
            const query = { recipient: userId };
            if (!includeRead) {
                query.isRead = false;
            }

            const notifications = await Notification.find(query)
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .lean();

            const total = await Notification.countDocuments(query);
            const totalPages = Math.ceil(total / limit);

            return {
                notifications,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalNotifications: total,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    // Mark notification as read
    async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: userId },
                { isRead: true, readAt: new Date() },
                { new: true }
            );

            if (!notification) {
                throw new Error('Notification not found or access denied');
            }

            return notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Mark all notifications as read for a user
    async markAllAsRead(userId) {
        try {
            const result = await Notification.updateMany(
                { recipient: userId, isRead: false },
                { isRead: true, readAt: new Date() }
            );
            return result;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    // Get unread count for a user
    async getUnreadCount(userId) {
        try {
            const count = await Notification.getUnreadCount(userId);
            return count;
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }

    // Delete a notification
    async deleteNotification(notificationId, userId) {
        try {
            const result = await Notification.findOneAndDelete({
                _id: notificationId,
                recipient: userId
            });

            if (!result) {
                throw new Error('Notification not found or access denied');
            }

            return result;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    // Predefined notification templates
    async notifyOrderPlaced(order, customer) {
        const customerId = customer?._id || customer;
        return this.createNotification(
            customerId,
            'Order Placed Successfully',
            `Your order #${order.orderNumber} has been placed successfully.`,
            'order_placed',
            {
                orderId: order._id,
                orderNumber: order.orderNumber,
                total: order.total
            },
            'high'
        );
    }

    async notifyOrderStatusUpdate(order, customer, vendor = null) {
        const customerId = customer?._id || customer;
        const vendorId = vendor?._id || vendor;

        const recipients = [customerId];
        if (vendorId) recipients.push(vendorId);

        const notifications = recipients.map(recipientId =>
            this.createNotification(
                recipientId,
                'Order Status Update',
                `Order #${order.orderNumber} status updated to: ${order.currentStatus}`,
                'order_status_update',
                {
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    status: order.currentStatus
                },
                'medium'
            )
        );

        return Promise.all(notifications);
    }

    async notifyVendorApproved(vendor) {
        return this.createNotification(
            vendor._id,
            'Vendor Application Approved',
            'Congratulations! Your vendor application has been approved. You can now start selling products.',
            'vendor_approved',
            {
                vendorId: vendor._id,
                approvedAt: new Date()
            },
            'high'
        );
    }

    async notifyVendorRejected(vendor, reason = '') {
        return this.createNotification(
            vendor._id,
            'Vendor Application Rejected',
            `Your vendor application has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
            'vendor_rejected',
            {
                vendorId: vendor._id,
                rejectedAt: new Date(),
                reason
            },
            'medium'
        );
    }

    async notifyPaymentReceived(order, customer) {
        const customerId = customer?._id || customer;
        return this.createNotification(
            customerId,
            'Payment Received',
            `Payment for order #${order.orderNumber} has been received successfully.`,
            'payment_received',
            {
                orderId: order._id,
                orderNumber: order.orderNumber,
                amount: order.payment.total
            },
            'high'
        );
    }

    async notifyNewReview(product, vendor, review) {
        return this.createNotification(
            vendor._id,
            'New Product Review',
            `Your product "${product.productName}" received a ${review.rating}-star review.`,
            'new_review',
            {
                productId: product._id,
                productName: product.productName,
                reviewId: review._id,
                rating: review.rating
            },
            'low'
        );
    }

    async notifyDeliveryAssigned(order, customer, rider) {
        return this.createNotification(
            customer._id,
            'Delivery Assigned',
            `A delivery rider has been assigned to your order #${order.orderNumber}.`,
            'delivery_assigned',
            {
                orderId: order._id,
                orderNumber: order.orderNumber,
                riderName: rider.name,
                riderPhone: rider.phone
            },
            'medium'
        );
    }

    async notifyDeliveryCompleted(order, customer) {
        return this.createNotification(
            customer._id,
            'Order Delivered',
            `Your order #${order.orderNumber} has been delivered successfully.`,
            'delivery_completed',
            {
                orderId: order._id,
                orderNumber: order.orderNumber,
                deliveredAt: new Date()
            },
            'high'
        );
    }
}

export default new NotificationService();
