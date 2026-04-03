import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
    },
    productName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discountPrice: {
        type: Number,
        default: 0
    },
    discountPercentage: {
        type: Number,
        default: 0
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'fixed'
    },
    category: {
        type: String,
        ref: 'Category',
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    totalSold: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        required: true
    },
    ratingsAverage: {
        type: Number,
        default: 0,
    },
    expiryDate: {
        type: Date
    },
    images: [{
        type: [String],
        required: true
    }],
    ratingsCount: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

ProductSchema.index({ name: "text", description: "text" });

export default mongoose.model('Product', ProductSchema);
