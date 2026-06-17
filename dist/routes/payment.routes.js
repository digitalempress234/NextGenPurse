import express from "express";
import { initializePayments, verifyPayments, paystackWebhooks } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { paymentLimiter, webhookLimiter } from "../middleware/rateLimit.middleware.js";
import { initializePaymentValidation, verifyPaymentValidation } from "../middleware/validation.middleware.js";
const router = express.Router();
/**
 * @swagger
 * /api/payments/initialize:
 *   post:
 *     summary: Initialize a Paystack payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentMethod]
 *             properties:
 *               orderIds: { type: array, items: { type: integer }, example: [1, 2] }
 *               orderId: { type: integer, example: 1 }
 *               paymentMethod: { type: string, enum: [card, wallet, nextgen_purse, easybuy, makopa], example: "card" }
 *     responses:
 *       200:
 *         description: Payment initialized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Payment initialized" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentUrl: { type: string, example: "https://checkout.paystack.com/abc123xyz" }
 *                     reference: { type: string, example: "TX-1718454800000-abcd1234efgh" }
 */
router.post("/initialize", protect, paymentLimiter, initializePaymentValidation, initializePayments);
/**
 * @swagger
 * /api/payments/verify/{reference}:
 *   get:
 *     summary: Verify payment status
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Payment successful" }
 *                 data: { $ref: '#/components/schemas/Payment' }
 */
router.get("/verify/:reference", verifyPaymentValidation, verifyPayments);
/**
 * @swagger
 * /api/payments/webhook/paystack:
 *   post:
 *     summary: Paystack webhook receiver
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Webhook processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Webhook processed" }
 */
router.post("/webhook/paystack", webhookLimiter, paystackWebhooks);
export default router;
//# sourceMappingURL=payment.routes.js.map