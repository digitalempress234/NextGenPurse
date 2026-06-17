import logger from "./logger.middleware.js";
import { config } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;

  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  let message = err.message || "Server error";

  // Prisma known request errors
  if (err.code === "P2002") {
    statusCode = 409;
    const field = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : "field";
    message = `${field} already exists`;
  }

  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
  }

  if (err.code === "P2003") {
    statusCode = 400;
    message = "Invalid related record";
  }

  // Multer error
  if (err.name === "MulterError") {
    statusCode = 400;
    message = err.message || "File upload error";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  res.status(statusCode).json({
    status: "error",
    message,
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  });
};
