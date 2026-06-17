import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getMyWishlist, addWishlistItem, removeWishlistItem, clearMyWishlist } from "../controllers/wishlist.controller.js";
const router = express.Router();
/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Wishlist retrieved" }
 *                 data: { $ref: '#/components/schemas/Wishlist' }
 */
router.get("/", protect, getMyWishlist);
/**
 * @swagger
 * /api/wishlist:
 *   delete:
 *     summary: Clear wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Wishlist cleared" }
 */
router.delete("/", protect, clearMyWishlist);
/**
 * @swagger
 * /api/wishlist/items:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
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
 *     responses:
 *       201:
 *         description: Product added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Product added to wishlist" }
 *                 data: { $ref: '#/components/schemas/Wishlist' }
 */
router.post("/items", protect, addWishlistItem);
/**
 * @swagger
 * /api/wishlist/items/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Product removed from wishlist" }
 */
router.delete("/items/:productId", protect, removeWishlistItem);
export default router;
//# sourceMappingURL=wishlist.routes.js.map