import express from "express";
import { register, getProfile, updateProfile, addAddress, updateAddress, deleteAddress, } from "../controllers/customer.controller.js";
import { protect } from "../middleware/auth.middleware.js";
const router = express.Router();
/**
 * @swagger
 * /api/customers/register:
 *   post:
 *     summary: Register a new customer account
 *     description: Creates a customer account. Log in separately via `/api/auth/login` to obtain a JWT.
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, format: email, example: "jane.doe@example.com" }
 *               password: { type: string, example: "MySecret@123" }
 *               firstName: { type: string, example: "Jane" }
 *               lastName: { type: string, example: "Doe" }
 *               phoneNumber: { type: string, example: "08012345678" }
 *     responses:
 *       201:
 *         description: Customer registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Registration successful" }
 *                 data: { type: object, properties: { user: { $ref: '#/components/schemas/UserProfile' } } }
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "error" }
 *                 message: { type: string, example: "Email already registered" }
 */
router.post("/register", register);
/**
 * @swagger
 * /api/customers/me:
 *   get:
 *     summary: Get the authenticated customer's profile
 *     description: Returns the full profile including saved addresses.
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Profile retrieved" }
 *                 data: { $ref: '#/components/schemas/UserProfile' }
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protect, getProfile);
/**
 * @swagger
 * /api/customers/me:
 *   put:
 *     summary: Update the authenticated customer's profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string, example: "Jane" }
 *               lastName: { type: string, example: "Doe" }
 *               phoneNumber: { type: string, example: "08012345678" }
 *               state: { type: string, example: "Lagos" }
 *               city: { type: string, example: "Ikeja" }
 *               address: { type: string, example: "10 Allen Avenue" }
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Profile updated" }
 *                 data: { $ref: '#/components/schemas/UserProfile' }
 */
router.put("/me", protect, updateProfile);
/**
 * @swagger
 * /api/customers/me/addresses:
 *   post:
 *     summary: Add a new delivery address
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address]
 *             properties:
 *               label: { type: string, example: "Home" }
 *               state: { type: string, example: "Lagos" }
 *               city: { type: string, example: "Ikeja" }
 *               address: { type: string, example: "10 Allen Avenue" }
 *               isDefault: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Address added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Address added" }
 *                 data: { $ref: '#/components/schemas/UserProfile' }
 */
router.post("/me/addresses", protect, addAddress);
/**
 * @swagger
 * /api/customers/me/addresses/{addressId}:
 *   put:
 *     summary: Update a saved address
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label: { type: string, example: "Office" }
 *               state: { type: string, example: "Abuja" }
 *               city: { type: string, example: "Maitama" }
 *               address: { type: string, example: "Plot 5 Constitution Avenue" }
 *               isDefault: { type: boolean, example: false }
 *     responses:
 *       200:
 *         description: Address updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Address updated" }
 *                 data: { $ref: '#/components/schemas/UserProfile' }
 */
router.put("/me/addresses/:addressId", protect, updateAddress);
/**
 * @swagger
 * /api/customers/me/addresses/{addressId}:
 *   delete:
 *     summary: Delete a saved address
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Address deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Address deleted" }
 *                 data: { $ref: '#/components/schemas/UserProfile' }
 */
router.delete("/me/addresses/:addressId", protect, deleteAddress);
export default router;
//# sourceMappingURL=customer.routes.js.map