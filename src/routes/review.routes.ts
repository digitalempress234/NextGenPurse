import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createReview, getReviews } from "../controllers/review.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get product reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema: { type: integer }
 *       - in: query
 *         name: storeId
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: rating
 *         schema: { type: integer, minimum: 1, maximum: 5 }
 *     responses:
 *       200:
 *         description: Product reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Review' } }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get("/", getReviews);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Submit a product review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, storeId, rating]
 *             properties:
 *               productId: { type: integer, example: 10 }
 *               storeId: { type: integer, example: 1 }
 *               rating: { type: integer, minimum: 1, maximum: 5, example: 4 }
 *               comment: { type: string, example: "Great quality handbag!" }
 *     responses:
 *       201:
 *         description: Review submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Review submitted" }
 *                 data: { $ref: '#/components/schemas/Review' }
 */
router.post("/", protect, createReview);

export default router;

