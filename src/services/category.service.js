import mongoose from "mongoose";
import Category from "../models/Category.js";
import { createHttpError } from "../utils/httpError.js";

const parseBoolean = (value, defaultValue = true) => {
  if (typeof value === "undefined") return defaultValue;
  if (typeof value === "boolean") return value;
  const v = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(v)) return true;
  if (["false", "0", "no", "n"].includes(v)) return false;
  return defaultValue;
};

export const listCategories = async (query = {}) => {
  const { level, parent, activeOnly } = query;

  const filter = {};

  if (typeof level !== "undefined") {
    const parsed = Number(level);
    if (![1, 2].includes(parsed)) {
      throw createHttpError("Invalid level. Expected 1 or 2", 400);
    }
    filter.level = parsed;
  }

  if (typeof parent !== "undefined") {
    if (parent === null || String(parent).trim() === "") {
      filter.parent = null;
    } else {
      const parentId = String(parent).trim();
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        throw createHttpError("Invalid parent category id", 400);
      }
      filter.parent = parentId;
    }
  }

  if (parseBoolean(activeOnly, true)) {
    filter.isActive = true;
  }

  const items = await Category.find(filter)
    .select("_id name parent level isActive")
    .sort({ name: 1 })
    .lean();

  return items;
};

export const getCategoryTree = async (query = {}) => {
  const { activeOnly } = query;
  const filter = {};

  if (parseBoolean(activeOnly, true)) {
    filter.isActive = true;
  }

  const categories = await Category.find(filter)
    .select("_id name parent level")
    .sort({ level: 1, name: 1 })
    .lean();

  const parents = [];
  const byId = new Map();

  for (const category of categories) {
    byId.set(String(category._id), { ...category, subCategories: [] });
  }

  for (const category of categories) {
    const id = String(category._id);
    const node = byId.get(id);

    if (!category.parent) {
      parents.push(node);
      continue;
    }

    const parentNode = byId.get(String(category.parent));
    if (parentNode) {
      parentNode.subCategories.push(node);
    }
  }

  return parents;
};
