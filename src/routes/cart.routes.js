import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    getMyCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearMyCart
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", protect, getMyCart);
router.post("/items", protect, addToCart);
router.put("/items/:productId", protect, updateCartItem);
router.delete("/items/:productId", protect, removeCartItem);
router.delete("/", protect, clearMyCart);

export default router;
