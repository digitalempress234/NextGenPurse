import * as riderLogisticsService from "../services/riderLogistics.service.js";

export const getOffers = async (req, res, next) => {
  try {
    const offers = await riderLogisticsService.getAvailableOffers(req.user.id);
    res.json({ status: "success", data: offers });
  } catch (error) {
    next(error);
  }
};

export const acceptDelivery = async (req, res, next) => {
  try {
    const offer = await riderLogisticsService.acceptOffer(req.user.id, req.params.offerId);
    res.json({ status: "success", message: "Delivery accepted", data: offer });
  } catch (error) {
    next(error);
  }
};

export const pickupVerification = async (req, res, next) => {
  try {
    const { code } = req.body;
    const delivery = await riderLogisticsService.verifyPickup(req.user.id, req.params.id, code);
    res.json({ status: "success", message: "Pickup verified", data: delivery });
  } catch (error) {
    next(error);
  }
};

export const deliveryVerification = async (req, res, next) => {
  try {
    const { code } = req.body;
    const delivery = await riderLogisticsService.verifyDelivery(req.user.id, req.params.id, code);
    res.json({ status: "success", message: "Delivery verified and completed", data: delivery });
  } catch (error) {
    next(error);
  }
};
