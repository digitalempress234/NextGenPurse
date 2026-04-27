import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: [
            'order_placed',
            'order_status_update',
            'order_cancelled',
            'payment_received',
            'payment_failed',
            'vendor_approved',
            'vendor_rejected',
            'new_review',
            'product_out_of_stock',
            'delivery_assigned',
            'delivery_completed',
            'system_announcement'
        ],
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
}, {
    timestamps: true
});

// Indexes for performance
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance methods
NotificationSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

// Static methods
NotificationSchema.statics.getUnreadCount = function(userId) {
    return this.countDocuments({ recipient: userId, isRead: false });
};

NotificationSchema.statics.markAllAsRead = function(userId) {
    return this.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true, readAt: new Date() }
    );
};

export default mongoose.model('Notification', NotificationSchema);