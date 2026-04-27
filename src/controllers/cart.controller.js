import * as cartService from "../services/cart.service.js";

export const getMyCart = async (req, res, next) => {
    try {
        const cart = await cartService.getCart(req.user.id);
        res.json(cart);
    } catch (error) {
        next(error);
    }
};

export const addToCart = async (req, res, next) => {
    try {
        const cart = await cartService.addItemToCart(req.user.id, req.body);
        res.json(cart);
    } catch (error) {
        next(error);
    }
};

export const updateCartItem = async (req, res, next) => {
    try {
        const cart = await cartService.updateCartItem(
            req.user.id,
            req.params.productId,
            req.body
        );
        res.json(cart);
    } catch (error) {
        next(error);
    }
};

export const removeCartItem = async (req, res, next) => {
    try {
        const cart = await cartService.removeCartItem(
            req.user.id,
            req.params.productId
        );
        res.json(cart);
    } catch (error) {
        next(error);
    }
};

export const clearMyCart = async (req, res, next) => {
    try {
        const cart = await cartService.clearCart(req.user.id);
        res.json(cart);
    } catch (error) {
        next(error);
    }
};
