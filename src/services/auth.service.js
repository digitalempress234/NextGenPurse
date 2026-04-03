import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "./email.service.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
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
        throw new Error(error.message);
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

    const baseUrl =
        process.env.CLIENT_URL || "http://localhost:3000";

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
