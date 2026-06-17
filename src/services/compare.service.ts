import prisma from "../config/prismaClient.js";
import { createHttpError } from "../utils/httpError.js";
import { toIntId } from "../utils/prismaHelpers.js";

const MAX_COMPARE_ITEMS = 20;

export const getCompareList = async (userId) => {
  const id = toIntId(userId, "user id");
  
  let compareList = await prisma.compareList.findUnique({
    where: { userId: id },
    include: {
      items: {
        include: {
          product: {
            include: {
              store: true,
              category: true,
            },
          },
        },
      },
    },
  });

  if (!compareList) {
    compareList = await prisma.compareList.create({
      data: { userId: id },
      include: { items: { include: { product: { include: { store: true, category: true } } } } },
    });
  }

  return compareList;
};

export const addItemToCompare = async (userId, productId) => {
  const uId = toIntId(userId, "user id");
  const pId = toIntId(productId, "product id");

  // 1. Verify product exists
  const product = await prisma.product.findUnique({ where: { id: pId } });
  if (!product) throw createHttpError("Product not found", 404);

  // 2. Get or create compare list
  const compareList = await getCompareList(uId);

  // 3. Check if already in list
  const existing = compareList.items.find((item) => item.productId === pId);
  if (existing) return compareList;

  // 4. Check limit
  if (compareList.items.length >= MAX_COMPARE_ITEMS) {
    throw createHttpError(`Comparison list cannot exceed ${MAX_COMPARE_ITEMS} items`, 400);
  }

  // 5. Add item
  await prisma.compareItem.create({
    data: {
      compareListId: compareList.id,
      productId: pId,
    },
  });

  return getCompareList(uId);
};

export const removeItemFromCompare = async (userId, productId) => {
  const uId = toIntId(userId, "user id");
  const pId = toIntId(productId, "product id");

  const compareList = await prisma.compareList.findUnique({
    where: { userId: uId },
  });

  if (!compareList) throw createHttpError("Comparison list not found", 404);

  await prisma.compareItem.delete({
    where: {
      compareListId_productId: {
        compareListId: compareList.id,
        productId: pId,
      },
    },
  });

  return getCompareList(uId);
};

export const clearCompareList = async (userId) => {
  const uId = toIntId(userId, "user id");

  const compareList = await prisma.compareList.findUnique({
    where: { userId: uId },
  });

  if (!compareList) return { items: [] };

  await prisma.compareItem.deleteMany({
    where: { compareListId: compareList.id },
  });

  return { id: compareList.id, userId: uId, items: [] };
};
