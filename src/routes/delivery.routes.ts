import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { updateDeliveryStatus } from "../controllers/delivery.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/deliveries/{id}/status:
 *   patch:
 *     summary: Update delivery status
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [PENDING, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED], example: "PICKED_UP" }
 *               notes: { type: string, example: "Package collected" }
 *               estimatedDeliveryDate: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Delivery status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Delivery status updated" }
 *                 data: { $ref: '#/components/schemas/Delivery' }
 */
router.patch("/:id/status", protect, authorize("admin", "rider"), updateDeliveryStatus);

export default router;
