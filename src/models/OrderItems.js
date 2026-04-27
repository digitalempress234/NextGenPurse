import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        index: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    productName: {
        type: String,
        required: true
    },
    productCode: {
        type: String,
        required: true
    },
    productImage: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model("OrderItem", OrderItemSchema);
