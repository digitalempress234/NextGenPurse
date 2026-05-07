import prisma from "../config/prismaClient.js";
import notificationService from "./notification.service.js";
import { toIntId, withMongoId } from "../utils/prismaHelpers.js";

export const createReview = async (userId, data) => {
  const user = toIntId(userId, "user id");
  const productId = toIntId(data.productId, "product id");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: { include: { vendor: true } } },
  });
  if (!product) throw new Error("Product not found");
  if (!product.storeId) throw new Error("Product store not found");

  const purchased = await prisma.order.findFirst({
    where: {
      userId: user,
      currentStatus: { not: "cancelled" },
      items: { some: { productId } },
    },
    select: { id: true },
  });

  const review = await prisma.review.create({
    data: {
      userId: user,
      productId,
      storeId: product.storeId,
      rating: Number(data.rating),
      comment: data.comment ?? null,
      isVerifiedPurchase: Boolean(purchased),
    },
  });

  if (product.store?.vendor) {
    await notificationService.notifyNewReview(product, product.store.vendor, review);
  }

  return withMongoId(review);
};

export const getReviews = async (query) => {
  const pageNumber = Math.max(1, parseInt(query.page, 10) || 1);
  const limitNumber = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const where = {};
  if (query.productId) where.productId = toIntId(query.productId, "product id");
  if (query.storeId) where.storeId = toIntId(query.storeId, "store id");

  const [total, items] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
    }),
  ]);

  return {
    items: withMongoId(items),
    meta: { total, pages: Math.ceil(total / limitNumber), page: pageNumber, limit: limitNumber },
  };
};
