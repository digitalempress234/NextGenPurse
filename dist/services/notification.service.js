import prisma from "../config/prismaClient.js";
import { toIntId, withMongoId } from "../utils/prismaHelpers.js";
const getEntityId = (value) => toIntId(value?.id ?? value?._id ?? value, "recipient id");
class NotificationService {
    async createNotification(recipientId, title, message, type, data = {}, priority = "medium") {
        const notification = await prisma.notification.create({
            data: {
                recipientId: getEntityId(recipientId),
                title,
                message,
                type,
                data,
                priority,
                isRead: false,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });
        return withMongoId(notification);
    }
    async getUserNotifications(userId, page = 1, limit = 20, includeRead = true) {
        const id = getEntityId(userId);
        const take = Math.min(100, Math.max(1, Number(limit) || 20));
        const currentPage = Math.max(1, Number(page) || 1);
        const where = { recipientId: id };
        if (!includeRead)
            where.isRead = false;
        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (currentPage - 1) * take,
                take,
            }),
            prisma.notification.count({ where }),
        ]);
        const totalPages = Math.ceil(total / take);
        return {
            notifications: withMongoId(notifications),
            pagination: {
                currentPage,
                totalPages,
                totalNotifications: total,
                hasNext: currentPage < totalPages,
                hasPrev: currentPage > 1,
            },
        };
    }
    async markAsRead(notificationId, userId) {
        const notification = await prisma.notification.findFirst({
            where: { id: toIntId(notificationId, "notification id"), recipientId: getEntityId(userId) },
        });
        if (!notification)
            throw new Error("Notification not found or access denied");
        return withMongoId(await prisma.notification.update({
            where: { id: notification.id },
            data: { isRead: true, readAt: new Date() },
        }));
    }
    async markAllAsRead(userId) {
        const result = await prisma.notification.updateMany({
            where: { recipientId: getEntityId(userId), isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
        return { modifiedCount: result.count, count: result.count };
    }
    async getUnreadCount(userId) {
        return prisma.notification.count({ where: { recipientId: getEntityId(userId), isRead: false } });
    }
    async deleteNotification(notificationId, userId) {
        const notification = await prisma.notification.findFirst({
            where: { id: toIntId(notificationId, "notification id"), recipientId: getEntityId(userId) },
        });
        if (!notification)
            throw new Error("Notification not found or access denied");
        return withMongoId(await prisma.notification.delete({ where: { id: notification.id } }));
    }
    async notifyOrderPlaced(order, customer) {
        return this.createNotification(customer?.id ?? customer?._id ?? customer, "Order Placed Successfully", `Your order #${order.orderNumber} has been placed successfully.`, "order_placed", { orderId: order.id ?? order._id, orderNumber: order.orderNumber, total: order.total }, "high");
    }
    async notifyOrderStatusUpdate(order, customer, vendor = null) {
        const recipients = [customer?.id ?? customer?._id ?? customer];
        if (vendor)
            recipients.push(vendor?.id ?? vendor?._id ?? vendor);
        return Promise.all(recipients.map((recipientId) => this.createNotification(recipientId, "Order Status Update", `Order #${order.orderNumber} status updated to: ${order.currentStatus}`, "order_status_update", { orderId: order.id ?? order._id, orderNumber: order.orderNumber, status: order.currentStatus }, "medium")));
    }
    async notifyVendorApproved(vendor) {
        return this.createNotification(vendor.id ?? vendor._id, "Vendor Application Approved", "Congratulations! Your vendor application has been approved. You can now start selling products.", "vendor_approved", { vendorId: vendor.id ?? vendor._id, approvedAt: new Date() }, "high");
    }
    async notifyVendorRejected(vendor, reason = "") {
        return this.createNotification(vendor.id ?? vendor._id, "Vendor Application Rejected", `Your vendor application has been rejected.${reason ? ` Reason: ${reason}` : ""}`, "vendor_rejected", { vendorId: vendor.id ?? vendor._id, rejectedAt: new Date(), reason }, "medium");
    }
    async notifyPaymentReceived(order, customer) {
        return this.createNotification(customer?.id ?? customer?._id ?? customer, "Payment Received", `Payment for order #${order.orderNumber} has been received successfully.`, "payment_received", { orderId: order.id ?? order._id, orderNumber: order.orderNumber, amount: order.payment?.total }, "high");
    }
    async notifyNewReview(product, vendor, review) {
        return this.createNotification(vendor.id ?? vendor._id, "New Product Review", `Your product "${product.productName}" received a ${review.rating}-star review.`, "new_review", { productId: product.id ?? product._id, productName: product.productName, reviewId: review.id ?? review._id, rating: review.rating }, "low");
    }
    async notifyDeliveryAssigned(order, customer, rider) {
        return this.createNotification(customer?.id ?? customer?._id ?? customer, "Delivery Assigned", `A delivery rider has been assigned to your order #${order.orderNumber}.`, "delivery_assigned", { orderId: order.id ?? order._id, orderNumber: order.orderNumber, riderName: rider.name, riderPhone: rider.phone }, "medium");
    }
    async notifyDeliveryCompleted(order, customer) {
        return this.createNotification(customer?.id ?? customer?._id ?? customer, "Order Delivered", `Your order #${order.orderNumber} has been delivered successfully.`, "delivery_completed", { orderId: order.id ?? order._id, orderNumber: order.orderNumber, deliveredAt: new Date() }, "high");
    }
}
export default new NotificationService();
//# sourceMappingURL=notification.service.js.map