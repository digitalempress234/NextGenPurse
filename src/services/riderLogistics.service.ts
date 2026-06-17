import prisma from "../config/prismaClient.js";
import { createHttpError } from "../utils/httpError.js";
import { toIntId } from "../utils/prismaHelpers.js";
import crypto from "crypto";

export const getAvailableOffers = async (riderId) => {
  const id = toIntId(riderId, "rider id");
  return prisma.deliveryOffer.findMany({
    where: { riderId: id, status: "pending" },
    include: {
      // In a real app, we'd include delivery and order details here
    },
  });
};

export const acceptOffer = async (riderId, offerId) => {
  const rId = toIntId(riderId, "rider id");
  const oId = toIntId(offerId, "offer id");

  return prisma.$transaction(async (tx) => {
    const offer = await tx.deliveryOffer.findUnique({
      where: { id: oId },
    });

    if (!offer || offer.riderId !== rId) throw createHttpError("Offer not found", 404);
    if (offer.status !== "pending") throw createHttpError("Offer is no longer available", 400);

    // Generate QR codes for pickup and delivery
    const pickupCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    const deliveryCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    // Update delivery with rider and codes
    await tx.delivery.update({
      where: { id: offer.deliveryId },
      data: {
        riderId: rId,
        pickupCode,
        deliveryCode,
        status: "assigned",
      },
    });

    // Mark offer as accepted
    return tx.deliveryOffer.update({
      where: { id: oId },
      data: { status: "accepted" },
    });
  });
};

export const verifyPickup = async (riderId, deliveryId, code) => {
  const rId = toIntId(riderId, "rider id");
  const dId = toIntId(deliveryId, "delivery id");

  const delivery = await prisma.delivery.findUnique({
    where: { id: dId },
  });

  if (!delivery || delivery.riderId !== rId) throw createHttpError("Delivery not found", 404);
  if (delivery.pickupCode !== code) throw createHttpError("Invalid pickup code", 400);

  return prisma.delivery.update({
    where: { id: dId },
    data: { status: "picked_up" },
  });
};

export const verifyDelivery = async (riderId, deliveryId, code) => {
  const rId = toIntId(riderId, "rider id");
  const dId = toIntId(deliveryId, "delivery id");

  const delivery = await prisma.delivery.findUnique({
    where: { id: dId },
    include: { order: true },
  });

  if (!delivery || delivery.riderId !== rId) throw createHttpError("Delivery not found", 404);
  if (delivery.deliveryCode !== code) throw createHttpError("Invalid delivery code", 400);

  return prisma.$transaction(async (tx) => {
    // 1. Update delivery status
    const updatedDelivery = await tx.delivery.update({
      where: { id: dId },
      data: { status: "delivered" },
    });

    // 2. Update order status
    await tx.order.update({
      where: { id: delivery.orderId },
      data: { currentStatus: "delivered" },
    });

    // 3. Credit rider wallet (using a flat fee for now as per MVP)
    const earningAmount = 500; // Example flat fee
    const wallet = await tx.wallet.upsert({
      where: { userId: rId },
      update: { balance: { increment: earningAmount } },
      create: { userId: rId, balance: earningAmount },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount: earningAmount,
        type: "credit",
        description: `Earning for delivery #${delivery.id}`,
      },
    });

    return updatedDelivery;
  });
};
