import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Category from "../models/Category.js";
import { categorySeed } from "../seeds/categories.seed.js";

const normalize = (value) => String(value || "").trim();

const upsertCategory = async ({ name, level, parent = null }) => {
  const categoryName = normalize(name);
  if (!categoryName) {
    throw new Error("Category name is required");
  }

  const filter = {
    name: categoryName,
    level,
    parent: parent || null
  };

  const update = {
    $setOnInsert: {
      name: categoryName,
      level,
      parent: parent || null
    },
    $set: {
      isActive: true
    }
  };

  return Category.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true
  });
};

const seedCategories = async () => {
  await connectDB();

  // Common bad seed from clients accidentally sending objects (String(obj) => "[object Object]")
  await Category.updateMany(
    { name: "[object Object]" },
    { $set: { isActive: false } }
  );

  if (!Array.isArray(categorySeed) || categorySeed.length === 0) {
    console.log("No categories found in src/seeds/categories.seed.js; nothing to seed.");
    return;
  }

  let parentCount = 0;
  let subCount = 0;

  for (const parentEntry of categorySeed) {
    const parentName = normalize(parentEntry?.name);
    if (!parentName) continue;

    const parentDoc = await upsertCategory({
      name: parentName,
      level: 1,
      parent: null
    });
    parentCount += 1;

    const subs = Array.isArray(parentEntry?.subCategories)
      ? parentEntry.subCategories
      : [];

    for (const subName of subs) {
      const subCategoryName = normalize(subName);
      if (!subCategoryName) continue;

      await upsertCategory({
        name: subCategoryName,
        level: 2,
        parent: parentDoc._id
      });
      subCount += 1;
    }
  }

  console.log(`Seeded categories: ${parentCount} parent, ${subCount} sub-categories`);
};

try {
  await seedCategories();
} catch (error) {
  console.error("Category seeding failed:", error?.message || error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
