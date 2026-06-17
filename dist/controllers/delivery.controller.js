import * as deliveryService from "../services/delivery.service.js";
export const updateDeliveryStatus = async (req, res, next) => {
    try {
        const delivery = await deliveryService.updateDeliveryStatus(req.params.id, req.body, req.user);
        res.json({ message: "Delivery status updated", delivery });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=delivery.controller.js.map