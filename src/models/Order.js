import mongoose from "mongoose";

const ORDER_STATUSES = [
    "Order Received",
    "confirmed",
    "preparing",
    "ready_for_delivery",
    "out_for_delivery",
    "delivered",
    "cancelled"
];

const OrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true
    },
    items: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OrderItem",
            required: true
        }
    ],
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String }
    },
    shippingAddress: {
        label: { type: String },
        state: { type: String },
        city: { type: String },
        address: { type: String }
    },
    currency: {
        type: String,
        default: "NGN"
    },
    subtotal: {
        type: Number,
        default: 0,
        min: 0
    },
    shippingFee: {
        type: Number,
        default: 0,
        min: 0
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        default: 0,
        min: 0
    },
    currentStatus: {
        type: String,
        enum: ORDER_STATUSES,
        default: "Order Received"
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment"
    },
    delivery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Delivery"
    },
    placedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ store: 1, createdAt: -1 });

export default mongoose.model("Order", OrderSchema);
