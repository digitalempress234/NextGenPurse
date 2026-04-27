import Product from "../models/Product.js";
import Store from "../models/Store.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";
import { createHttpError } from "../utils/httpError.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isValidObjectId = (value) => {
    const v = String(value || "").trim();
    return v && mongoose.Types.ObjectId.isValid(v);
};

const resolveCategoryIds = async ({ category, subCategory }, existingProduct = null) => {
    const categoryProvided = typeof category !== "undefined";
    const subCategoryProvided = typeof subCategory !== "undefined";

    let categoryId = existingProduct ? existingProduct.category : null;
    let subCategoryId = existingProduct ? existingProduct.subCategory : null;

    if (categoryProvided) {
        if (!category) {
            throw createHttpError("Category is required", 400);
        }

        if (typeof category === "object" && !isValidObjectId(category)) {
            throw createHttpError("Invalid category. Use a category id from /api/categories", 400);
        }

        const categoryFilter = isValidObjectId(category)
            ? { _id: String(category).trim() }
            : { name: { $regex: new RegExp(`^${escapeRegex(String(category).trim())}$`, "i") } };

        const categoryDoc = await Category.findOne({
            ...categoryFilter,
            level: 1,
            isActive: true
        }).select("_id");

        if (!categoryDoc) throw createHttpError("Category not found", 404);
        categoryId = categoryDoc._id;
    }

    if (subCategoryProvided) {
        if (!subCategory) {
            subCategoryId = null;
        } else {
            if (typeof subCategory === "object" && !isValidObjectId(subCategory)) {
                throw createHttpError("Invalid sub-category. Use a sub-category id from /api/categories", 400);
            }

            const subCategoryFilter = isValidObjectId(subCategory)
                ? { _id: String(subCategory).trim() }
                : { name: { $regex: new RegExp(`^${escapeRegex(String(subCategory).trim())}$`, "i") } };

            const subCategoryDoc = await Category.findOne({
                ...subCategoryFilter,
                level: 2,
                isActive: true
            }).select("_id parent");

            if (!subCategoryDoc) throw createHttpError("Sub-category not found", 404);
            subCategoryId = subCategoryDoc._id;

            if (!categoryProvided && !categoryId && subCategoryDoc.parent) {
                categoryId = subCategoryDoc.parent;
            }

            if (categoryId && subCategoryDoc.parent && subCategoryDoc.parent.toString() !== categoryId.toString()) {
                throw createHttpError("Sub-category does not belong to the category", 400);
            }
        }
    }

    if (categoryProvided && !categoryId) {
        throw createHttpError("Category is required", 400);
    }

    if (categoryProvided && !subCategoryProvided && subCategoryId) {
        const subCategoryDoc = await Category.findById(subCategoryId).select("_id parent");
        if (subCategoryDoc && subCategoryDoc.parent && subCategoryDoc.parent.toString() !== categoryId.toString()) {
            subCategoryId = null;
        }
    }

    return {
        categoryId,
        subCategoryId,
        shouldSetCategory: categoryProvided || subCategoryProvided,
        shouldSetSubCategory: subCategoryProvided || categoryProvided
    };
};

export const createProduct = async (userId, data) => {
    try {
        const store = await Store.findOne({ vendor: userId });
        if (!store) throw createHttpError("Store not found", 404);

        const { categoryId, subCategoryId } = await resolveCategoryIds(
            { category: data.category, subCategory: data.subCategory }
        );

        const product = await Product.create({
            ...data,
            category: categoryId,
            subCategory: subCategoryId || null,
            store: store._id
        });

        return product;

    } catch (error) {
        throw error;
    }
};

export const getProducts = async (query) => {
    try {
        const {
            search,
            category,
            subCategory,
            minPrice,
            maxPrice,
            page = 1,
            limit = 10
        } = query;

        const filter = {};
        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

        // Search
        if (search) {
            filter.$text = { $search: search };
        }

        // Category
        if (category) {
            const categoryDoc = await Category.findOne({
                name: { $regex: new RegExp(`^${escapeRegex(category)}$`, "i") },
                level: 1,
                isActive: true
            }).select("_id");

            if (!categoryDoc) {
                return {
                    items: [],
                    meta: {
                        total: 0,
                        pages: 0,
                        page: pageNumber,
                        limit: limitNumber
                    }
                };
            }

            filter.category = categoryDoc._id;
        }

        if (subCategory) {
            const subCategoryDoc = await Category.findOne({
                name: { $regex: new RegExp(`^${escapeRegex(subCategory)}$`, "i") },
                level: 2,
                isActive: true
            }).select("_id");

            if (!subCategoryDoc) {
                return {
                    items: [],
                    meta: {
                        total: 0,
                        pages: 0,
                        page: pageNumber,
                        limit: limitNumber
                    }
                };
            }

            filter.subCategory = subCategoryDoc._id;
        }

        // Price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const total = await Product.countDocuments(filter);

        const products = await Product.find(filter)
        .populate("store", "storeName")
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber)
        .sort({ createdAt: -1 })
        .lean();

        const pages = limitNumber > 0 ? Math.ceil(total / limitNumber) : 0;

        return {
            items: products,
            meta: {
                total,
                pages,
                page: pageNumber,
                limit: limitNumber
            }
        };

    } catch (error) {
        throw error;
    }
};

