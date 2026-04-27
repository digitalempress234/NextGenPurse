import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getMyWishlist,
  addWishlistItem,
  removeWishlistItem,
  clearMyWishlist
} from "../controllers/wishlist.controller.js";

const router = express.Router();

router.get("/", protect, getMyWishlist);
router.post("/items", protect, addWishlistItem);
router.delete("/items/:productId", protect, removeWishlistItem);
router.delete("/", protect, clearMyWishlist);

export default router;

