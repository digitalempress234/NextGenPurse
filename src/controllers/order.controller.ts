import * as orderService from "../services/order.service.js";

export const placeOrder = async (req, res, next) => {
    try {
        const orders = await orderService.placeOrderFromCart(req.user.id, req.body);
        res.status(201).json({ items: orders });
    } catch (error) {
        next(error);
    }
};

export const getVendorPurchaseHistory = async (req, res, next) => {
    try {
        const result = await orderService.getVendorOrders(req.user.id, req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getCustomerOrderHistory = async (req, res, next) => {
    try {
        const result = await orderService.getCustomerOrders(req.user.id, req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (req, res, next) => {
    try {
        const order = await orderService.cancelOrder(req.params.id, req.user.id);
        res.json({ message: "Order cancelled successfully", order });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(req.params.id, status, req.user);
        res.json({ message: "Order status updated", order });
    } catch (error) {
        next(error);
    }
};
