import crypto from "crypto";
import { config } from "../config/env.js";
import {
    initializePayment,
    verifyPayment,
    handlePaystackWebhook
} from "../services/payment.service.js";

export const initializePayments = async (req, res, next) => {
    try {
        const result = await initializePayment(req.user.id, req.body);
        res.json({ status: "success", data: result });
    } catch (err) {
        next(err);
    }
};

export const verifyPayments = async (req, res, next) => {
    try {
        const payment = await verifyPayment(req.params.reference);

        const paymentStatus = String(payment?.status || "pending").toLowerCase();
        const messageByStatus = {
            paid: "Payment successful",
            failed: "Payment failed",
            pending: "Payment is pending",
        };

        res.json({
            status: "success",
            message: messageByStatus[paymentStatus] || `Payment is ${paymentStatus}`,
            verificationStatus: paymentStatus,
            data: payment,
        });
    } catch (err) {
        next(err);
    }
};

export const paystackWebhooks = async (req, res, next) => {
    try {
        if (!config.paystackWebhookSecret) {
            throw new Error("PAYSTACK_WEBHOOK_SECRET not configured");
        }

        const payload = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));

        // Verify signature
        const hash = crypto
            .createHmac("sha512", config.paystackWebhookSecret)
            .update(payload)
            .digest("hex");

        const signature = req.headers["x-paystack-signature"];

        if (hash !== signature) {
            return res.status(400).send("Invalid signature");
        }

        const event = typeof req.body === "object" && req.body ? req.body : JSON.parse(payload.toString());

        // Call service
        await handlePaystackWebhook(event);

        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};
