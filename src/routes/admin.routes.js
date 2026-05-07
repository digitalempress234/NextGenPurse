import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
    getPendingVendors,
    approveVendor,
    rejectVendor,
    getAllVendors,
    getAllCustomers,
    getAllRiders,
    getAllOrders,
    updateUserStatus,
    getDashboardStats
} from '../controllers/admin.controller.js';


const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Vendor management
router.get('/vendors/pending', getPendingVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);
router.get('/vendors', getAllVendors);

// Customer management
router.get('/customers', getAllCustomers);

// Rider management
router.get('/riders', getAllRiders);

// Order management
router.get('/orders', getAllOrders);

// User management
router.put('/users/:id/status', updateUserStatus);

// Dashboard
router.get('/dashboard', getDashboardStats);

export default router;
