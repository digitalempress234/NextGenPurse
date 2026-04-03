import mongoose from "mongoose";
import validator from "validator";

const UserSchema = new mongoose.Schema({
    firstName: { 
        type: String 
    },
    lastName: { 
        type: String 
    },
    email: { 
        type: String, 
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, "Invalid email"]
    },
    password: { 
        type: String, 
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    role: { 
        type: String, 
        enum: ['customer', 'vendor', 'admin', 'rider'], 
        default: 'customer' 
    },
    phoneNumber: { 
        type: Number 
    },
    avatar: { 
        type: String 
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationOTP: {
        type: String
    },
    emailVerificationOTPExpires: {
        type: Date
    },
    onboardingStep: {
        type: String,
        enum: [
            "created",
            "verified",
            "vendor_updated",
            "store_created",
            "password_set",
            "documents_uploaded",
            "under_review",
            "approved"
        ],
        default: "created"
        },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    state: {
        type: String
    },
    city: {
        type: String
    },
    address: {
        type: String
    },
    addresses: [
        {
            label: { type: String },
            state: { type: String },
            city: { type: String },
            address: { type: String, required: true },
            isDefault: { type: Boolean, default: false }
        }
    ],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },

}, { timestamps: true });

export default mongoose.model('User', UserSchema);
