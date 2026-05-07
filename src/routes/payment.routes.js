import express from "express";
import { initializePayments, verifyPayments, paystackWebhooks } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { paymentLimiter, webhookLimiter } from "../middleware/rateLimit.middleware.js";
import { initializePaymentValidation, verifyPaymentValidation } from "../middleware/validation.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /payments/initialize:
 *   post:
 *     summary: Initialize a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Order ID (use either orderId or orderIds)
 *               orderIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of order IDs
 *               paymentMethod:
 *                 type: string
 *                 enum: [card, wallet, opay, nextgen_purse, easybuy, makopa]
 *     responses:
 *       200:
 *         description: Payment initialized successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/initialize", protect, paymentLimiter, initializePaymentValidation, initializePayments);

/**
 * @swagger
 * /payments/verify/{reference}:
 *   get:
 *     summary: Verify a payment
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment reference
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Payment not found
 */
router.get("/verify/:reference", verifyPaymentValidation, verifyPayments);

/**
 * @swagger
 * /payments/webhook/paystack:
 *   post:
 *     summary: Paystack webhook endpoint
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid signature
 */
router.post("/webhook/paystack", webhookLimiter, paystackWebhooks);

export default router;