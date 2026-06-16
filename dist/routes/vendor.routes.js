import express from "express";
import { registerVendor, resendOTP, verifyOTP, updateVendorProfile, createStore, setPassword, uploadDocuments, submitForReview, } from "../controllers/vendor.controller.js";
import { protectVendorOnboarding } from "../middleware/auth.middleware.js";
import { uploadVendorAvatar, uploadVendorDocuments } from "../middleware/upload.middleware.js";
const router = express.Router();
/**
 * @swagger
 * /api/vendors/register:
 *   post:
 *     summary: Step 1 — Register vendor email and receive OTP
 *     description: |
 *       Starts the vendor onboarding flow. Sends a 6-digit OTP to the email address.
 *     tags: [Vendors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: "vendor@mystore.com" }
 *     responses:
 *       201:
 *         description: OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Verification OTP sent to email" }
 *                 data: { type: object, properties: { userId: { type: string, example: "5" } } }
 */
router.post("/register", registerVendor);
/**
 * @swagger
 * /api/vendors/resend-otp:
 *   post:
 *     summary: Resend OTP to vendor email
 *     tags: [Vendors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: "vendor@mystore.com" }
 *     responses:
 *       200:
 *         description: OTP resent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "OTP resent successfully" }
 */
router.post("/resend-otp", resendOTP);
/**
 * @swagger
 * /api/vendors/verify-otp:
 *   post:
 *     summary: Step 2 — Verify OTP and receive onboarding token
 *     tags: [Vendors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email, example: "vendor@mystore.com" }
 *               otp: { type: string, example: "482910" }
 *     responses:
 *       200:
 *         description: Email verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Email verified successfully" }
 *                 data: { type: object, properties: { token: { type: string } } }
 */
router.post("/verify-otp", verifyOTP);
/**
 * @swagger
 * /api/vendors/profile:
 *   post:
 *     summary: Step 3 — Update vendor personal profile
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string, example: "John" }
 *               lastName: { type: string, example: "Smith" }
 *               phoneNumber: { type: string, example: "08012345678" }
 *               state: { type: string, example: "Lagos" }
 *               city: { type: string, example: "Ikeja" }
 *               address: { type: string, example: "45 Commerce Road" }
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Vendor profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Vendor profile updated" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile: { $ref: '#/components/schemas/VendorProfile' }
 *                     avatar: { type: string, nullable: true }
 */
router.post("/profile", protectVendorOnboarding, uploadVendorAvatar, updateVendorProfile);
/**
 * @swagger
 * /api/vendors/store:
 *   post:
 *     summary: Step 4 — Create the vendor's store
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [storeName, categoryId, state, city, address]
 *             properties:
 *               storeName: { type: string, example: "NextGen Purses" }
 *               categoryId: { type: integer, example: 1 }
 *               state: { type: string, example: "Lagos" }
 *               city: { type: string, example: "Ikeja" }
 *               address: { type: string, example: "45 Market Street" }
 *     responses:
 *       200:
 *         description: Store created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Store created successfully" }
 *                 data: { store: { $ref: '#/components/schemas/Store' } }
 */
router.post("/store", protectVendorOnboarding, createStore);
/**
 * @swagger
 * /api/vendors/set-password:
 *   post:
 *     summary: Step 5 — Set login password
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, minLength: 8, example: "VendorSecret@123" }
 *     responses:
 *       200:
 *         description: Password set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Password set successfully" }
 */
router.post("/set-password", protectVendorOnboarding, setPassword);
/**
 * @swagger
 * /api/vendors/documents:
 *   post:
 *     summary: Step 6 — Upload KYC documents
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Documents uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Documents uploaded successfully" }
 *                 data: { profile: { $ref: '#/components/schemas/VendorProfile' } }
 */
router.post("/documents", protectVendorOnboarding, uploadVendorDocuments, uploadDocuments);
/**
 * @swagger
 * /api/vendors/submit:
 *   post:
 *     summary: Step 7 — Submit application for admin review
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Submitted for review" }
 */
router.post("/submit", protectVendorOnboarding, submitForReview);
export default router;
//# sourceMappingURL=vendor.routes.js.map