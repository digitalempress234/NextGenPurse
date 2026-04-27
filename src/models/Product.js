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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
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
    images: {
        type: [String],
        required: true
    },
    ratingsCount: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true});


// Indexes for search and filtering
ProductSchema.index({ productName: "text", description: "text" }); // search
ProductSchema.index({ category: 1 });
ProductSchema.index({ subCategory: 1 });
ProductSchema.index({ price: 1 });

export default mongoose.model('Product', ProductSchema);