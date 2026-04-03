import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    storeName: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

StoreSchema.index({ category: 1 });

export default mongoose.model('Store', StoreSchema);
