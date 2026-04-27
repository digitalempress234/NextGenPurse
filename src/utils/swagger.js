import { config } from "../config/env.js";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PurseByNextGenPurse API",
      version: "1.0.0",
      description:
        "A comprehensive e-commerce platform API with multi-vendor support, payment processing, and order management.",
      contact: {
        name: "API Support",
        email: "support@nextgenpurse.com",
      },
    },
    servers: [
      {
        url: "http://localhost:{port}",
        description: "Development server",
        variables: {
          port: {
            default: "5000",
          },
        },
      },
      ...(config.baseUrl
        ? [
            {
              url: config.baseUrl,
              description: "Production server",
            },
          ]
        : []),
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        // User schemas
        User: {
          type: "object",
          properties: {
            _id: { type: "string", format: "objectId" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            role: {
              type: "string",
              enum: ["customer", "vendor", "admin", "rider"],
            },
            phoneNumber: { type: "number" },
            avatar: { type: "string" },
            isEmailVerified: { type: "boolean" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // Order schemas
        Order: {
          type: "object",
          properties: {
            _id: { type: "string", format: "objectId" },
            orderNumber: { type: "string" },
            user: { type: "string", format: "objectId" },
            store: { type: "string", format: "objectId" },
            items: {
              type: "array",
              items: { type: "string", format: "objectId" },
            },
            customer: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
              },
            },
            shippingAddress: {
              type: "object",
              properties: {
                label: { type: "string" },
                state: { type: "string" },
                city: { type: "string" },
                address: { type: "string" },
              },
            },
            currency: { type: "string", default: "NGN" },
            subtotal: { type: "number" },
            shippingFee: { type: "number" },
            taxAmount: { type: "number" },
            total: { type: "number" },
            currentStatus: {
              type: "string",
              enum: [
                "Order Received",
                "confirmed",
                "preparing",
                "ready_for_delivery",
                "out_for_delivery",
                "delivered",
                "cancelled",
              ],
            },
            payment: { type: "string", format: "objectId" },
            delivery: { type: "string", format: "objectId" },
            placedAt: { type: "string", format: "date-time" },
          },
        },

        // Payment schemas
        Payment: {
          type: "object",
          properties: {
            _id: { type: "string", format: "objectId" },
            order: { type: "string", format: "objectId" },
            amount: { type: "number" },
            currency: { type: "string", default: "NGN" },
            status: {
              type: "string",
              enum: ["pending", "paid", "failed", "refunded"],
            },
            paymentMethod: {
              type: "string",
              enum: ["card", "opay", "wallet", "nextgen_purse", "easybuy", "makopa"],
            },
            provider: {
              type: "string",
              enum: ["paystack", "flutterwave", "manual"],
            },
            transactionRef: { type: "string" },
            paymentUrl: { type: "string" },
            paidAt: { type: "string", format: "date-time" },
          },
        },

        // Product schemas
        Product: {
          type: "object",
          properties: {
            _id: { type: "string", format: "objectId" },
            productName: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            stock: { type: "number" },
            category: { type: "string", format: "objectId" },
            images: {
              type: "array",
              items: { type: "string" },
            },
            vendor: { type: "string", format: "objectId" },
          },
        },

        // Error response
        Error: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["error"] },
            message: { type: "string" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Users", description: "User management" },
      { name: "Orders", description: "Order management" },
      { name: "Payments", description: "Payment processing" },
      { name: "Products", description: "Product catalog" },
      { name: "Cart", description: "Shopping cart" },
      { name: "Vendors", description: "Vendor management" },
      { name: "Admin", description: "Admin endpoints" },
    ],
  },
  apis: ["./src/routes/*.js"], // Path to the API routes
};

export default swaggerOptions;