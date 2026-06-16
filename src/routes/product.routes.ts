import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { protect, vendor } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Browse the product catalog
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: categoryId
 *         schema: { type: integer }
 *       - in: query
 *         name: storeId
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Products retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Product' } }
 */
router.get("/", getProducts);

/**
 * @swagger
 * /api/products/mine:
 *   get:
 *     summary: Get the authenticated vendor's own products (Vendor Endpoint)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor's products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Product' } }
 */
router.get("/mine", protect, vendor, getMyProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data: { $ref: '#/components/schemas/Product' }
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Vendor Endpoint)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productName, description, price, category]
 *             properties:
 *               productName: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               discountPrice: { type: number, default: 0 }
 *               discountPercentage: { type: number, default: 0 }
 *               discountType: { type: string, enum: [fixed, percentage], default: "fixed" }
 *               category: { type: string, description: "Category ID or Name" }
 *               subCategory: { type: string, description: "Sub-category ID or Name" }
 *               stock: { type: integer, default: 0 }
 *               expiryDate: { type: string, format: date-time }
 *               images: { type: array, items: { type: string }, description: "Array of image URLs" }
 *               isFeatured: { type: boolean, default: false }
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Product created" }
 *                 data: { $ref: '#/components/schemas/Product' }
 */
router.post("/", protect, vendor, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (Vendor Endpoint)
 *     tags: [Products]
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
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Product updated" }
 *                 data: { $ref: '#/components/schemas/Product' }
 */
router.put("/:id", protect, vendor, updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (Vendor Endpoint)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Product deleted" }
 */
router.delete("/:id", protect, vendor, deleteProduct);

export default router;
