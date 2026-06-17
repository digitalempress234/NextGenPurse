import prisma from "../config/prismaClient.js";
import { createHttpError } from "../utils/httpError.js";
import { toIntId, withMongoId } from "../utils/prismaHelpers.js";

type ProductQuery = Record<string, string | undefined>;

type ProductPayloadInput = Record<string, unknown> & {
  store?: unknown;
  storeId?: unknown;
  category?: unknown;
  categoryId?: unknown;
  subCategory?: unknown;
  subCategoryId?: unknown;
};

const productInclude = {
  store: { select: { id: true, storeName: true } },
  category: { select: { id: true, name: true, parentId: true } },
  subCategory: { select: { id: true, name: true, parentId: true } },
};

const productPayload = (product: ProductPayloadInput | null) => {
  if (!product) return product;

  return withMongoId({
    ...product,
    store: product.store ?? product.storeId,
    category: product.category ?? product.categoryId,
    subCategory: product.subCategory ?? product.subCategoryId,
  });
};

const escapeLike = (value: unknown) => String(value).trim();

const toOptionalNumber = (value: string | undefined): number | undefined => {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const resolveCategoryIds = async (
  { category, subCategory }: { category?: unknown; subCategory?: unknown },
  existingProduct: { categoryId?: number | null; subCategoryId?: number | null } | null = null
) => {
  const categoryProvided = typeof category !== "undefined";
  const subCategoryProvided = typeof subCategory !== "undefined";

  let categoryId = existingProduct?.categoryId ?? null;
  let subCategoryId = existingProduct?.subCategoryId ?? null;

  if (categoryProvided) {
    if (!category) throw createHttpError("Category is required", 400);

    const categoryWhere = Number.isInteger(Number(category))
      ? { id: toIntId(category, "category id") }
      : { name: { equals: escapeLike(category) } };

    const categoryDoc = await prisma.category.findFirst({
      where: { ...categoryWhere, level: 1, isActive: true },
    });

    if (!categoryDoc) throw createHttpError("Category not found", 404);
    categoryId = categoryDoc.id;
  }

  if (subCategoryProvided) {
    if (!subCategory) {
      subCategoryId = null;
    } else {
      const subCategoryWhere = Number.isInteger(Number(subCategory))
        ? { id: toIntId(subCategory, "sub-category id") }
        : { name: { equals: escapeLike(subCategory) } };

      const subCategoryDoc = await prisma.category.findFirst({
        where: { ...subCategoryWhere, level: 2, isActive: true },
      });

      if (!subCategoryDoc) throw createHttpError("Sub-category not found", 404);
      subCategoryId = subCategoryDoc.id;

      if (!categoryProvided && !categoryId && subCategoryDoc.parentId) categoryId = subCategoryDoc.parentId;
      if (categoryId && subCategoryDoc.parentId && subCategoryDoc.parentId !== categoryId) {
        throw createHttpError("Sub-category does not belong to the category", 400);
      }
    }
  }

  if (categoryProvided && !categoryId) throw createHttpError("Category is required", 400);

  if (categoryProvided && !subCategoryProvided && subCategoryId) {
    const subCategoryDoc = await prisma.category.findUnique({ where: { id: subCategoryId } });
    if (subCategoryDoc?.parentId && subCategoryDoc.parentId !== categoryId) subCategoryId = null;
  }

  return {
    categoryId,
    subCategoryId,
    shouldSetCategory: categoryProvided || subCategoryProvided,
    shouldSetSubCategory: subCategoryProvided || categoryProvided,
  };
};

const buildProductWhere = async (
  { search, category, subCategory, minPrice, maxPrice }: ProductQuery,
  storeId: number | null = null
) => {
  const where: Record<string, unknown> = {};
  if (storeId) where.storeId = storeId;

  if (search) {
    where.OR = [
      { productName: { contains: String(search) } },
      { description: { contains: String(search) } },
    ];
  }

  if (category) {
    const categoryDoc = await prisma.category.findFirst({
      where: { name: { equals: String(category).trim() }, level: 1, isActive: true },
      select: { id: true },
    });
    if (!categoryDoc) return null;
    where.categoryId = categoryDoc.id;
  }

  if (subCategory) {
    const subCategoryDoc = await prisma.category.findFirst({
      where: { name: { equals: String(subCategory).trim() }, level: 2, isActive: true },
      select: { id: true },
    });
    if (!subCategoryDoc) return null;
    where.subCategoryId = subCategoryDoc.id;
  }

  if (minPrice || maxPrice) {
    const price: Record<string, number> = {};
    const parsedMin = toOptionalNumber(minPrice);
    const parsedMax = toOptionalNumber(maxPrice);
    if (parsedMin !== undefined) price.gte = parsedMin;
    if (parsedMax !== undefined) price.lte = parsedMax;
    where.price = price;
  }

  return where;
};

const emptyPage = (page: number, limit: number) => ({
  items: [],
  meta: { total: 0, pages: 0, page, limit },
});

export const createProduct = async (userId: number | string, data: Record<string, unknown>) => {
  const store = await prisma.store.findUnique({ where: { vendorId: toIntId(userId, "user id") } });
  if (!store) throw createHttpError("Store not found", 404);

  const { categoryId, subCategoryId } = await resolveCategoryIds({
    category: data.category,
    subCategory: data.subCategory,
  });

  const product = await prisma.product.create({
    data: {
      productName: String(data.productName),
      description: String(data.description),
      price: Number(data.price),
      discountPrice: Number(data.discountPrice || 0),
      discountPercentage: Number(data.discountPercentage || 0),
      discountType: String(data.discountType || "fixed"),
      categoryId,
      subCategoryId: subCategoryId || null,
      stock: Number(data.stock || 0),
      expiryDate: data.expiryDate ? new Date(String(data.expiryDate)) : null,
      images: Array.isArray(data.images) ? data.images : [],
      isFeatured: Boolean(data.isFeatured),
      storeId: store.id,
    },
    include: productInclude,
  });

  return productPayload(product);
};

export const getProducts = async (query: ProductQuery) => {
  const pageNumber = Math.max(1, Number.parseInt(query.page || "1", 10) || 1);
  const limitNumber = Math.min(100, Math.max(1, Number.parseInt(query.limit || "10", 10) || 10));
  const where = await buildProductWhere(query);
  if (!where) return emptyPage(pageNumber, limitNumber);

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { store: { select: { id: true, storeName: true } } },
      orderBy: { createdAt: "desc" },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
    }),
  ]);

  return {
    items: products.map(productPayload),
    meta: { total, pages: Math.ceil(total / limitNumber), page: pageNumber, limit: limitNumber },
  };
};

