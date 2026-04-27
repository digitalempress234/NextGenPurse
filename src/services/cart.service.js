import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { createHttpError } from "../utils/httpError.js";

const computeUnitPrice = (product) => {
    const base = Number(product.price || 0);
    if (product.discountType === "percentage" && product.discountPercentage > 0) {
        const discounted = base - (base * Number(product.discountPercentage) / 100);
        return Math.max(0, discounted);
    }
    if (product.discountType === "fixed" && product.discountPrice > 0) {
        return Math.max(0, Number(product.discountPrice));
    }
    return Math.max(0, base);
};

const recalcCart = (cart) => {
    let subtotal = 0;
    let totalItems = 0;

    cart.items.forEach((item) => {
        subtotal += item.totalPrice;
        totalItems += item.quantity;
    });

    cart.subtotal = subtotal;
    cart.totalItems = totalItems;
    cart.updatedAt = new Date();
};

export const getCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId })
        .populate("items.product", "productName price images discountPrice discountPercentage discountType")
        .populate("items.store", "storeName")
        .lean();

    return cart || { items: [], subtotal: 0, totalItems: 0, currency: "NGN" };
};

export const addItemToCart = async (userId, data) => {
    const { productId, quantity = 1 } = data;
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    const product = await Product.findById(productId).populate("store", "_id");
    if (!product) throw createHttpError("Product not found", 404);
    if (product.stock < qty) throw createHttpError("Insufficient stock", 409);

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }

    const existing = cart.items.find((i) => i.product.toString() === product._id.toString());
    const unitPrice = computeUnitPrice(product);

    if (existing) {
        const newQty = existing.quantity + qty;
        if (product.stock < newQty) throw createHttpError("Insufficient stock", 409);
        existing.quantity = newQty;
        existing.unitPrice = unitPrice;
        existing.totalPrice = unitPrice * newQty;
    } else {
        cart.items.push({
            product: product._id,
            store: product.store,
            quantity: qty,
            unitPrice,
            totalPrice: unitPrice * qty
        });
    }

    recalcCart(cart);
    await cart.save();

    return cart;
};

export const updateCartItem = async (userId, productId, data) => {
    const { quantity } = data;
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw createHttpError("Cart not found", 404);

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) throw createHttpError("Item not found", 404);

    const product = await Product.findById(productId);
    if (!product) throw createHttpError("Product not found", 404);
    if (product.stock < qty) throw createHttpError("Insufficient stock", 409);

    const unitPrice = computeUnitPrice(product);
    item.quantity = qty;
    item.unitPrice = unitPrice;
    item.totalPrice = unitPrice * qty;

    recalcCart(cart);
    await cart.save();

    return cart;
};

export const removeCartItem = async (userId, productId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw createHttpError("Cart not found", 404);

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);

    recalcCart(cart);
    await cart.save();

    return cart;
};

export const clearCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return { items: [], subtotal: 0, totalItems: 0, currency: "NGN" };

    cart.items = [];
    recalcCart(cart);
    await cart.save();

    return cart;
};
