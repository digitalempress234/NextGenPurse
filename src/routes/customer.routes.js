import express from "express";
import {
  register,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress
} from "../controllers/customer.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.post("/me/addresses", protect, addAddress);
router.put("/me/addresses/:addressId", protect, updateAddress);
router.delete("/me/addresses/:addressId", protect, deleteAddress);

export default router;
