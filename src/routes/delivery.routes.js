import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { updateDeliveryStatus } from "../controllers/delivery.controller.js";

const router = express.Router();

router.patch("/:id/status", protect, authorize("admin", "rider"), updateDeliveryStatus);

export default router;