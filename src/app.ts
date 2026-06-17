import "dotenv/config";
import express, { type Request, type Response } from "express";
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
import chatRoutes from "./routes/chat.routes.js";
import riderRoutes from "./routes/rider.routes.js";
import compareRoutes from "./routes/compare.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(helmet());

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf: Buffer) => {
      (req as Request & { rawBody?: Buffer }).rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(checkTokenBlacklist);

app.use("/api/", apiLimiter);

if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}
app.use(requestLogger);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API and database connection.
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
 *                   example: development
 *                 uptime:
 *                   type: number
 *                   example: 1234.56
 *                 database:
 *                   type: string
 *                   example: connected
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *       503:
 *         description: Server or database is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 database:
 *                   type: string
 *                   example: disconnected
 *                 version:
 *                   type: string
 */
app.get("/health", async (_req: Request, res: Response) => {
  try {
    const prisma = (await import("./config/prismaClient.js")).default;

    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      uptime: process.uptime(),
      database: "connected",
      version: "1.0.0",
    });
  } catch {
    return res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      uptime: process.uptime(),
      database: "disconnected",
      version: "1.0.0",
    });
  }
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

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
app.use("/api/chat", chatRoutes);
app.use("/api/admin/chat", chatRoutes);
app.use("/api/riders", riderRoutes);
app.use("/api/compare", compareRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: API information
 *     description: Returns basic information about the API, including version and documentation links.
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
 *                   example: purse-backend API is running
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 docs:
 *                   type: string
 *                   example: /api-docs
 *                 health:
 *                   type: string
 *                   example: /health
 */
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "purse-backend API is running",
    version: "1.0.0",
    docs: "/api-docs",
    health: "/health",
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

export default app;
