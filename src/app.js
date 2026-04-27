import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import { config } from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";
import { requestLogger } from "./middleware/logger.middleware.js";
import { checkTokenBlacklist } from "./middleware/tokenBlacklist.middleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./utils/swagger.js";

import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Initialize Swagger
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request body parsing with size limits
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


// Token blacklist check (for logout functionality)
app.use(checkTokenBlacklist);

// Rate limiting
app.use("/api/", apiLimiter);

// Logging
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}
app.use(requestLogger);

// Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 database:
 *                   type: string
 */
app.get("/health", async (req, res) => {
  const mongoose = await import("mongoose");
  const dbStatus = mongoose.default.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(dbStatus === "connected" ? 200 : 503).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    uptime: process.uptime(),
    database: dbStatus,
    version: "1.0.0",
  });
});

// API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wishlist", wishlistRoutes);

// Root endpoint
/**
 * @swagger
 * /:
 *   get:
 *     summary: API information
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PurseByNextGenPurse API is running
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 docs:
 *                   type: string
 *                   example: /api-docs
 */
app.get("/", (req, res) => {
  res.json({
    message: "PurseByNextGenPurse API is running",
    version: "1.0.0",
    docs: "/api-docs",
    health: "/health",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(errorHandler);

export default app;