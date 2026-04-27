import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {

    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
        return res.status(401).json({ message: "Not authorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
        return res.status(401).json({ message: "User not found" });
        }

        if (!user.isActive) {
        return res.status(403).json({ message: "Account disabled" });
        }

        req.user = user;

        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

export const authorize = (...roles) => {

    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            message: "Access denied",
        });
        }
        next();
    };
};

export const vendor = (req, res, next) => {
    if (req.user?.role !== "vendor") {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};

export const admin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};

// Allows vendors who have verified email to access onboarding endpoints
// using a dedicated onboarding token (or a normal auth token).
export const protectVendorOnboarding = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
        return res.status(401).json({ message: "Not authorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.scope && decoded.scope !== "vendor_onboarding") {
        return res.status(403).json({ message: "Access denied" });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
        return res.status(401).json({ message: "User not found" });
        }

        if (!user.isActive) {
        return res.status(403).json({ message: "Account disabled" });
        }

        if (user.role !== "vendor") {
        return res.status(403).json({ message: "Access denied" });
        }

        if (!user.isEmailVerified) {
        return res.status(403).json({ message: "Verify email before onboarding" });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
