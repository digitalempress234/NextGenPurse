import * as wishlistService from "../services/wishlist.service.js";

export const getMyWishlist = async (req, res, next) => {
  try {
    const result = await wishlistService.getWishlist(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const addWishlistItem = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const result = await wishlistService.addToWishlist(req.user.id, productId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const removeWishlistItem = async (req, res, next) => {
  try {
    const result = await wishlistService.removeFromWishlist(req.user.id, req.params.productId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const clearMyWishlist = async (req, res, next) => {
  try {
    const result = await wishlistService.clearWishlist(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

