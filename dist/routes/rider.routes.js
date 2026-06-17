import express from "express";
import * as riderController from "../controllers/rider.controller.js";
import * as riderLogisticsController from "../controllers/riderLogistics.controller.js";
import * as riderWithdrawalController from "../controllers/riderWithdrawal.controller.js";
import { protect, authorize, protectRiderOnboarding } from "../middleware/auth.middleware.js";
const router = express.Router();
/**
 * @swagger
 * /api/riders/register:
 *   post:
 *     summary: Step 1 — Register rider email and receive OTP
 *     description: Starts the rider onboarding flow. Sends a 6-digit OTP to the email address.
 *     tags: [Rider]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: "rider@nextgen.com" }
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
 *                 data: { type: object, properties: { userId: { type: string, example: "123" } } }
 */
router.post("/register", riderController.registerRider);
/**
 * @swagger
 * /api/riders/resend-otp:
 *   post:
 *     summary: Resend OTP to rider email
 *     tags: [Rider]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: "rider@nextgen.com" }
 *     responses:
 *       200:
 *         description: OTP resent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "OTP resent" }
 */
router.post("/resend-otp", riderController.resendOTP);
/**
 * @swagger
 * /api/riders/verify-otp:
 *   post:
 *     summary: Step 2 — Verify OTP and receive onboarding token
 *     description: Verifies the OTP. Returns a JWT token to use for onboarding.
 *     tags: [Rider]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, example: "123456" }
 *     responses:
 *       200:
 *         description: Verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "OTP verified" }
 *                 data: { type: object, properties: { token: { type: string } } }
 */
router.post("/verify-otp", riderController.verifyOTP);
// Onboarding steps (require special onboarding token)
/**
 * @swagger
 * /api/riders/profile:
 *   put:
 *     summary: Update rider profile
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               gender: { type: string }
 *               dateOfBirth: { type: string, format: date }
 *               email: { type: string, format: email }
 *               phoneNumber: { type: string }
 *               city: { type: string }
 *               vehicleType: { type: string }
 *               vehicleNumber: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Profile updated" }
 *                 data:
 *                   $ref: '#/components/schemas/RiderProfile'
 */
router.put("/profile", protectRiderOnboarding, riderController.updateProfile);
/**
 * @swagger
 * /api/riders/business-details:
 *   post:
 *     summary: Step 4 — Set business details
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [businessName, businessState, businessCity, businessAddress]
 *             properties:
 *               businessName: { type: string }
 *               businessState: { type: string }
 *               businessCity: { type: string }
 *               businessAddress: { type: string }
 *     responses:
 *       200:
 *         description: Business details set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Business details set successfully" }
 */
router.post("/business-details", protectRiderOnboarding, riderController.setBusinessDetails);
/**
 * @swagger
 * /api/riders/bank-account:
 *   post:
 *     summary: Set rider bank account
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bank account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Bank account updated" }
 *                 data: { type: object }
 */
router.post("/bank-account", protectRiderOnboarding, riderController.updateBankAccount);
/**
 * @swagger
 * /api/riders/submit:
 *   post:
 *     summary: Submit application for admin review
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Submitted" }
 *                 data: { type: object }
 */
router.post("/submit", protectRiderOnboarding, riderController.submitForReview);
/**
 * @swagger
 * /api/riders/application-status:
 *   get:
 *     summary: Get rider application status
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Status retrieved" }
 *                 data: { type: object, example: { status: "under_review" } }
 */
router.get("/application-status", protectRiderOnboarding, riderController.getApplicationStatus);
// Authenticated rider routes
/**
 * @swagger
 * /api/riders/profile:
 *   get:
 *     summary: Get rider profile
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Profile retrieved" }
 *                 data: { $ref: '#/components/schemas/RiderProfile' }
 */
