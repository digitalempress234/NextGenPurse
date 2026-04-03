import express from "express";
import {
  login,
  forgotPass,
  resetPass,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPass);
router.post("/reset-password/:token", resetPass);

export default router;
