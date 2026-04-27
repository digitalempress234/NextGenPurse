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

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = err.statusCode || 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = err.statusCode || 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} already exists`;
  }

  // Mongoose cast error (invalid ID format)
  if (err.name === "CastError") {
    statusCode = err.statusCode || 400;
    message = `Invalid ${err.path}`;
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