router.get("/profile", protect, authorize("rider", "admin"), riderController.getProfile);
/**
 * @swagger
 * /api/riders/availability:
 *   patch:
 *     summary: Toggle rider availability
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isOnline]
 *             properties:
 *               isOnline: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Availability updated" }
 *                 data: { type: object }
 */
router.patch("/availability", protect, authorize("rider"), riderController.toggleAvailability);
/**
 * @swagger
 * /api/riders/wallet:
 *   get:
 *     summary: Get rider wallet
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Wallet retrieved" }
 *                 data: { $ref: '#/components/schemas/Wallet' }
 */
router.get("/wallet", protect, authorize("rider"), riderController.getWallet);
// Logistics Routes
/**
 * @swagger
 * /api/riders/offers:
 *   get:
 *     summary: Get pending delivery offers
 *     description: Returns a list of all currently available (pending) delivery offers for the rider.
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Offers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/DeliveryOffer' }
 */
router.get("/offers", riderLogisticsController.getOffers);
/**
 * @swagger
 * /api/riders/offers/{offerId}/accept:
 *   post:
 *     summary: Accept a delivery offer
 *     description: Claims a delivery offer. Generates pickup and delivery verification codes.
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Delivery accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Delivery accepted" }
 *                 data: { $ref: '#/components/schemas/DeliveryOffer' }
 */
router.post("/offers/:offerId/accept", riderLogisticsController.acceptDelivery);
/**
 * @swagger
 * /api/riders/deliveries/{id}/verify-pickup:
 *   post:
 *     summary: Verify pickup with QR/Code
 *     description: Validates the provided code against the delivery's pickupCode.
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string, example: "A1B2C3D4" }
 *     responses:
 *       200:
 *         description: Pickup verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Pickup verified" }
 *                 data: { $ref: '#/components/schemas/Delivery' }
 */
router.post("/deliveries/:id/verify-pickup", riderLogisticsController.pickupVerification);
/**
 * @swagger
 * /api/riders/deliveries/{id}/verify-delivery:
 *   post:
 *     summary: Verify delivery with QR/Code
 *     description: Validates the provided code against the delivery's deliveryCode. Credits rider's wallet upon success.
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string, example: "E5F6G7H8" }
 *     responses:
 *       200:
 *         description: Delivery verified and completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Delivery verified and completed" }
 *                 data: { $ref: '#/components/schemas/Delivery' }
 */
router.post("/deliveries/:id/verify-delivery", riderLogisticsController.deliveryVerification);
// Withdrawal Routes
/**
 * @swagger
 * /api/riders/withdrawals:
 *   get:
 *     summary: Get withdrawal history
 *     description: Retrieves a list of all past withdrawal requests and their statuses.
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: History retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Withdrawal' }
 */
router.get("/withdrawals", riderWithdrawalController.getHistory);
/**
 * @swagger
 * /api/riders/withdrawals/initialize:
 *   post:
 *     summary: Request a withdrawal (triggers OTP)
 *     description: Starts a withdrawal process. Generates an OTP for confirmation.
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, example: 50000 }
 *     responses:
 *       200:
 *         description: Withdrawal initialized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Withdrawal initialized. Please verify with OTP." }
 *                 data: { withdrawalId: { type: integer, example: 1 } }
 */
router.post("/withdrawals/initialize", riderWithdrawalController.requestWithdrawal);
/**
 * @swagger
 * /api/riders/withdrawals/confirm:
 *   post:
 *     summary: Confirm withdrawal with OTP
 *     description: Finalizes a withdrawal request by verifying the OTP. Debits the wallet.
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [withdrawalId, otp]
 *             properties:
 *               withdrawalId: { type: integer, example: 1 }
 *               otp: { type: string, example: "123456" }
 *     responses:
 *       200:
 *         description: Withdrawal completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Withdrawal completed successfully" }
 *                 data: { $ref: '#/components/schemas/Withdrawal' }
 */
router.post("/withdrawals/confirm", riderWithdrawalController.confirmWithdrawal);
export default router;
//# sourceMappingURL=rider.routes.js.map