import express from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    getMyProducts,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";

import { protect, vendor } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/mine", protect, vendor, getMyProducts);
router.get("/:id", getProductById);

router.post("/", protect, vendor, createProduct);
router.put("/:id", protect, vendor, updateProduct);
router.delete("/:id", protect, vendor, deleteProduct);

export default router;
