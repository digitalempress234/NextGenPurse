import express from "express";
import {
  listCategories,
  getCategoryTree
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", listCategories);
router.get("/tree", getCategoryTree);

export default router;

