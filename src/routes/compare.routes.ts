import express from "express";
import * as compareController from "../controllers/compare.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/compare:
 *   get:
 *     summary: Get the user's comparison list
 *     tags: [Comparison]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Comparison list retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Comparison list retrieved" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Product' } }
 */
router.get("/", compareController.getMyCompareList);

/**
 * @swagger
 * /api/compare/items:
 *   post:
 *     summary: Add a product to the comparison list
 *     tags: [Comparison]
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
 *       200:
 *         description: Product added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Product added to comparison list" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Product' } }
 */
router.post("/items", compareController.addItem);

/**
 * @swagger
 * /api/compare/items/{productId}:
 *   delete:
 *     summary: Remove a product from the comparison list
 *     tags: [Comparison]
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
 *                 message: { type: string, example: "Product removed from comparison list" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Product' } }
 */
router.delete("/items/:productId", compareController.removeItem);

/**
 * @swagger
 * /api/compare:
 *   delete:
 *     summary: Clear the entire comparison list
 *     tags: [Comparison]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Comparison list cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Comparison list cleared" }
 */
router.delete("/", compareController.clearList);

export default router;