export const getProductById = async (productId: number | string) => {
  const product = await prisma.product.findUnique({
    where: { id: toIntId(productId, "product id") },
    include: productInclude,
  });

  if (!product) throw createHttpError("Product not found", 404);
  return productPayload(product);
};

export const getVendorProducts = async (userId: number | string, query: ProductQuery) => {
  const store = await prisma.store.findUnique({ where: { vendorId: toIntId(userId, "user id") } });
  if (!store) return emptyPage(1, 0);

  const pageNumber = Math.max(1, Number.parseInt(query.page || "1", 10) || 1);
  const limitNumber = Math.min(100, Math.max(1, Number.parseInt(query.limit || "10", 10) || 10));
  const where = await buildProductWhere(query, store.id);
  if (!where) return emptyPage(pageNumber, limitNumber);

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: "desc" },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
    }),
  ]);

  return {
    items: products.map(productPayload),
    meta: { total, pages: Math.ceil(total / limitNumber), page: pageNumber, limit: limitNumber },
  };
};

export const updateProduct = async (userId: number | string, productId: number | string, data: Record<string, unknown>) => {
  const store = await prisma.store.findUnique({ where: { vendorId: toIntId(userId, "user id") } });
  if (!store) throw createHttpError("Store not found", 404);

  const id = toIntId(productId, "product id");
  const existing = await prisma.product.findFirst({ where: { id, storeId: store.id } });
  if (!existing) throw createHttpError("Product not found", 404);

  const { categoryId, subCategoryId, shouldSetCategory, shouldSetSubCategory } = await resolveCategoryIds(
    { category: data.category, subCategory: data.subCategory },
    existing
  );

  const updateData: Record<string, unknown> = {};
  for (const key of ["productName", "description", "discountType"] as const) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }
  for (const key of ["price", "discountPrice", "discountPercentage", "stock"] as const) {
    if (data[key] !== undefined) updateData[key] = Number(data[key]);
  }
  if (data.images !== undefined) updateData.images = Array.isArray(data.images) ? data.images : [];
  if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate ? new Date(String(data.expiryDate)) : null;
  if (data.isFeatured !== undefined) updateData.isFeatured = Boolean(data.isFeatured);
  if (shouldSetCategory) updateData.categoryId = categoryId;
  if (shouldSetSubCategory) updateData.subCategoryId = subCategoryId || null;

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateData,
    include: productInclude,
  });

  return productPayload(updatedProduct);
};

export const deleteProduct = async (userId: number | string, productId: number | string) => {
  const store = await prisma.store.findUnique({ where: { vendorId: toIntId(userId, "user id") } });
  if (!store) throw createHttpError("Store not found", 404);

  const product = await prisma.product.findFirst({
    where: { id: toIntId(productId, "product id"), storeId: store.id },
  });
  if (!product) throw createHttpError("Product not found", 404);

  await prisma.product.delete({ where: { id: product.id } });
  return true;
};
