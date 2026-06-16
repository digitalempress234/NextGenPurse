import crypto from "crypto";
import prisma from "../config/prismaClient.js";
import notificationService from "./notification.service.js";
import { createHttpError } from "../utils/httpError.js";
import { formatOrder, normalizeOrderCreate, toIntId, withMongoId } from "../utils/prismaHelpers.js";
const orderInclude = {
    user: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
    store: { select: { id: true, storeName: true, vendorId: true } },
    items: { include: { product: { select: { id: true, productName: true, images: true } } } },
    payment: true,
    delivery: { include: { statusUpdates: true } },
};
const groupItemsByStore = (items) => {
    const groups = new Map();
    for (const item of items) {
        const storeId = item.storeId;
        if (!groups.has(storeId))
            groups.set(storeId, []);
        groups.get(storeId).push(item);
    }
    return groups;
};
export const placeOrderFromCart = async (userId, data) => {
    const id = toIntId(userId, "user id");
    const { shippingAddress = {}, shippingFee = 0, taxAmount = 0 } = data;
    const createdOrders = await prisma.$transaction(async (tx) => {
        const cart = await tx.cart.findUnique({
            where: { userId: id },
            include: { items: { include: { product: true } } },
        });
        if (!cart || cart.items.length === 0)
            throw createHttpError("Cart is empty", 400);
        const user = await tx.user.findUnique({ where: { id } });
        if (!user)
            throw createHttpError("User not found", 404);
        const groups = groupItemsByStore(cart.items);
        const shippingFeeTotal = Math.max(0, Number(shippingFee) || 0);
        const taxAmountTotal = Math.max(0, Number(taxAmount) || 0);
        const storeSubtotals = new Map();
        let grandSubtotal = 0;
        for (const [storeId, items] of groups.entries()) {
            const subtotal = items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
            storeSubtotals.set(storeId, subtotal);
            grandSubtotal += subtotal;
        }
        const storeIds = Array.from(groups.keys());
        const storeCharges = new Map();
        let allocatedShipping = 0;
        let allocatedTax = 0;
        storeIds.forEach((storeId, index) => {
            const isLast = index === storeIds.length - 1;
            const subtotal = storeSubtotals.get(storeId) || 0;
            const ratio = grandSubtotal > 0 ? subtotal / grandSubtotal : 1 / storeIds.length;
            const shipping = isLast ? Math.max(0, shippingFeeTotal - allocatedShipping) : Math.max(0, Math.round(shippingFeeTotal * ratio));
            const tax = isLast ? Math.max(0, taxAmountTotal - allocatedTax) : Math.max(0, Math.round(taxAmountTotal * ratio));
            allocatedShipping += shipping;
            allocatedTax += tax;
            storeCharges.set(storeId, { shipping, tax });
        });
        const orders = [];
        for (const [storeId, items] of groups.entries()) {
            const subtotal = storeSubtotals.get(storeId) || 0;
            const charges = storeCharges.get(storeId) || { shipping: 0, tax: 0 };
            const total = subtotal + charges.shipping + charges.tax;
            const order = await tx.order.create({
                data: normalizeOrderCreate({
                    userId: id,
                    storeId,
                    user,
                    shippingAddress,
                    cart,
                    subtotal,
                    shippingFee: charges.shipping,
                    taxAmount: charges.tax,
                    total,
                    orderNumber: `ORD-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
                }),
            });
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product)
                    throw createHttpError("Product not found", 404);
                if (product.stock < item.quantity)
                    throw createHttpError("Insufficient stock", 409);
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: product.id,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        productName: product.productName,
                        productCode: String(product.id),
                        productImage: Array.isArray(product.images) ? product.images[0] : null,
                    },
                });
                await tx.product.update({
                    where: { id: product.id },
                    data: { stock: { decrement: item.quantity }, totalSold: { increment: item.quantity } },
                });
            }
            if (shippingAddress?.address) {
                await tx.delivery.create({
                    data: {
                        orderId: order.id,
                        deliveryLabel: shippingAddress.label ?? null,
                        deliveryState: shippingAddress.state ?? null,
                        deliveryCity: shippingAddress.city ?? null,
                        deliveryAddress: shippingAddress.address,
                        status: "pending",
                        statusUpdates: {
                            create: {
                                status: "Order Received",
                                location: [shippingAddress.city, shippingAddress.state].filter(Boolean).join(", ") || "N/A",
                            },
                        },
                    },
                });
            }
            orders.push(order);
        }
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        await tx.cart.update({ where: { id: cart.id }, data: { subtotal: 0, totalItems: 0 } });
        return { orders, user };
    });
    for (const order of createdOrders.orders) {
        await notificationService.notifyOrderPlaced(order, createdOrders.user);
    }
    return withMongoId(createdOrders.orders);
};
export const getVendorOrders = async (userId, query) => {
    const store = await prisma.store.findUnique({ where: { vendorId: toIntId(userId, "user id") } });
    if (!store)
        return { items: [], meta: { total: 0, pages: 0, page: 1, limit: 0 } };
    const pageNumber = Math.max(1, parseInt(query.page, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const whereFilter = { storeId: store.id };
    if (query.status) {
        whereFilter.currentStatus = query.status;
    }
    const [total, orders] = await Promise.all([
        prisma.order.count({ where: whereFilter }),
        prisma.order.findMany({
            where: whereFilter,
            include: orderInclude,
            orderBy: { createdAt: "desc" },
            skip: (pageNumber - 1) * limitNumber,
            take: limitNumber,
        }),
    ]);
    return { items: orders.map(formatOrder), meta: { total, pages: Math.ceil(total / limitNumber), page: pageNumber, limit: limitNumber } };
};
export const getCustomerOrders = async (userId, query) => {
    const pageNumber = Math.max(1, parseInt(query.page, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const where = { userId: toIntId(userId, "user id") };
    const [total, orders] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({
            where,
            include: orderInclude,
            orderBy: { createdAt: "desc" },
            skip: (pageNumber - 1) * limitNumber,
            take: limitNumber,
        }),
    ]);
    return { items: orders.map(formatOrder), meta: { total, pages: Math.ceil(total / limitNumber), page: pageNumber, limit: limitNumber } };
};
export const cancelOrder = async (orderId, userId) => {
    const id = toIntId(orderId, "order id");
    const user = toIntId(userId, "user id");
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true, payment: true } });
    if (!order)
        throw createHttpError("Order not found", 404);
    if (order.userId !== user)
        throw createHttpError("Unauthorized", 403);
    const hours = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60);
    if (hours > 24)
        throw createHttpError("Cancellation window expired", 400);
    if (order.currentStatus !== "Order Received")
        throw createHttpError("Order cannot be cancelled", 400);
    const updated = await prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id }, data: { currentStatus: "cancelled" } });
        for (const item of order.items) {
            await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        }
        if (order.payment) {
            await tx.payment.update({ where: { id: order.payment.id }, data: { status: "refunded" } });
        }
        return tx.order.findUnique({ where: { id }, include: orderInclude });
    });
    await notificationService.createNotification(order.userId, "Order Cancelled", `Your order #${order.orderNumber} has been cancelled successfully.`, "order_cancelled", { orderId: order.id, orderNumber: order.orderNumber, cancelledAt: new Date() }, "medium");
    return formatOrder(updated);
};
export const processRefund = async (orderId) => {
    const order = await prisma.order.findUnique({ where: { id: toIntId(orderId, "order id") }, include: { payment: true } });
    if (!order)
        throw createHttpError("Order not found", 404);
    if (order.currentStatus !== "cancelled" && order.currentStatus !== "Cancelled") {
        throw createHttpError("Order cannot be refunded", 400);
    }
    if (!order.payment)
        throw createHttpError("Payment record not found", 404);
    return withMongoId(await prisma.payment.update({ where: { id: order.payment.id }, data: { status: "refunded" } }));
};
export const updateOrderStatus = async (orderId, newStatus, user) => {
    const id = toIntId(orderId, "order id");
    const order = await prisma.order.findUnique({ where: { id }, include: { store: true, delivery: true } });
    if (!order)
        throw createHttpError("Order not found", 404);
    const actorId = toIntId(user.id ?? user._id, "user id");
    if (user.role !== "admin" && order.store.vendorId !== actorId)
        throw createHttpError("Unauthorized", 403);
    const validStatuses = ["Order Received", "confirmed", "preparing", "ready_for_delivery", "out_for_delivery", "delivered"];
    const currentIndex = validStatuses.indexOf(order.currentStatus);
    const newIndex = validStatuses.indexOf(newStatus);
    if (newIndex === -1)
        throw createHttpError("Invalid status transition", 400);
    if (currentIndex === -1)
        throw createHttpError("Invalid current order status", 409);
    if (newIndex <= currentIndex)
        throw createHttpError("Invalid status transition", 400);
    const updated = await prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id }, data: { currentStatus: newStatus } });
        if (order.delivery) {
            if (newStatus === "out_for_delivery") {
                await tx.deliveryStatusUpdate.create({ data: { deliveryId: order.delivery.id, status: "Out for delivery", location: "En route" } });
            }
            else if (newStatus === "delivered") {
                await tx.deliveryStatusUpdate.create({ data: { deliveryId: order.delivery.id, status: "Delivered", location: order.shippingCity } });
            }
        }
        return tx.order.findUnique({ where: { id }, include: orderInclude });
    });
    await notificationService.notifyOrderStatusUpdate(updated, updated.userId);
    return formatOrder(updated);
};
//# sourceMappingURL=order.service.js.map