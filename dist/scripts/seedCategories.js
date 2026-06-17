import "dotenv/config";
import prisma from "../config/prismaClient.js";
import { connectDB, disconnectDB } from "../config/db.js";
import { categorySeed } from "../seeds/categories.seed.js";
const normalize = (value) => String(value || "").trim();
const upsertCategory = async ({ name, level, parentId = null }) => {
    const categoryName = normalize(name);
    if (!categoryName)
        throw new Error("Category name is required");
    const existing = await prisma.category.findFirst({
        where: { name: categoryName, level, parentId },
    });
    if (existing) {
        return prisma.category.update({
            where: { id: existing.id },
            data: { isActive: true },
        });
    }
    return prisma.category.create({
        data: { name: categoryName, level, parentId, isActive: true },
    });
};
const seedCategories = async () => {
    await connectDB();
    await prisma.category.updateMany({
        where: { name: "[object Object]" },
        data: { isActive: false },
    });
    if (!Array.isArray(categorySeed) || categorySeed.length === 0) {
        console.log("No categories found in src/seeds/categories.seed.js; nothing to seed.");
        return;
    }
    let parentCount = 0;
    let subCount = 0;
    for (const parentEntry of categorySeed) {
        const parentName = normalize(parentEntry?.name);
        if (!parentName)
            continue;
        const parentDoc = await upsertCategory({ name: parentName, level: 1 });
        parentCount += 1;
        const subs = Array.isArray(parentEntry?.subCategories) ? parentEntry.subCategories : [];
        for (const subName of subs) {
            const subCategoryName = normalize(subName);
            if (!subCategoryName)
                continue;
            await upsertCategory({ name: subCategoryName, level: 2, parentId: parentDoc.id });
            subCount += 1;
        }
    }
    console.log(`Seeded categories: ${parentCount} parent, ${subCount} sub-categories`);
};
try {
    await seedCategories();
}
catch (error) {
    console.error("Category seeding failed:", error?.message || error);
    process.exitCode = 1;
}
finally {
    await disconnectDB();
}
//# sourceMappingURL=seedCategories.js.map