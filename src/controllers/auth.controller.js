import * as authService from "../services/auth.service.js";
import { blacklistToken } from "../middleware/tokenBlacklist.middleware.js";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, role = "customer" } = req.body;

        const data = await authService.registerUser({
            email,
            password,
            firstName,
            lastName,
            role
        });

        res.status(201).json({
            message: "Registration successful",
            ...data
        });

    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const data = await authService.loginUser(email, password);

        res.json({
        message: "Login successful",
        ...data
        });

    } catch (error) {
        next(error);
    }
};

export const forgotPass = async (req, res, next) => {
    try {
        await authService.forgotPassword(req.body.email);

        res.json({
        message: "Reset link sent to email"
        });

    } catch (error) {
        next(error);
    }
};

export const resetPass = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        await authService.resetPassword(token, password);

        res.json({
        message: "Password reset successful"
        });

    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({
                message: 'No token provided'
            });
        }

        const token = authHeader.substring(7);
        
        // Decode token to get expiration time
        const decoded = jwt.verify(token, config.jwtSecret);
        const expiresAt = decoded.exp * 1000; // Convert to milliseconds
        
        // Add token to blacklist
        blacklistToken(token, expiresAt);

        res.json({
            message: "Logout successful"
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            // Token already expired, consider it logged out
            return res.json({
                message: "Logout successful (token already expired)"
            });
        }
        next(error);
    }
};
