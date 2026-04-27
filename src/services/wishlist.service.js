import User from "../models/User.js";
import Product from "../models/Product.js";
import { createHttpError } from "../utils/httpError.js";

export const getWishlist = async (userId) => {
  const user = await User.findById(userId)
    .populate("wishlist", "productName price images store")
    .lean();

  const items = user?.wishlist || [];
  return { items, count: items.length };
};

export const addToWishlist = async (userId, productId) => {
  const product = await Product.findById(productId).select("_id");
  if (!product) throw createHttpError("Product not found", 404);

  await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: product._id } });
  return getWishlist(userId);
};

export const removeFromWishlist = async (userId, productId) => {
  await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } });
  return getWishlist(userId);
};

export const clearWishlist = async (userId) => {
  await User.findByIdAndUpdate(userId, { $set: { wishlist: [] } });
  return { items: [], count: 0 };
};
