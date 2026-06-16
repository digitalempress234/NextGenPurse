import prisma from "../config/prismaClient.js";
import { createHttpError } from "../utils/httpError.js";
import { toIntId, withMongoId } from "../utils/prismaHelpers.js";
const cartInclude = {
    items: {
        include: {
            product: {
                select: {
                    id: true,
                    productName: true,
                    price: true,
                    images: true,
                    discountPrice: true,
                    discountPercentage: true,
                    discountType: true,
                },
            },
            store: { select: { id: true, storeName: true } },
        },
        orderBy: { id: "asc" },
    },
};
const computeUnitPrice = (product) => {
    const base = Number(product.price || 0);
    if (product.discountType === "percentage" && product.discountPercentage > 0) {
        return Math.max(0, base - (base * Number(product.discountPercentage)) / 100);
    }
    if (product.discountType === "fixed" && product.discountPrice > 0) {
        return Math.max(0, Number(product.discountPrice));
    }
    return Math.max(0, base);
};
const recalcCartData = (items) => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    return { subtotal, totalItems };
};
const formatCart = (cart) => withMongoId(cart || { items: [], subtotal: 0, totalItems: 0, currency: "NGN" });
export const getCart = async (userId) => {
    const cart = await prisma.cart.findUnique({
        where: { userId: toIntId(userId, "user id") },
        include: cartInclude,
    });
    return formatCart(cart);
};
export const addItemToCart = async (userId, data) => {
    const user = toIntId(userId, "user id");
    const productId = toIntId(data.productId, "product id");
    const qty = Math.max(1, parseInt(data.quantity, 10) || 1);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product)
        throw createHttpError("Product not found", 404);
    if (product.stock < qty)
        throw createHttpError("Insufficient stock", 409);
    if (!product.storeId)
        throw createHttpError("Product is not attached to a store", 409);
    const cart = await prisma.cart.upsert({
        where: { userId: user },
        create: { userId: user },
        update: {},
        include: { items: true },
    });
    const existing = cart.items.find((item) => item.productId === productId);
    const unitPrice = computeUnitPrice(product);
    if (existing) {
        const newQty = existing.quantity + qty;
        if (product.stock < newQty)
            throw createHttpError("Insufficient stock", 409);
        await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: newQty, unitPrice, totalPrice: unitPrice * newQty },
        });
    }
    else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                storeId: product.storeId,
                quantity: qty,
                unitPrice,
                totalPrice: unitPrice * qty,
            },
        });
    }
    const items = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
    await prisma.cart.update({ where: { id: cart.id }, data: recalcCartData(items) });
    return getCart(user);
};
export const updateCartItem = async (userId, productId, data) => {
    const user = toIntId(userId, "user id");
    const product = await prisma.product.findUnique({ where: { id: toIntId(productId, "product id") } });
    if (!product)
        throw createHttpError("Product not found", 404);
    const cart = await prisma.cart.findUnique({ where: { userId: user }, include: { items: true } });
    if (!cart)
        throw createHttpError("Cart not found", 404);
    const item = cart.items.find((entry) => entry.productId === product.id);
    if (!item)
        throw createHttpError("Item not found", 404);
    const qty = Math.max(1, parseInt(data.quantity, 10) || 1);
    if (product.stock < qty)
        throw createHttpError("Insufficient stock", 409);
    const unitPrice = computeUnitPrice(product);
    await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: qty, unitPrice, totalPrice: unitPrice * qty },
    });
    const items = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
    await prisma.cart.update({ where: { id: cart.id }, data: recalcCartData(items) });
    return getCart(user);
};
export const removeCartItem = async (userId, productId) => {
    const user = toIntId(userId, "user id");
    const cart = await prisma.cart.findUnique({ where: { userId: user }, include: { items: true } });
    if (!cart)
        throw createHttpError("Cart not found", 404);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId: toIntId(productId, "product id") } });
    const items = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
    await prisma.cart.update({ where: { id: cart.id }, data: recalcCartData(items) });
    return getCart(user);
};
export const clearCart = async (userId) => {
    const user = toIntId(userId, "user id");
    const cart = await prisma.cart.findUnique({ where: { userId: user } });
    if (!cart)
        return { items: [], subtotal: 0, totalItems: 0, currency: "NGN" };
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({ where: { id: cart.id }, data: { subtotal: 0, totalItems: 0 } });
    return getCart(user);
};
//# sourceMappingURL=cart.service.js.map