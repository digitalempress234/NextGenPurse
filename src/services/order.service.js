import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItems.js";
import Payment from "../models/Payment.js";
import Delivery from "../models/Delivery.js";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import notificationService from "./notification.service.js";
import mongoose from "mongoose";
import crypto from "crypto";
import { createHttpError } from "../utils/httpError.js";

const groupItemsByStore = (items) => {
    const groups = new Map();
    items.forEach((item) => {
        const storeId = item.store.toString();
        if (!groups.has(storeId)) groups.set(storeId, []);
        groups.get(storeId).push(item);
    });
    return groups;
};

export const placeOrderFromCart = async (userId, data) => {
    const { shippingAddress, shippingFee = 0, taxAmount = 0 } = data;

    let createdOrders = [];
    let user = null;

    // Get cart and user without transactions
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
        throw createHttpError("Cart is empty", 400);
    }

    user = await User.findById(userId);
    if (!user) throw createHttpError("User not found", 404);

    const groups = groupItemsByStore(cart.items);
    createdOrders = [];

    const shippingFeeTotal = Math.max(0, Number(shippingFee) || 0);
    const taxAmountTotal = Math.max(0, Number(taxAmount) || 0);

    const storeSubtotals = new Map();
    let grandSubtotal = 0;
    for (const [storeId, items] of groups.entries()) {
        const storeSubtotal = items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
        storeSubtotals.set(storeId, storeSubtotal);
        grandSubtotal += storeSubtotal;
    }

    const storeIds = Array.from(groups.keys());
    const storeCharges = new Map();
    let allocatedShipping = 0;
    let allocatedTax = 0;
    storeIds.forEach((storeId, idx) => {
        const isLast = idx === storeIds.length - 1;
        const subtotal = storeSubtotals.get(storeId) || 0;
        const ratio = grandSubtotal > 0 ? subtotal / grandSubtotal : 1 / storeIds.length;

        const shipping = isLast
            ? Math.max(0, shippingFeeTotal - allocatedShipping)
            : Math.max(0, Math.round(shippingFeeTotal * ratio));
        const tax = isLast
            ? Math.max(0, taxAmountTotal - allocatedTax)
            : Math.max(0, Math.round(taxAmountTotal * ratio));

        allocatedShipping += shipping;
        allocatedTax += tax;
        storeCharges.set(storeId, { shipping, tax });
    });

    for (const [storeId, items] of groups.entries()) {
        const storeSubtotal = storeSubtotals.get(storeId) || 0;
        const charges = storeCharges.get(storeId) || { shipping: 0, tax: 0 };
        const orderTotal = storeSubtotal + charges.shipping + charges.tax;

        const order = new Order({
            orderNumber: `ORD-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
            user: userId,
            store: storeId,
            items: [],
            customer: {
                name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                email: user.email,
                phone: user.phoneNumber ? String(user.phoneNumber) : undefined
            },
            shippingAddress: shippingAddress || {},
            currency: cart.currency || "NGN",
            subtotal: storeSubtotal,
            shippingFee: charges.shipping,
            taxAmount: charges.tax,
            total: orderTotal
        });

        await order.save();

        const orderItemDocs = [];

        for (const item of items) {
            const product = await Product.findById(item.product._id);
            if (!product) throw createHttpError("Product not found", 404);
            if (product.stock < item.quantity) throw createHttpError("Insufficient stock", 409);

            const orderItem = new OrderItem({
                order: order._id,
                product: product._id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                productName: product.productName,
                productCode: product._id.toString(),
                productImage: product.images?.[0]
            });

            await orderItem.save();
            orderItemDocs.push(orderItem._id);

            product.stock -= item.quantity;
            product.totalSold += item.quantity;
            await product.save();
        }

        order.items = orderItemDocs;
        await order.save();

        if (shippingAddress && shippingAddress.address) {
            const delivery = new Delivery({
                order: order._id,
                deliveryAddress: shippingAddress,
                statusUpdates: [
                    {
                        status: "Order Received",
                        location: [shippingAddress.city, shippingAddress.state].filter(Boolean).join(", ") || "N/A"
                    }
                ]
            });
            await delivery.save();
            order.delivery = delivery._id;
            await order.save();
        }

        createdOrders.push(order);
    }

    // Clear cart
    cart.items = [];
    cart.subtotal = 0;
    cart.totalItems = 0;
    await cart.save();

    // Send notifications
    if (user) {
        for (const order of createdOrders) {
            await notificationService.notifyOrderPlaced(order, user);
        }
    }

    return createdOrders;
};

export const getVendorOrders = async (userId, query) => {
    const store = await Store.findOne({ vendor: userId });
    if (!store) {
        return {
            items: [],
            meta: { total: 0, pages: 0, page: 1, limit: 0 }
        };
    }

    const {
        status,
        page = 1,
        limit = 10
    } = query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const filter = { store: store._id };
    if (status) filter.currentStatus = status;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
        .populate("user", "firstName lastName email phoneNumber")
        .populate({
            path: "items",
            populate: { path: "product", select: "productName images" }
        })
        .populate("payment")
        .populate("delivery")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean();

    const pages = limitNumber > 0 ? Math.ceil(total / limitNumber) : 0;

    return {
        items: orders,
        meta: { total, pages, page: pageNumber, limit: limitNumber }
    };
};

export const getCustomerOrders = async (userId, query) => {
    const { page = 1, limit = 10 } = query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const total = await Order.countDocuments({ user: userId });
    const orders = await Order.find({ user: userId })
        .populate("store", "storeName")
        .populate({
            path: "items",
            populate: { path: "product", select: "productName images" }
        })
        .populate("payment")
        .populate("delivery")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean();

    const pages = limitNumber > 0 ? Math.ceil(total / limitNumber) : 0;

    return {
        items: orders,
        meta: { total, pages, page: pageNumber, limit: limitNumber }
    };
};

export const cancelOrder = async (orderId, userId) => {
    const order = await Order.findById(orderId).populate("items");
    if (!order) throw createHttpError("Order not found", 404);
    if (order.user.toString() !== userId) throw createHttpError("Unauthorized", 403);
    
    const timeDiff = Date.now() - order.createdAt.getTime();
    const hours = timeDiff / (1000 * 60 * 60);
    if (hours > 24) throw createHttpError("Cancellation window expired", 400);
    if (order.currentStatus !== "Order Received") throw createHttpError("Order cannot be cancelled", 400);
    
    order.currentStatus = "cancelled";
    await order.save();
    
    // Restore stock
    for (const itemId of order.items) {
        const item = await OrderItem.findById(itemId);
        if (!item) continue;
        const product = await Product.findById(item.product);
        if (!product) continue;
        product.stock += item.quantity;
        await product.save();
    }
    
    // Handle refund
    if (order.payment) {
        const payment = await Payment.findById(order.payment);
        if (payment) {
            payment.status = "refunded";
            await payment.save();
        }
    }
    
    // Send notification
    await notificationService.createNotification(
        order.user,
        'Order Cancelled',
        `Your order #${order.orderNumber} has been cancelled successfully.`,
        'order_cancelled',
        {
            orderId: order._id,
            orderNumber: order.orderNumber,
            cancelledAt: new Date()
        },
        'medium'
    );
    
    return order;
};

export const processRefund = async (orderId) => {
    const order = await Order.findById(orderId).populate('payment');
    if (!order) throw createHttpError("Order not found", 404);
    if (order.currentStatus !== 'cancelled' && order.currentStatus !== 'Cancelled') {
        throw createHttpError("Order cannot be refunded", 400);
    }

    const payment = order.payment;
    if (!payment) throw createHttpError("Payment record not found", 404);

    if (typeof payment.save === 'function') {
        payment.status = 'refunded';
        await payment.save();
        return payment;
    }

    const paymentRecord = await Payment.findById(payment);
    if (!paymentRecord) throw createHttpError("Payment record not found", 404);
    paymentRecord.status = 'refunded';
    await paymentRecord.save();
    return paymentRecord;
};

export const updateOrderStatus = async (orderId, newStatus, user) => {
    const order = await Order.findById(orderId).populate("store");
    if (!order) throw createHttpError("Order not found", 404);
    if (user.role !== "admin" && order.store.vendor.toString() !== user.id) throw createHttpError("Unauthorized", 403);
    
    const validStatuses = ["Order Received", "confirmed", "preparing", "ready_for_delivery", "out_for_delivery", "delivered"];
    const currentIndex = validStatuses.indexOf(order.currentStatus);
    const newIndex = validStatuses.indexOf(newStatus);
    if (newIndex === -1) throw createHttpError("Invalid status transition", 400);
    if (currentIndex === -1) throw createHttpError("Invalid current order status", 409);
    if (newIndex <= currentIndex) throw createHttpError("Invalid status transition", 400);
    
    order.currentStatus = newStatus;
    await order.save();
    
    // Update delivery
    if (order.delivery) {
        const delivery = await Delivery.findById(order.delivery);
        if (newStatus === "out_for_delivery") {
            delivery.statusUpdates.push({ status: "Out for delivery", location: "En route" });
        } else if (newStatus === "delivered") {
            delivery.statusUpdates.push({ status: "Delivered", location: order.shippingAddress.city });
        }
        await delivery.save();
    }
    
    // Send notification to customer
    await notificationService.notifyOrderStatusUpdate(order, order.user);
    
    return order;
};
