import prisma from "../config/prismaClient.js";
import { createHttpError } from "../utils/httpError.js";
import { toIntId, withMongoId } from "../utils/prismaHelpers.js";
const productSelect = {
    id: true,
    productName: true,
    price: true,
    images: true,
    storeId: true,
    store: { select: { id: true, storeName: true } },
};
export const getWishlist = async (userId) => {
    const items = await prisma.wishlistItem.findMany({
        where: { userId: toIntId(userId, "user id") },
        include: { product: { select: productSelect } },
        orderBy: { id: "desc" },
    });
    const products = items.map((item) => item.product);
    return { items: withMongoId(products), count: products.length };
};
export const addToWishlist = async (userId, productId) => {
    const user = toIntId(userId, "user id");
    const product = toIntId(productId, "product id");
    const productExists = await prisma.product.findUnique({ where: { id: product }, select: { id: true } });
    if (!productExists)
        throw createHttpError("Product not found", 404);
    await prisma.wishlistItem.upsert({
        where: { userId_productId: { userId: user, productId: product } },
        create: { userId: user, productId: product },
        update: {},
    }).catch(async (error) => {
        if (error.code === "P2002")
            return null;
        throw error;
    });
    return getWishlist(user);
};
export const removeFromWishlist = async (userId, productId) => {
    await prisma.wishlistItem.deleteMany({
        where: { userId: toIntId(userId, "user id"), productId: toIntId(productId, "product id") },
    });
    return getWishlist(userId);
};
export const clearWishlist = async (userId) => {
    await prisma.wishlistItem.deleteMany({ where: { userId: toIntId(userId, "user id") } });
    return { items: [], count: 0 };
};
//# sourceMappingURL=wishlist.service.js.map