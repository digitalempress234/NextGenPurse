import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import VendorProfile from "../models/VendorProfile.js";
import Store from "../models/Store.js";
import Category from "../models/Category.js";
import { sendEmail } from "./email.service.js";

// enforce onboarding step
const enforceStep = (user, requiredStep) => {
    if (user.onboardingStep !== requiredStep) {
        throw new Error(`Complete ${requiredStep} step first`);
    }
};

// Generate 6 digits OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateOnboardingToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, scope: "vendor_onboarding" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

export const registerVendor = async (email) => {
    try {
        const existing = await User.findOne({ email });
        if (existing) throw new Error("User already exists");

        const otp = generateOTP();

        const user = await User.create({
        email,
        role: "vendor",
        isEmailVerified: false,
        onboardingStep: "created",
        emailVerificationOTP: otp,
        emailVerificationOTPExpires: Date.now() + 1000 * 60 * 60
        });

        await sendEmail({
        to: email,
        subject: "Verify your vendor account",
        html: `<h2>Your verification OTP is: ${otp}</h2>`
        });

        return user;

    } catch (error) {
        throw error;
    }
};

export const resendVendorOTP = async (email) => {
    try {
        const user = await User.findOne({ email, role: "vendor" });
        if (!user) throw new Error("User not found");

        const otp = generateOTP();

        user.emailVerificationOTP = otp;
        user.emailVerificationOTPExpires = Date.now() + 1000 * 60 * 60;

        await user.save();

        await sendEmail({
        to: email,
        subject: "Your New OTP",
        html: `<h2>Your OTP is: ${otp}</h2>`
        });

        return true;

    } catch (error) {
        throw error;
    }
};

export const verifyVendorOTP = async (email, otp) => {
    try {
        const user = await User.findOne({ email, role: "vendor" });

        if (!user) throw new Error("User not found");

        if (
        user.emailVerificationOTP !== otp ||
        user.emailVerificationOTPExpires < Date.now()
        ) {
        throw new Error("Invalid or expired OTP");
        }

        user.isEmailVerified = true;
        user.onboardingStep = "verified";
        user.emailVerificationOTP = undefined;
        user.emailVerificationOTPExpires = undefined;

        await user.save();

        const token = generateOnboardingToken(user);

        return { token };

    } catch (error) {
        throw error;
    }
};

export const updateVendorProfile = async (userId, data) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        enforceStep(user, "verified");

        const existingProfile = await VendorProfile.findOne({ user: user._id });
        if (existingProfile) throw new Error("Vendor profile already exists");

        const profile = await VendorProfile.create({
        user: user._id,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        state: data.state,
        city: data.city,
        address: data.address
        });

        if (data.avatar) {
        user.avatar = data.avatar;
        }

        user.onboardingStep = "vendor_updated";
        await user.save();

        return { profile, avatar: user.avatar };

    } catch (error) {
        throw error;
    }
};

export const createStore = async (userId, data) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        enforceStep(user, "vendor_updated");

        if (!data.category) throw new Error("Category is required");

        const categoryValue = String(data.category).trim();
        if (!mongoose.Types.ObjectId.isValid(categoryValue)) {
            throw new Error("Invalid category");
        }

        const category = await Category.findOne({
            _id: categoryValue,
            level: 1,
            isActive: true
        });

        if (!category) throw new Error("Category not found");

        const existingStore = await Store.findOne({ vendor: user._id });
        if (existingStore) throw new Error("Store already exists");

        const store = await Store.create({
        vendor: user._id,
        storeName: data.storeName,
        state: data.state,
        city: data.city,
        address: data.address,
        category
        });

        user.onboardingStep = "store_created";
        await user.save();

        return store;

    } catch (error) {
        throw error;
    }
};

export const setVendorPassword = async (userId, password) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        enforceStep(user, "store_created");

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.onboardingStep = "password_set";

        await user.save();

        return true;

    } catch (error) {
        throw error;
    }
};

export const uploadVendorDocuments = async (userId, documents) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        enforceStep(user, "password_set");

        const profile = await VendorProfile.findOne({ user: user._id });
        if (!profile) throw new Error("Vendor profile not found");

        let docs = documents;
        if (typeof docs === "string") {
        docs = [docs];
        }

        if (!docs || (Array.isArray(docs) && docs.length === 0)) {
        throw new Error("Documents are required");
        }

        profile.documents = docs;
        await profile.save();

        user.onboardingStep = "documents_uploaded";
        await user.save();

        return profile;

    } catch (error) {
        throw error;
    }
};

export const submitForReview = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        enforceStep(user, "documents_uploaded");

        user.onboardingStep = "under_review";
        await user.save();

        return true;

    } catch (error) {
        throw error;
    }
};
