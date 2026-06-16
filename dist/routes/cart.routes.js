import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getMyCart, addToCart, updateCartItem, removeCartItem, clearMyCart } from "../controllers/cart.controller.js";
const router = express.Router();
/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get the authenticated user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Cart retrieved" }
 *                 data: { $ref: '#/components/schemas/Cart' }
 */
router.get("/", protect, getMyCart);
/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Clear all items from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Cart cleared" }
 *                 data: { $ref: '#/components/schemas/Cart' }
 */
router.delete("/", protect, clearMyCart);
/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Add a product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: integer, example: 10 }
 *               quantity: { type: integer, minimum: 1, default: 1, example: 2 }
 *     responses:
 *       200:
 *         description: Item added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Item added to cart" }
 *                 data: { $ref: '#/components/schemas/Cart' }
 */
router.post("/items", protect, addToCart);
/**
 * @swagger
 * /api/cart/items/{productId}:
 *   put:
 *     summary: Update quantity of a cart item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, minimum: 1, example: 3 }
 *     responses:
 *       200:
 *         description: Item updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Cart item updated" }
 *                 data: { $ref: '#/components/schemas/Cart' }
 *   delete:
 *     summary: Remove a product from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Item removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Item removed from cart" }
 *                 data: { $ref: '#/components/schemas/Cart' }
 */
router.put("/items/:productId", protect, updateCartItem);
router.delete("/items/:productId", protect, removeCartItem);
export default router;
//# sourceMappingURL=cart.routes.js.map