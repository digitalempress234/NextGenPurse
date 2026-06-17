import pkg from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
const { PrismaClient } = pkg;
const globalForPrisma = globalThis;
const adapter = globalForPrisma.__prismaAdapter ?? new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = globalForPrisma.__prismaClient ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__prismaClient = prisma;
    globalForPrisma.__prismaAdapter = adapter;
}
export default prisma;
//# sourceMappingURL=prismaClient.js.map