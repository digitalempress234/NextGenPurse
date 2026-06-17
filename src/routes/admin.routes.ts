import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
    getPendingVendors,
    approveVendor,
    rejectVendor,
    getAllVendors,
    getAllCustomers,
    getAllRiders,
    approveRider,
    rejectRider,
    getAllOrders,
    updateUserStatus,
    getDashboardStats
} from '../controllers/admin.controller.js';


const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/admin/vendors/pending:
 *   get:
 *     summary: Get vendors awaiting approval
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending vendor applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/VendorProfile' } }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/vendors/pending', getPendingVendors);

/**
 * @swagger
 * /api/admin/vendors/{id}/approve:
 *   put:
 *     summary: Approve a vendor application
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Vendor approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Vendor approved successfully" }
 */
router.put('/vendors/:id/approve', approveVendor);

/**
 * @swagger
 * /api/admin/riders/{id}/approve:
 *   put:
 *     summary: Approve a rider application
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Rider approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Rider application approved successfully" }
 */
router.put('/riders/:id/approve', approveRider);

/**
 * @swagger
 * /api/admin/vendors/{id}/reject:
 *   put:
 *     summary: Reject a vendor application
 *     tags: [Admin]
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
 *             required: [reason]
 *             properties:
 *               reason: { type: string, minLength: 10 }
 *     responses:
 *       200:
 *         description: Vendor rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Vendor rejected successfully" }
 */
router.put('/vendors/:id/reject', rejectVendor);

/**
 * @swagger
 * /api/admin/riders/{id}/reject:
 *   put:
 *     summary: Reject a rider application
 *     tags: [Admin]
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
 *             required: [reason]
 *             properties:
 *               reason: { type: string, minLength: 10 }
 *     responses:
 *       200:
 *         description: Rider rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Rider application rejected" }
 */
router.put('/riders/:id/reject', rejectRider);

/**
 * @swagger
 * /api/admin/vendors:
 *   get:
 *     summary: Get all vendors
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vendor list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/VendorProfile' } }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/vendors', getAllVendors);

/**
 * @swagger
 * /api/admin/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/UserPublic' } }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/customers', getAllCustomers);

/**
 * @swagger
 * /api/admin/riders:
 *   get:
 *     summary: Get all riders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rider list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/UserPublic' } }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/riders', getAllRiders);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Order' } }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/orders', getAllOrders);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Activate/deactivate user
 *     tags: [Admin]
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
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean }
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "User status updated" }
 */
router.put('/users/:id/status', updateUserStatus);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 data: { $ref: '#/components/schemas/DashboardStats' }
 */
router.get('/dashboard', getDashboardStats);

export default router;

