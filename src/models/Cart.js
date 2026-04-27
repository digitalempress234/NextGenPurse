import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            store: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Store",
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
            }
        }
    ],
    currency: {
        type: String,
        default: "NGN"
    },
    shippingFee: {
        type: Number,
        default: 0
    },
    subtotal: {
        type: Number,
        default: 0
    },
    totalItems: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model("Cart", CartSchema);