import prisma from "../config/prismaClient.js";
import notificationService from "./notification.service.js";
import { toIntId, withMongoId } from "../utils/prismaHelpers.js";
export const updateDeliveryStatus = async (deliveryId, updateData, user) => {
    const delivery = await prisma.delivery.findUnique({
        where: { id: toIntId(deliveryId, "delivery id") },
        include: { order: true, statusUpdates: true },
    });
    if (!delivery)
        throw new Error("Delivery not found");
    if (user.role !== "admin" && user.role !== "rider")
        throw new Error("Unauthorized");
    const { status, location, rider } = updateData;
    const update = {};
    if (rider) {
        update.riderName = rider.name ?? null;
        update.riderId = rider.riderId ?? null;
        update.riderEmail = rider.email ?? null;
        update.riderPhone = rider.phone ?? null;
    }
    const updated = await prisma.$transaction(async (tx) => {
        await tx.delivery.update({ where: { id: delivery.id }, data: update });
        await tx.deliveryStatusUpdate.create({
            data: { deliveryId: delivery.id, status, location: location ?? null },
        });
        if (status === "delivered") {
            await tx.order.update({ where: { id: delivery.orderId }, data: { currentStatus: "delivered" } });
        }
        return tx.delivery.findUnique({
            where: { id: delivery.id },
            include: { order: true, statusUpdates: true },
        });
    });
    if (rider)
        await notificationService.notifyDeliveryAssigned(delivery.order, delivery.order.userId, rider);
    if (status === "delivered")
        await notificationService.notifyDeliveryCompleted(delivery.order, delivery.order.userId);
    return withMongoId(updated);
};
//# sourceMappingURL=delivery.service.js.map