import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../config/prismaClient.js";
async function seedAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const hashedPassword = await bcrypt.hash(password, 8);
    try {
        const existingAdmin = await prisma.user.findUnique({ where: { email } });
        if (existingAdmin) {
            console.log("Admin user already exists. Updating role to admin...");
            await prisma.user.update({
                where: { email },
                data: { role: "admin", isVerified: true },
            });
        }
        else {
            console.log("Creating new admin user...");
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: "admin",
                    firstName: "Super",
                    lastName: "Admin",
                    isVerified: true,
                    onboardingStep: "approved",
                },
            });
        }
        console.log("Admin seeded successfully.");
    }
    catch (error) {
        console.error("Error seeding admin:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
seedAdmin();
//# sourceMappingURL=seedAdmin.js.map