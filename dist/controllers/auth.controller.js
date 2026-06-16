import * as authService from "../services/auth.service.js";
import { blacklistToken } from "../middleware/tokenBlacklist.middleware.js";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const data = await authService.loginUser(email, password);
        res.json({
            message: "Login successful",
            ...data,
        });
    }
    catch (error) {
        next(error);
    }
};
export const forgotPass = async (req, res, next) => {
    try {
        await authService.forgotPassword(req.body.email);
        res.json({
            message: "Reset link sent to email",
        });
    }
    catch (error) {
        next(error);
    }
};
export const resetPass = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        await authService.resetPassword(token, password);
        res.json({
            message: "Password reset successful",
        });
    }
    catch (error) {
        next(error);
    }
};
export const logout = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(400).json({
                message: "No token provided",
            });
        }
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, config.jwtSecret);
        const expiresAt = typeof decoded.exp === "number" ? decoded.exp * 1000 : Date.now();
        await blacklistToken(token, expiresAt);
        return res.json({
            message: "Logout successful",
        });
    }
    catch (error) {
        if (error instanceof Error && error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Invalid token",
            });
        }
        if (error instanceof Error && error.name === "TokenExpiredError") {
            return res.json({
                message: "Logout successful (token already expired)",
            });
        }
        return next(error);
    }
};
//# sourceMappingURL=auth.controller.js.map