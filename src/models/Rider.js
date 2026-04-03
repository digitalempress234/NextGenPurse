import mongoose from "mongoose";

const RiderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    riderBVN: {
        type: String,
        unique: true,
        required: true
    },
    availability: {
        type: String,
        enum: ['available', 'on trip', 'suspended', 'unverified', 'offline']
    },
    lastSeen: {
        type: Date
    },
    trips: {
        type: Number,
        default: 0
    },
    earnings: {
        type: Number,
        default: 0
    }
});

export default mongoose.model('Rider', RiderSchema);