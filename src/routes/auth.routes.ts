import express from "express";
import { login, forgotPass, resetPass, logout } from "../controllers/auth.controller.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";
import { loginValidation } from "../middleware/validation.middleware.js";
import { checkTokenBlacklist } from "../middleware/tokenBlacklist.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     description: |
 *       Returns a JWT Bearer token. Include this token in the `Authorization: Bearer <token>` header for all protected endpoints.
 *       **Vendor login** requires a fully approved account (onboardingStep = approved).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.doe@example.com
 *               password:
 *                 type: string
 *                 example: MySecret@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Login successful" }
 *                 data: { type: object, properties: { token: { type: string } } }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "error" }
 *                 message: { type: string, example: "Validation error" }
 *       401:
 *         description: Invalid credentials or account not active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "error" }
 *                 message: { type: string, example: "Invalid credentials" }
 */
router.post("/login", authLimiter, loginValidation, login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     description: Sends a password reset link to the provided email address. The link expires in 30 minutes.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.doe@example.com
 *     responses:
 *       200:
 *         description: Reset link sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Reset link sent to email" }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "error" }
 *                 message: { type: string, example: "User not found" }
 */
router.post("/forgot-password", authLimiter, loginValidation, forgotPass);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using the token from email
 *     description: The token is the raw token from the reset link URL (not hashed). Token expires in 30 minutes.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token from the email link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: NewSecret@456
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Password reset successful" }
 *       400:
 *         description: Token invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "error" }
 *                 message: { type: string, example: "Invalid or expired token" }
 */
router.post("/reset-password/:token", authLimiter, resetPass);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and invalidate the current JWT token
 *     description: Adds the current token to the Redis blacklist. The token becomes invalid immediately for all instances.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Logout successful" }
 *       400:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "error" }
 *                 message: { type: string, example: "No token provided" }
 *       401:
 *         description: Token is invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "error" }
 *                 message: { type: string, example: "Invalid token" }
 */
router.post("/logout", checkTokenBlacklist, logout);

export default router;
