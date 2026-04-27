import { body, param, query, validationResult } from "express-validator";

// Middleware to handle validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Auth validations
export const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("role").optional().isIn(["customer", "vendor"]).withMessage("Invalid role"),
  validate,
];

export const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

// Order validations
export const placeOrderValidation = [
  body("shippingAddress").optional().isObject().withMessage("Shipping address must be an object"),
  body("shippingAddress.address").optional().trim().notEmpty().withMessage("Shipping address is required"),
  body("shippingFee").optional().isFloat({ min: 0 }).withMessage("Shipping fee must be a non-negative number"),
  body("taxAmount").optional().isFloat({ min: 0 }).withMessage("Tax amount must be a non-negative number"),
  validate,
];

export const updateOrderStatusValidation = [
  param("id").isMongoId().withMessage("Invalid order ID"),
  body("status").isIn([
    "Order Received",
    "confirmed",
    "preparing",
    "ready_for_delivery",
    "out_for_delivery",
    "delivered",
  ]).withMessage("Invalid status"),
  validate,
];

export const cancelOrderValidation = [
  param("id").isMongoId().withMessage("Invalid order ID"),
  validate,
];

// Payment validations
export const initializePaymentValidation = [
  body("orderId").optional().isMongoId().withMessage("Invalid order ID"),
  body("orderIds").optional().isArray().withMessage("orderIds must be an array"),
  body("paymentMethod").isIn([
    "card",
    "wallet",
    "opay",
    "nextgen_purse",
    "easybuy",
    "makopa",
  ]).withMessage("Invalid payment method"),
  validate,
];

export const verifyPaymentValidation = [
  param("reference").trim().notEmpty().withMessage("Reference is required"),
  validate,
];

// Product validations
export const createProductValidation = [
  body("productName").trim().notEmpty().withMessage("Product name is required"),
  body("description").optional().trim(),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body("category").optional().isMongoId().withMessage("Invalid category ID"),
  validate,
];

// Cart validations
export const addToCartValidation = [
  body("productId").isMongoId().withMessage("Invalid product ID"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  validate,
];

export const updateCartValidation = [
  param("id").isMongoId().withMessage("Invalid cart ID"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  validate,
];

// User/Profile validations
export const updateProfileValidation = [
  body("firstName").optional().trim().notEmpty().withMessage("First name cannot be empty"),
  body("lastName").optional().trim().notEmpty().withMessage("Last name cannot be empty"),
  body("phoneNumber").optional().isMobilePhone("any").withMessage("Invalid phone number"),
  body("address").optional().trim(),
  validate,
];

// Vendor validations
export const createStoreValidation = [
  body("storeName").trim().notEmpty().withMessage("Store name is required"),
  body("description").optional().trim(),
  body("category").optional().isMongoId().withMessage("Invalid category ID"),
  validate,
];

// Review validations
export const createReviewValidation = [
  body("productId").isMongoId().withMessage("Invalid product ID"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional().trim(),
  validate,
];

// Wishlist validations
export const addToWishlistValidation = [
  body("productId").isMongoId().withMessage("Invalid product ID"),
  validate,
];

// Address validations
export const createAddressValidation = [
  body("label").optional().trim(),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("state").trim().notEmpty().withMessage("State is required"),
  body("isDefault").optional().isBoolean().withMessage("isDefault must be a boolean"),
  validate,
];

// Pagination validations
export const paginationValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  validate,
];