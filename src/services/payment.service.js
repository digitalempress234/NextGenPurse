import axios from "axios";
import crypto from "crypto";
import prisma from "../config/prismaClient.js";
import { createHttpError } from "../utils/httpError.js";
import { toIntId, withMongoId } from "../utils/prismaHelpers.js";

export const initializePayment = async (userId, data) => {
  const ids = Array.isArray(data.orderIds) ? data.orderIds : data.orderId ? [data.orderId] : [];
  if (ids.length !== 1) throw createHttpError("Provide exactly one orderId for payment", 400);

  const order = await prisma.order.findFirst({
    where: { id: toIntId(ids[0], "order id"), userId: toIntId(userId, "user id") },
    include: { items: true, payment: true },
  });
  if (!order) throw createHttpError("Order not found", 404);
  if (!order.items.length) throw createHttpError("Order has no items", 400);
  if (order.currentStatus !== "Order Received") throw createHttpError("Order must be placed before making payment", 400);

  let computedSubtotal = Number(order.subtotal || 0);
  let computedTotal = Number(order.total || 0);
  if (!Number.isFinite(computedTotal) || computedTotal <= 0) {
    computedSubtotal = order.items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    computedTotal = computedSubtotal + Number(order.shippingFee || 0) + Number(order.taxAmount || 0);
    await prisma.order.update({ where: { id: order.id }, data: { subtotal: computedSubtotal, total: computedTotal } });
  }
  if (!Number.isFinite(computedTotal) || computedTotal <= 0) throw createHttpError("Order total is invalid", 400);

  if (order.payment) {
    if (order.payment.status === "paid") throw createHttpError("Order already paid", 409);
    if (order.payment.status === "pending" && order.payment.paymentUrl) {
      return { paymentUrl: order.payment.paymentUrl, reference: order.payment.transactionRef };
    }
    throw createHttpError("Payment already initialized for this order", 409);
  }

  const transactionRef = `TX-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: computedTotal,
      currency: order.currency || "NGN",
      subtotal: computedSubtotal,
      shippingFee: Number(order.shippingFee || 0),
      taxAmount: Number(order.taxAmount || 0),
      total: computedTotal,
      paidByCustomer: 0,
      paymentMethod: data.paymentMethod,
      provider: "paystack",
      transactionRef,
    },
  });

  if (data.paymentMethod === "card") {
    if (!process.env.PAYSTACK_SECRET_KEY) throw createHttpError("Missing PAYSTACK_SECRET_KEY", 500);
    if (!process.env.BASE_URL) throw createHttpError("Missing BASE_URL", 500);

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: order.customerEmail,
        amount: payment.total * 100,
        reference: transactionRef,
        callback_url: `${process.env.BASE_URL}/api/payments/verify/${transactionRef}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

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
      prisma.order.update({ where: { id: order.id }, data: { currentStatus: "confirmed" } }),
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
  if (!payment) throw createHttpError("Payment not found", 404);

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

  if (!process.env.PAYSTACK_SECRET_KEY) throw createHttpError("Missing PAYSTACK_SECRET_KEY", 500);

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
    prisma.order.update({ where: { id: payment.orderId }, data: { currentStatus: "confirmed" } }),
  ]);

  return withMongoId(updated);
};

export const handlePaystackWebhook = async (event) => {
  if (event.event !== "charge.success") return;

  const payment = await prisma.payment.findUnique({ where: { transactionRef: event.data.reference } });
  if (!payment || payment.status === "paid") return;

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
    prisma.order.update({ where: { id: payment.orderId }, data: { currentStatus: "confirmed" } }),
  ]);
};
