import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createReview, getReviews } from "../controllers/review.controller.js";

const router = express.Router();

router.get("/", getReviews);
router.post("/", protect, createReview);

export default router;
