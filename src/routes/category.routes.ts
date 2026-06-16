import express from "express";
import {
  listCategories,
  getCategoryTree
} from "../controllers/category.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Category' } }
 */
router.get("/", listCategories);

/**
 * @swagger
 * /api/categories/tree:
 *   get:
 *     summary: Get category tree
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category tree retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/CategoryTree' } }
 */
router.get("/tree", getCategoryTree);

export default router;

