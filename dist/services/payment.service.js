import axios from "axios";
import crypto from "crypto";
import prisma from "../config/prismaClient.js";
import { createHttpError } from "../utils/httpError.js";
import { toIntId, withMongoId } from "../utils/prismaHelpers.js";
export const initializePayment = async (userId, data) => {
    const ids = Array.isArray(data.orderIds) ? data.orderIds : data.orderId ? [data.orderId] : [];
    if (ids.length === 0)
        throw createHttpError("Provide at least one orderId for payment", 400);
    const orders = await prisma.order.findMany({
        where: {
            id: { in: ids.map(id => toIntId(id, "order id")) },
            userId: toIntId(userId, "user id")
        },
        include: { items: true, payment: true },
    });
    if (orders.length === 0)
        throw createHttpError("No valid orders found", 404);
    if (orders.length !== ids.length)
        throw createHttpError("Some orders were not found or do not belong to you", 403);
    let totalSubtotal = 0;
    let totalShipping = 0;
    let totalTax = 0;
    let totalAmount = 0;
    for (const order of orders) {
        if (order.currentStatus !== "Order Received") {
            throw createHttpError(`Order ${order.orderNumber} cannot be paid in its current status`, 400);
        }
        if (order.payment && order.payment.status === "paid") {
            throw createHttpError(`Order ${order.orderNumber} is already paid`, 409);
        }
        let orderSubtotal = Number(order.subtotal || 0);
        let orderTotal = Number(order.total || 0);
        if (!Number.isFinite(orderTotal) || orderTotal <= 0) {
            orderSubtotal = order.items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
            orderTotal = orderSubtotal + Number(order.shippingFee || 0) + Number(order.taxAmount || 0);
            await prisma.order.update({ where: { id: order.id }, data: { subtotal: orderSubtotal, total: orderTotal } });
        }
        totalSubtotal += orderSubtotal;
        totalShipping += Number(order.shippingFee || 0);
        totalTax += Number(order.taxAmount || 0);
        totalAmount += orderTotal;
    }
    if (totalAmount <= 0)
        throw createHttpError("Total payment amount must be greater than zero", 400);
    const transactionRef = `TX-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const payment = await prisma.payment.create({
        data: {
            amount: totalAmount,
            currency: orders[0].currency || "NGN",
            subtotal: totalSubtotal,
            shippingFee: totalShipping,
            taxAmount: totalTax,
            total: totalAmount,
            paidByCustomer: 0,
            paymentMethod: data.paymentMethod,
            provider: "paystack",
            transactionRef,
            orders: { connect: orders.map(o => ({ id: o.id })) }
        },
    });
    if (data.paymentMethod === "card") {
        if (!process.env.PAYSTACK_SECRET_KEY)
            throw createHttpError("Missing PAYSTACK_SECRET_KEY", 500);
        if (!process.env.BASE_URL)
            throw createHttpError("Missing BASE_URL", 500);
        const response = await axios.post("https://api.paystack.co/transaction/initialize", {
            email: orders[0].customerEmail,
            amount: Math.round(payment.total * 100),
            reference: transactionRef,
            callback_url: `${process.env.BASE_URL}/api/payments/verify/${transactionRef}`,
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        const updated = await prisma.payment.update({
            where: { id: payment.id },
            data: { paymentUrl: response.data.data.authorization_url },
        });
        return { paymentUrl: updated.paymentUrl, reference: transactionRef };
    }
    if (data.paymentMethod === "wallet") {
        await prisma.$transaction([
            prisma.payment.update({
                where: { id: payment.id },
                data: { status: "paid", paidAt: new Date(), paidByCustomer: payment.total },
            }),
            prisma.order.updateMany({
                where: { id: { in: orders.map(o => o.id) } },
                data: { currentStatus: "confirmed" }
            }),
        ]);
        return { message: "Paid with wallet" };
    }
    if (["nextgen_purse", "easybuy", "makopa"].includes(data.paymentMethod)) {
        return { message: "BNPL initiated" };
    }
    throw createHttpError("Unsupported payment method", 400);
};
export const verifyPayment = async (reference) => {
    const payment = await prisma.payment.findUnique({ where: { transactionRef: reference } });
    if (!payment)
        throw createHttpError("Payment not found", 404);
    if (payment.status === "paid") {
        if (payment.failureReason) {
            const cleaned = await prisma.payment.update({
                where: { id: payment.id },
                data: { failureReason: null },
            });
            return withMongoId(cleaned);
        }
        return withMongoId(payment);
    }
    const method = String(payment.paymentMethod || "").toLowerCase();
    const provider = String(payment.provider || "").toLowerCase();
    if (method !== "card" || provider !== "paystack") {
        return withMongoId(payment);
    }
    if (!process.env.PAYSTACK_SECRET_KEY)
        throw createHttpError("Missing PAYSTACK_SECRET_KEY", 500);
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const data = response?.data?.data || {};
    const gatewayStatus = String(data.status || "").toLowerCase();
    if (gatewayStatus !== "success") {
        const updated = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: gatewayStatus === "failed" ? "failed" : "pending",
                failureReason: data.gateway_response || data.status || "Payment not successful",
            },
        });
        return withMongoId({
            ...updated,
            gatewayStatus: data.status || null,
            gatewayMessage: data.gateway_response || null,
        });
    }
    const [updated] = await prisma.$transaction([
        prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: "paid",
                paidAt: new Date(),
                paidByCustomer: Math.max(0, Number(data.amount || 0) / 100),
                failureReason: null,
            },
        }),
        prisma.order.updateMany({
            where: { paymentId: payment.id },
            data: { currentStatus: "confirmed" }
        }),
    ]);
    return withMongoId(updated);
};
export const handlePaystackWebhook = async (event) => {
    if (event.event !== "charge.success")
        return;
    const payment = await prisma.payment.findUnique({ where: { transactionRef: event.data.reference } });
    if (!payment || payment.status === "paid")
        return;
    await prisma.$transaction([
        prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: "paid",
                paidAt: new Date(),
                paidByCustomer: Math.max(0, Number(event.data.amount || 0) / 100),
                failureReason: null,
            },
        }),
        prisma.order.updateMany({
            where: { paymentId: payment.id },
            data: { currentStatus: "confirmed" }
        }),
    ]);
};
//# sourceMappingURL=payment.service.js.map