export const getProductById = async (productId) => {
    try {
        const rawId = String(productId || "").trim();
        const cleanedId = rawId.startsWith(":") ? rawId.slice(1).trim() : rawId;

        if (!mongoose.Types.ObjectId.isValid(cleanedId)) {
            const err = new Error("Invalid product id");
            err.statusCode = 400;
            throw err;
        }

        const product = await Product.findById(cleanedId)
        .populate("store", "storeName")
        .populate("category", "name parent")
        .populate("subCategory", "name parent")
        .lean();

        if (!product) {
            const err = new Error("Product not found");
            err.statusCode = 404;
            throw err;
        }

        return product;
    } catch (error) {
        throw error;
    }
};

export const getVendorProducts = async (userId, query) => {
    try {
        const store = await Store.findOne({ vendor: userId });
        if (!store) {
            return {
                items: [],
                meta: {
                    total: 0,
                    pages: 0,
                    page: 1,
                    limit: 0
                }
            };
        }

        const {
            search,
            category,
            subCategory,
            minPrice,
            maxPrice,
            page = 1,
            limit = 10
        } = query;

        const filter = { store: store._id };
        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

        if (search) {
            filter.$text = { $search: search };
        }

        if (category) {
            const categoryDoc = await Category.findOne({
                name: { $regex: new RegExp(`^${escapeRegex(category)}$`, "i") },
                level: 1,
                isActive: true
            }).select("_id");

            if (!categoryDoc) {
                return {
                    items: [],
                    meta: {
                        total: 0,
                        pages: 0,
                        page: pageNumber,
                        limit: limitNumber
                    }
                };
            }
            filter.category = categoryDoc._id;
        }

        if (subCategory) {
            const subCategoryDoc = await Category.findOne({
                name: { $regex: new RegExp(`^${escapeRegex(subCategory)}$`, "i") },
                level: 2,
                isActive: true
            }).select("_id");

            if (!subCategoryDoc) {
                return {
                    items: [],
                    meta: {
                        total: 0,
                        pages: 0,
                        page: pageNumber,
                        limit: limitNumber
                    }
                };
            }
            filter.subCategory = subCategoryDoc._id;
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const total = await Product.countDocuments(filter);

        const products = await Product.find(filter)
        .populate("store", "storeName")
        .populate("category", "name parent")
        .populate("subCategory", "name parent")
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber)
        .sort({ createdAt: -1 })
        .lean();

        const pages = limitNumber > 0 ? Math.ceil(total / limitNumber) : 0;

        return {
            items: products,
            meta: {
                total,
                pages,
                page: pageNumber,
                limit: limitNumber
            }
        };
    } catch (error) {
        throw error;
    }
};

export const updateProduct = async (userId, productId, data) => {
    try {
        const store = await Store.findOne({ vendor: userId });
        if (!store) throw createHttpError("Store not found", 404);

        const existing = await Product.findOne({ _id: productId, store: store._id });
        if (!existing) {
            const err = new Error("Product not found");
            err.statusCode = 404;
            throw err;
        }

        const { categoryId, subCategoryId, shouldSetCategory, shouldSetSubCategory } =
            await resolveCategoryIds(
                { category: data.category, subCategory: data.subCategory },
                existing
            );

        const updateData = { ...data };
        delete updateData.category;
        delete updateData.subCategory;

        if (shouldSetCategory) {
            updateData.category = categoryId;
        }

        if (shouldSetSubCategory) {
            updateData.subCategory = subCategoryId || null;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            existing._id,
            updateData,
            { new: true, runValidators: true }
        );

        return updatedProduct;
    } catch (error) {
        throw error;
    }
};

export const deleteProduct = async (userId, productId) => {
    try {
        const store = await Store.findOne({ vendor: userId });
        if (!store) throw createHttpError("Store not found", 404);

        const deleted = await Product.findOneAndDelete({ _id: productId, store: store._id });
        if (!deleted) {
            const err = new Error("Product not found");
            err.statusCode = 404;
            throw err;
        }

        return true;
    } catch (error) {
        throw error;
    }
};
