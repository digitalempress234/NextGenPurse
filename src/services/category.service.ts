import prisma from "../config/prismaClient.js";
import { createHttpError } from "../utils/httpError.js";
import { toIntId, withMongoId } from "../utils/prismaHelpers.js";

const parseBoolean = (value: any, defaultValue = true) => {
  if (typeof value === "undefined") return defaultValue;
  if (typeof value === "boolean") return value;
  const v = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(v)) return true;
  if (["false", "0", "no", "n"].includes(v)) return false;
  return defaultValue;
};

export const listCategories = async (query: any = {}) => {
  const { level, parent, activeOnly } = query;
  const where: any = {};

  if (typeof level !== "undefined") {
    const parsed = Number(level);
    if (![1, 2].includes(parsed)) throw createHttpError("Invalid level. Expected 1 or 2", 400);
    where.level = parsed;
  }

  if (typeof parent !== "undefined") {
    where.parentId = parent === null || String(parent).trim() === "" ? null : toIntId(parent, "parent category id");
  }

  if (parseBoolean(activeOnly, true)) where.isActive = true;

  const items = await prisma.category.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return withMongoId(items.map((item) => ({ ...item, parent: item.parentId })));
};

export const getCategoryTree = async (query: any = {}) => {
  const where: any = {};
  if (parseBoolean(query.activeOnly, true)) where.isActive = true;

  const categories = await prisma.category.findMany({
    where,
    orderBy: [{ level: "asc" }, { name: "asc" }],
  });

  const parents = [];
  const byId = new Map();

  for (const category of categories) {
    byId.set(category.id, withMongoId({ ...category, parent: category.parentId, subCategories: [] }));
  }

  for (const category of categories) {
    const node = byId.get(category.id);
    if (!category.parentId) {
      parents.push(node);
      continue;
    }

    const parentNode = byId.get(category.parentId);
    if (parentNode) parentNode.subCategories.push(node);
  }

  return parents;
};
