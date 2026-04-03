import express from "express";
import {
  registerVendor,
  resendOTP,
  verifyOTP,
  updateVendorProfile,
  createStore,
  setPassword,
  uploadDocuments,
  submitForReview
} from "../controllers/vendor.controller.js";

import { protectVendorOnboarding } from "../middleware/auth.middleware.js";
import { uploadVendorAvatar, uploadVendorDocuments } from "../middleware/upload.middleware.js";

const router = express.Router();

// Public
router.post("/register", registerVendor);
router.post("/resend-otp", resendOTP);
router.post("/verify-otp", verifyOTP);

// Protected after verification
router.post("/profile", protectVendorOnboarding, uploadVendorAvatar, updateVendorProfile);
router.post("/store", protectVendorOnboarding, createStore);
router.post("/set-password", protectVendorOnboarding, setPassword);
router.post("/documents", protectVendorOnboarding, uploadVendorDocuments, uploadDocuments);
router.post("/submit", protectVendorOnboarding, submitForReview);

export default router;
