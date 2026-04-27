import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "./email.service.js";
import { config } from "../config/env.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

export const registerUser = async (userData) => {
    const { email, password, firstName, lastName, role = "customer" } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
    });

    // Generate token
    const token = generateToken(user);

    // Send welcome email
    try {
        await sendEmail({
            to: user.email,
            subject: "Welcome to PurseByNextGenPurse",
            html: `<p>Welcome ${firstName}! Your account has been created successfully.</p>`,
        });
    } catch (emailError) {
        // Don't fail registration if email fails
        console.warn("Failed to send welcome email:", emailError.message);
    }

    return {
        token,
        user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        },
    };
};

export const loginUser = async (email, password) => {
    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) throw new Error("Invalid credentials");

        // Check password exists
        if (!user.password) {
            throw new Error("Complete onboarding before login");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        if (!user.isActive) throw new Error("Account disabled");

        // Vendor restriction: require full onboarding completion before login.
        if (user.role === "vendor") {
            if (!user.isEmailVerified) {
                throw new Error("Verify email before login");
            }
            if (user.onboardingStep !== "approved") {
                throw new Error("Complete onboarding before login");
            }
        }

        const token = generateToken(user);

        return { token };

    } catch (error) {
        throw error;
    }
};


export const forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30;

    await user.save();

    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";

    const link = `${baseUrl}/reset-password/${rawToken}`;

    await sendEmail({
        to: user.email,
        subject: "Reset Password",
        html: `<p>Reset your password:</p><a href="${link}">${link}</a>`,
    });

    return true;
};

export const resetPassword = async (token, newPassword) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) throw new Error("Invalid or expired token");

    user.password = await bcrypt.hash(newPassword, 10);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return true;
};