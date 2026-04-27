import rateLimit from "express-rate-limit";

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    status: "error",
    message: "Too many authentication attempts, please try again after 15 minutes",
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Rate limiter for payment endpoints
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 payment requests per windowMs
  message: {
    status: "error",
    message: "Too many payment requests, please try again after 15 minutes",
  },
});

// Rate limiter for webhook endpoints (more permissive for Paystack retries)
export const webhookLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Allow more requests for webhook retries
  message: {
    status: "error",
    message: "Too many webhook requests",
  },
});

// Rate limiter for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 upload requests per windowMs
  message: {
    status: "error",
    message: "Too many upload requests, please try again after 15 minutes",
  },
});