import mongoose from "mongoose";

const VendorProfileSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String
    },
    documents: [{
        type: String
    }],

    documentReviewStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
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
});

export default mongoose.model('VendorProfile', VendorProfileSchema);
