import { config } from "../config/env.js";
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "PurseByNextGenPurse API",
            version: "1.0.0",
            description: "A comprehensive e-commerce platform API with multi-vendor support, payment processing, real-time chat, and order management.\n\n## Authentication\nMost endpoints require a Bearer JWT token. Obtain a token via `POST /api/auth/login` and include it in the `Authorization` header as `Bearer <token>`.\n\n## Real-time Chat\nChat uses Socket.IO for real-time events. Connect to the server with your JWT token and join conversation rooms via `chat:join`.",
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
                    description: "Enter your JWT token obtained from POST /api/auth/login",
                },
            },
            schemas: {
                // ─── Shared Primitives ───────────────────────────────────────────
                PaginationMeta: {
                    type: "object",
                    properties: {
                        currentPage: { type: "integer", example: 1 },
                        totalPages: { type: "integer", example: 5 },
                        hasNext: { type: "boolean", example: true },
                        hasPrev: { type: "boolean", example: false },
                    },
                },
                ValidationError: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Validation failed" },
                        errors: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    field: { type: "string", example: "email" },
                                    message: { type: "string", example: "must be a valid email" },
                                },
                            },
                        },
                    },
                },
                Error: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Resource not found" },
                    },
                },
                // ─── User / Auth ─────────────────────────────────────────────────
                UserPublic: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "42" },
                        id: { type: "integer", example: 42 },
                        email: { type: "string", format: "email", example: "user@example.com" },
                        firstName: { type: "string", example: "Jane" },
                        lastName: { type: "string", example: "Doe" },
                        role: { type: "string", enum: ["customer", "vendor", "admin", "rider"], example: "customer" },
                        phoneNumber: { type: "string", example: "08012345678" },
                        avatar: { type: "string", nullable: true, example: "https://res.cloudinary.com/..." },
                        isEmailVerified: { type: "boolean", example: true },
                        isActive: { type: "boolean", example: true },
                        onboardingStep: {
                            type: "string",
                            enum: ["created", "verified", "vendor_updated", "store_created", "password_set", "documents_uploaded", "under_review", "approved"],
                            example: "approved",
                        },
                        isVerified: { type: "boolean", example: false },
                        createdAt: { type: "string", format: "date-time", example: "2026-01-15T10:00:00.000Z" },
                        updatedAt: { type: "string", format: "date-time", example: "2026-05-01T08:00:00.000Z" },
                    },
                },
                UserProfile: {
                    allOf: [
                        { $ref: "#/components/schemas/UserPublic" },
                        {
                            type: "object",
                            properties: {
                                state: { type: "string", nullable: true, example: "Lagos" },
                                city: { type: "string", nullable: true, example: "Ikeja" },
                                address: { type: "string", nullable: true, example: "10 Allen Avenue" },
                                addresses: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Address" },
                                },
                            },
                        },
                    ],
                },
                Address: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        label: { type: "string", example: "Home" },
                        state: { type: "string", example: "Lagos" },
                        city: { type: "string", example: "Ikeja" },
                        address: { type: "string", example: "10 Allen Avenue" },
                        isDefault: { type: "boolean", example: true },
                    },
                },
                AuthRegisterResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Registration successful" },
                        user: {
                            type: "object",
                            properties: {
                                _id: { type: "string", example: "42" },
                                id: { type: "integer", example: 42 },
                                email: { type: "string", example: "user@example.com" },
                                firstName: { type: "string", example: "Jane" },
                                lastName: { type: "string", example: "Doe" },
                                role: { type: "string", example: "customer" },
                            },
                        },
                    },
                },
                AuthLoginResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Login successful" },
                        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                    },
                },
                // ─── Vendor Onboarding ────────────────────────────────────────────
                VendorProfile: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        userId: { type: "integer", example: 5 },
                        phoneNumber: { type: "string", nullable: true, example: "08012345678" },
                        state: { type: "string", example: "Lagos" },
                        city: { type: "string", example: "Ikeja" },
                        address: { type: "string", example: "10 Commerce Road" },
                        documentReviewStatus: {
                            type: "string",
                            enum: ["pending", "approved", "rejected"],
                            example: "pending",
                        },
                        documents: {
                            type: "array",
                            nullable: true,
                            items: { type: "string" },
                            example: ["https://res.cloudinary.com/doc1.pdf"],
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Store: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        vendorId: { type: "integer", example: 5 },
                        storeName: { type: "string", example: "NextGen Purses" },
                        categoryId: { type: "integer", example: 2 },
                        state: { type: "string", example: "Lagos" },
                        city: { type: "string", example: "Ikeja" },
                        address: { type: "string", example: "45 Market Street" },
                        isActive: { type: "boolean", example: false },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                // ─── Category ─────────────────────────────────────────────────────
                Category: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        name: { type: "string", example: "Handbags" },
                        parentId: { type: "integer", nullable: true, example: null },
                        level: { type: "integer", example: 1 },
                        isActive: { type: "boolean", example: true },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                CategoryTree: {
                    allOf: [
                        { $ref: "#/components/schemas/Category" },
                        {
                            type: "object",
                            properties: {
                                children: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Category" },
                                },
                            },
                        },
                    ],
                },
                // ─── Product ──────────────────────────────────────────────────────
                Product: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 10 },
                        _id: { type: "string", example: "10" },
                        storeId: { type: "integer", nullable: true, example: 1 },
                        productName: { type: "string", example: "Leather Crossbody Bag" },
                        description: { type: "string", example: "Premium Italian leather crossbody bag" },
                        price: { type: "number", format: "float", example: 25000 },
                        discountPrice: { type: "number", format: "float", example: 0 },
                        discountPercentage: { type: "number", format: "float", example: 0 },
                        discountType: { type: "string", enum: ["fixed", "percentage"], example: "fixed" },
                        categoryId: { type: "integer", example: 1 },
                        subCategoryId: { type: "integer", nullable: true, example: null },
                        stock: { type: "integer", example: 50 },
                        totalSold: { type: "integer", example: 12 },
                        ratingsAverage: { type: "number", format: "float", example: 4.5 },
                        ratingsCount: { type: "integer", example: 20 },
                        images: {
                            type: "array",
                            items: { type: "string" },
                            example: ["https://res.cloudinary.com/image1.jpg", "https://res.cloudinary.com/image2.jpg"],
                        },
                        isFeatured: { type: "boolean", example: false },
                        expiryDate: { type: "string", format: "date-time", nullable: true, example: null },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                ProductListResponse: {
                    type: "object",
                    properties: {
                        data: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Product" },
                        },
                        pagination: {
                            type: "object",
                            properties: {
                                currentPage: { type: "integer", example: 1 },
                                totalPages: { type: "integer", example: 10 },
                                totalProducts: { type: "integer", example: 98 },
                                hasNext: { type: "boolean", example: true },
                                hasPrev: { type: "boolean", example: false },
                            },
                        },
                    },
                },
                // ─── Cart ─────────────────────────────────────────────────────────
                CartItem: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        cartId: { type: "integer", example: 1 },
                        productId: { type: "integer", example: 10 },
                        storeId: { type: "integer", example: 1 },
                        quantity: { type: "integer", example: 2 },
                        unitPrice: { type: "number", format: "float", example: 25000 },
                        totalPrice: { type: "number", format: "float", example: 50000 },
                        product: {
                            type: "object",
                            properties: {
                                id: { type: "integer", example: 10 },
                                productName: { type: "string", example: "Leather Crossbody Bag" },
                                price: { type: "number", example: 25000 },
                                discountPrice: { type: "number", example: 0 },
                                discountPercentage: { type: "number", example: 0 },
                                discountType: { type: "string", example: "fixed" },
                                images: { type: "array", items: { type: "string" }, example: ["https://res.cloudinary.com/img.jpg"] },
                            },
                        },
                        store: {
                            type: "object",
                            properties: {
                                id: { type: "integer", example: 1 },
                                storeName: { type: "string", example: "NextGen Purses" },
                            },
                        },
                    },
                },
                Cart: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        _id: { type: "string", example: "1" },
                        userId: { type: "integer", example: 42 },
                        subtotal: { type: "number", format: "float", example: 50000 },
                        totalItems: { type: "integer", example: 2 },
                        currency: { type: "string", example: "NGN" },
                        items: {
                            type: "array",
                            items: { $ref: "#/components/schemas/CartItem" },
                        },
                    },
                },
                // ─── Order ────────────────────────────────────────────────────────
                OrderItem: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        orderId: { type: "integer", example: 1 },
                        productId: { type: "integer", example: 10 },
                        productName: { type: "string", example: "Leather Crossbody Bag" },
                        quantity: { type: "integer", example: 2 },
                        unitPrice: { type: "number", format: "float", example: 25000 },
                        totalPrice: { type: "number", format: "float", example: 50000 },
                        images: { type: "array", items: { type: "string" } },
                    },
                },
                Order: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        _id: { type: "string", example: "1" },
                        orderNumber: { type: "string", example: "ORD-20260501-0001" },
                        userId: { type: "integer", example: 42 },
                        storeId: { type: "integer", example: 1 },
                        customerName: { type: "string", example: "Jane Doe" },
                        customerEmail: { type: "string", example: "user@example.com" },
                        customerPhone: { type: "string", nullable: true, example: "08012345678" },
                        shippingLabel: { type: "string", nullable: true, example: "Home" },
                        shippingState: { type: "string", example: "Lagos" },
                        shippingCity: { type: "string", example: "Ikeja" },
                        shippingAddress: { type: "string", example: "10 Allen Avenue" },
                        currency: { type: "string", example: "NGN" },
                        subtotal: { type: "number", format: "float", example: 50000 },
                        shippingFee: { type: "number", format: "float", example: 2000 },
                        taxAmount: { type: "number", format: "float", example: 0 },
                        total: { type: "number", format: "float", example: 52000 },
                        currentStatus: {
                            type: "string",
                            enum: ["Order Received", "confirmed", "preparing", "ready_for_delivery", "out_for_delivery", "delivered", "cancelled"],
                            example: "Order Received",
                        },
                        items: {
                            type: "array",
                            items: { $ref: "#/components/schemas/OrderItem" },
                        },
                        payment: { $ref: "#/components/schemas/Payment" },
                        delivery: { $ref: "#/components/schemas/Delivery" },
                        placedAt: { type: "string", format: "date-time" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                OrderListResponse: {
                    type: "object",
                    properties: {
                        data: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Order" },
                        },
                        pagination: {
                            type: "object",
                            properties: {
                                currentPage: { type: "integer", example: 1 },
                                totalPages: { type: "integer", example: 3 },
                                totalOrders: { type: "integer", example: 25 },
                                hasNext: { type: "boolean", example: true },
                                hasPrev: { type: "boolean", example: false },
                            },
                        },
                    },
                },
                // ─── Payment ──────────────────────────────────────────────────────
                Payment: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        amount: { type: "number", format: "float", example: 52000 },
                        total: { type: "number", format: "float", example: 52000 },
                        paidByCustomer: { type: "number", format: "float", example: 52000 },
                        currency: { type: "string", example: "NGN" },
                        status: {
                            type: "string",
                            enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
                            example: "PENDING",
                        },
                        method: {
                            type: "string",
                            enum: ["CARD", "OPAY", "WALLET", "NEXTGEN_PURSE", "EASYBUY", "MAKOPA"],
                            example: "CARD",
                        },
                        provider: {
                            type: "string",
                            enum: ["PAYSTACK", "FLUTTERWAVE", "MANUAL"],
                            example: "PAYSTACK",
                        },
                        reference: { type: "string", example: "pay_1a2b3c4d5e" },
                        paymentUrl: { type: "string", nullable: true, example: "https://checkout.paystack.com/..." },
                        paidAt: { type: "string", format: "date-time", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        orders: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "integer" },
                                    orderNumber: { type: "string" },
                                    total: { type: "number" },
                                },
                            },
                        },
                    },
                },
                PaymentInitResponse: {
                    type: "object",
                    properties: {
                        status: { type: "string", example: "success" },
                        data: {
                            type: "object",
                            properties: {
                                paymentUrl: { type: "string", example: "https://checkout.paystack.com/abc123" },
                                reference: { type: "string", example: "pay_abc123" },
                            },
                        },
                    },
                },
                PaymentVerifyResponse: {
                    type: "object",
                    properties: {
                        status: { type: "string", example: "success" },
                        message: { type: "string", example: "Payment successful" },
                        verificationStatus: { type: "string", enum: ["paid", "failed", "pending"], example: "paid" },
                        data: { $ref: "#/components/schemas/Payment" },
                    },
                },
                // ─── Delivery ─────────────────────────────────────────────────────
                Delivery: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        orderId: { type: "integer", example: 1 },
                        riderId: { type: "integer", nullable: true, example: 10 },
                        status: {
                            type: "string",
                            enum: ["PENDING", "assigned", "picked_up", "delivered", "FAILED"],
                            example: "PENDING",
                        },
                        pickupCode: { type: "string", example: "A1B2C3D4" },
                        deliveryCode: { type: "string", example: "E5F6G7H8" },
                        trackingNumber: { type: "string", nullable: true, example: "TRK-0001" },
                        notes: { type: "string", nullable: true, example: "Leave at door" },
                        estimatedDeliveryDate: { type: "string", format: "date-time", nullable: true },
                        actualDeliveryDate: { type: "string", format: "date-time", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                // ─── Review ───────────────────────────────────────────────────────
                Review: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        userId: { type: "integer", example: 42 },
                        productId: { type: "integer", example: 10 },
                        storeId: { type: "integer", example: 1 },
                        rating: { type: "integer", minimum: 1, maximum: 5, example: 4 },
                        comment: { type: "string", nullable: true, example: "Great quality handbag!" },
                        isVerifiedPurchase: { type: "boolean", example: true },
                        user: {
                            type: "object",
                            properties: {
                                id: { type: "integer", example: 42 },
                                firstName: { type: "string", example: "Jane" },
                                lastName: { type: "string", example: "Doe" },
                                avatar: { type: "string", nullable: true },
                            },
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                ReviewListResponse: {
                    type: "object",
                    properties: {
                        data: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Review" },
                        },
                        pagination: {
                            type: "object",
                            properties: {
                                currentPage: { type: "integer", example: 1 },
                                totalPages: { type: "integer", example: 2 },
                                totalReviews: { type: "integer", example: 15 },
                                hasNext: { type: "boolean", example: true },
                                hasPrev: { type: "boolean", example: false },
                            },
                        },
                    },
                },
                // ─── Notification ─────────────────────────────────────────────────
                Notification: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        userId: { type: "integer", example: 42 },
                        title: { type: "string", example: "Order Placed" },
                        message: { type: "string", example: "Your order ORD-20260501-0001 has been placed successfully." },
                        type: {
                            type: "string",
                            enum: [
                                "order_placed", "order_status_update", "order_cancelled",
                                "payment_received", "payment_failed",
                                "vendor_approved", "vendor_rejected",
                                "new_review", "product_out_of_stock",
                                "delivery_assigned", "delivery_completed",
                                "system_announcement",
                            ],
                            example: "order_placed",
                        },
                        priority: {
                            type: "string",
                            enum: ["low", "medium", "high", "urgent"],
                            example: "medium",
                        },
                        isRead: { type: "boolean", example: false },
                        metadata: { type: "object", nullable: true, example: { orderId: 1 } },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                NotificationListResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        data: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Notification" },
                        },
                        pagination: {
                            type: "object",
                            properties: {
                                currentPage: { type: "integer", example: 1 },
                                totalPages: { type: "integer", example: 2 },
                                total: { type: "integer", example: 30 },
                                hasNext: { type: "boolean", example: true },
                                hasPrev: { type: "boolean", example: false },
                            },
                        },
                    },
                },
                // ─── Wishlist ─────────────────────────────────────────────────────
                WishlistResponse: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Product" },
                        },
                        total: { type: "integer", example: 3 },
                    },
                },
                // ─── Chat ─────────────────────────────────────────────────────────
                ChatMessage: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        conversationId: { type: "integer", example: 1 },
                        senderId: { type: "integer", example: 42 },
                        body: { type: "string", example: "Hello, I need help with my order." },
                        isRead: { type: "boolean", example: false },
                        sender: {
                            type: "object",
                            properties: {
                                id: { type: "integer", example: 42 },
                                firstName: { type: "string", example: "Jane" },
                                lastName: { type: "string", example: "Doe" },
                                avatar: { type: "string", nullable: true },
                                role: { type: "string", example: "customer" },
                            },
                        },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                ChatConversation: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        adminId: { type: "integer", example: 1 },
                        participantId: { type: "integer", example: 42 },
                        admin: { $ref: "#/components/schemas/UserPublic" },
                        participant: { $ref: "#/components/schemas/UserPublic" },
                        lastMessageAt: { type: "string", format: "date-time", nullable: true },
                        adminUnreadCount: { type: "integer", example: 0 },
                        participantUnreadCount: { type: "integer", example: 2 },
                        messages: {
                            type: "array",
                            description: "Latest message only (preview)",
                            items: { $ref: "#/components/schemas/ChatMessage" },
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                ChatUserListResponse: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: { $ref: "#/components/schemas/UserPublic" },
                        },
                        meta: {
                            type: "object",
                            properties: {
                                total: { type: "integer", example: 50 },
                                pages: { type: "integer", example: 3 },
                                page: { type: "integer", example: 1 },
                                limit: { type: "integer", example: 20 },
                            },
                        },
                    },
                },
                ChatConversationListResponse: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: { $ref: "#/components/schemas/ChatConversation" },
                        },
                        meta: {
                            type: "object",
                            properties: {
                                total: { type: "integer", example: 12 },
                                pages: { type: "integer", example: 1 },
                                page: { type: "integer", example: 1 },
                                limit: { type: "integer", example: 20 },
                            },
                        },
                    },
                },
                ChatMessageListResponse: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: { $ref: "#/components/schemas/ChatMessage" },
                        },
                        meta: {
                            type: "object",
                            properties: {
                                total: { type: "integer", example: 45 },
                                pages: { type: "integer", example: 3 },
                                page: { type: "integer", example: 1 },
                                limit: { type: "integer", example: 20 },
                            },
                        },
                    },
                },
                // ─── Rider Ecosystem ─────────────────────────────────────────────
                RiderProfile: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        userId: { type: "integer", example: 10 },
                        vehicleType: { type: "string", example: "Motorcycle" },
                        vehicleNumber: { type: "string", example: "LAG-123-ABC" },
                        isOnline: { type: "boolean", example: false },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                RiderDocument: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        userId: { type: "integer", example: 10 },
                        type: { type: "string", example: "ID_CARD" },
                        url: { type: "string", example: "https://res.cloudinary.com/doc.jpg" },
                        status: { type: "string", enum: ["pending", "approved", "rejected"], example: "pending" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                RiderBankAccount: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        userId: { type: "integer", example: 10 },
                        bankName: { type: "string", example: "GTBank" },
                        accountNumber: { type: "string", example: "0123456789" },
                        accountName: { type: "string", example: "Jane Doe" },
                    },
                },
                DeliveryOffer: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        deliveryId: { type: "integer", example: 5 },
                        riderId: { type: "integer", example: 10 },
                        status: { type: "string", enum: ["pending", "accepted", "rejected", "expired"], example: "pending" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                // ─── Wallet & Financials ──────────────────────────────────────────
                Wallet: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        userId: { type: "integer", example: 10 },
                        balance: { type: "number", example: 120000 },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                        transactions: {
                            type: "array",
                            items: { $ref: "#/components/schemas/WalletTransaction" },
                        },
                    },
                },
                WalletTransaction: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        walletId: { type: "integer", example: 1 },
                        amount: { type: "number", example: 500 },
                        type: { type: "string", enum: ["credit", "debit"], example: "credit" },
                        description: { type: "string", example: "Earning for delivery #5" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Withdrawal: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        userId: { type: "integer", example: 10 },
                        amount: { type: "number", example: 50000 },
                        status: { type: "string", enum: ["pending", "approved", "rejected", "completed"], example: "pending" },
                        bankName: { type: "string", example: "GTBank" },
                        accountNumber: { type: "string", example: "0123456789" },
                        accountName: { type: "string", example: "Jane Doe" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                // ─── Comparison ──────────────────────────────────────────────────
                CompareItem: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        compareListId: { type: "integer", example: 1 },
                        productId: { type: "integer", example: 10 },
                        createdAt: { type: "string", format: "date-time" },
                        product: { $ref: "#/components/schemas/Product" },
                    },
                },
                CompareList: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        userId: { type: "integer", example: 42 },
                        items: {
                            type: "array",
                            items: { $ref: "#/components/schemas/CompareItem" },
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                // ─── Admin ────────────────────────────────────────────────────────
                AdminVendorListResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        data: {
                            type: "array",
                            items: {
                                allOf: [
                                    { $ref: "#/components/schemas/UserPublic" },
                                    {
                                        type: "object",
                                        properties: {
                                            vendorProfile: { $ref: "#/components/schemas/VendorProfile" },
                                        },
                                    },
                                ],
                            },
                        },
                        pagination: {
                            type: "object",
                            properties: {
                                currentPage: { type: "integer", example: 1 },
                                totalPages: { type: "integer", example: 2 },
                                totalVendors: { type: "integer", example: 15 },
                                hasNext: { type: "boolean", example: true },
                                hasPrev: { type: "boolean", example: false },
                            },
                        },
                    },
                },
                DashboardStats: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        data: {
                            type: "object",
                            properties: {
                                users: {
                                    type: "object",
                                    properties: {
                                        total: { type: "integer", example: 200 },
                                        vendors: { type: "integer", example: 30 },
                                        customers: { type: "integer", example: 165 },
                                        pendingVendors: { type: "integer", example: 5 },
                                    },
                                },
                                orders: {
                                    type: "object",
                                    properties: {
                                        total: { type: "integer", example: 450 },
                                        statuses: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    _id: { type: "string", example: "delivered" },
                                                    count: { type: "integer", example: 300 },
                                                },
                                            },
                                        },
                                        recent: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Order" },
                                        },
                                    },
                                },
                                revenue: {
                                    type: "object",
                                    properties: {
                                        totalRevenue: { type: "number", example: 5000000 },
                                        totalPaid: { type: "number", example: 4800000 },
                                    },
                                },
                            },
                        },
                    },
                },
                // Legacy aliases kept for any existing refs
                Order_Legacy: {
                    type: "object",
                    properties: {
                        _id: { type: "string", format: "objectId" },
                        orderNumber: { type: "string" },
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
            },
        },
        tags: [
            { name: "System", description: "Health check and system status" },
            { name: "Auth", description: "Login, logout, and password reset" },
            { name: "Customers", description: "Customer profile and address management" },
            { name: "Vendors", description: "Vendor onboarding — registration, OTP, profile, store, documents" },
            { name: "Products", description: "Product catalog — browse, search, create, update" },
            { name: "Cart", description: "Shopping cart — add, update, remove items" },
            { name: "Orders", description: "Order placement and order history" },
            { name: "Payments", description: "Paystack payment initialization and verification" },
            { name: "Deliveries", description: "Delivery status tracking and updates" },
            { name: "Reviews", description: "Product reviews and ratings" },
            { name: "Notifications", description: "User notifications — read, mark read, delete" },
            { name: "Wishlist", description: "Wishlist — add and remove saved products" },
            { name: "Categories", description: "Product category browsing" },
            { name: "Chat", description: "Admin–user chat — conversations and messages (HTTP). Real-time events via Socket.IO." },
            { name: "Rider", description: "Rider Ecosystem — onboarding, availability, delivery logistics, and withdrawals" },
            { name: "Comparison", description: "Product Comparison — manage side-by-side comparison lists" },
            { name: "Admin", description: "Admin-only — vendor approval, user management, dashboard stats" },
        ],
    },
    apis: ["./src/app.{ts,js}", "./src/routes/*.{ts,js}", "./dist/routes/*.js"],
};
export default swaggerOptions;
//# sourceMappingURL=swagger.js.map