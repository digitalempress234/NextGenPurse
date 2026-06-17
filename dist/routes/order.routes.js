import express from "express";
import { protect, vendor } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";
import { placeOrder, getVendorPurchaseHistory, getCustomerOrderHistory, cancelOrder, updateOrderStatus, } from "../controllers/order.controller.js";
import { placeOrderValidation, updateOrderStatusValidation, cancelOrderValidation, paginationValidation, } from "../middleware/validation.middleware.js";
const router = express.Router();
/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Place an order from cart contents
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
 *                   label: { type: string }
 *                   address: { type: string }
 *                   city: { type: string }
 *                   state: { type: string }
 *               shippingFee: { type: number }
 *               taxAmount: { type: number }
 *     responses:
 *       201:
 *         description: Order placed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Orders placed successfully" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Order' } }
 */
router.post("/", protect, placeOrderValidation, placeOrder);
/**
 * @swagger
 * /api/orders/vendor:
 *   get:
 *     summary: Get vendor's incoming orders (Vendor Endpoint)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vendor orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Order' } }
 */
router.get("/vendor", protect, vendor, paginationValidation, getVendorPurchaseHistory);
/**
 * @swagger
 * /api/orders/customer:
 *   get:
 *     summary: Get customer's order history
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Customer orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Order' } }
 */
router.get("/customer", protect, paginationValidation, getCustomerOrderHistory);
/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Order cancelled successfully" }
 *                 data: { $ref: '#/components/schemas/Order' }
 */
router.patch("/:id/cancel", protect, cancelOrderValidation, cancelOrder);
/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin/Vendor Endpoint)
 *     tags: [Orders]
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
 *               status: { type: string, example: "confirmed" }
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Order status updated" }
 *                 data: { $ref: '#/components/schemas/Order' }
 */
router.patch("/:id/status", protect, authorize("admin", "vendor"), updateOrderStatusValidation, updateOrderStatus);
export default router;
//# sourceMappingURL=order.routes.js.map