import express from "express";
import { protect, vendor } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";
import {
  placeOrder,
  getVendorPurchaseHistory,
  getCustomerOrderHistory,
  cancelOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import {
  placeOrderValidation,
  updateOrderStatusValidation,
  cancelOrderValidation,
  paginationValidation,
} from "../middleware/validation.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place a new order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *               shippingFee:
 *                 type: number
 *                 minimum: 0
 *               taxAmount:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, placeOrderValidation, placeOrder);

/**
 * @swagger
 * /orders/vendor:
 *   get:
 *     summary: Get vendor's order history
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/vendor", protect, vendor, paginationValidation, getVendorPurchaseHistory);

/**
 * @swagger
 * /orders/customer:
 *   get:
 *     summary: Get customer's order history
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/customer", protect, paginationValidation, getCustomerOrderHistory);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch("/:id/cancel", protect, cancelOrderValidation, cancelOrder);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status (admin/vendor only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Order Received, confirmed, preparing, ready_for_delivery, out_for_delivery, delivered]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch("/:id/status", protect, authorize("admin", "vendor"), updateOrderStatusValidation, updateOrderStatus);

export default router;