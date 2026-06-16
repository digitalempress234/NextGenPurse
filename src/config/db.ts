import prisma from "./prismaClient.js";

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("MySQL Connected via Prisma");
  } catch (err) {
    console.error("MySQL connection error (Prisma):", err?.message || err);
    throw err;
  }
};

export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
  } catch (err) {
    console.error("Error disconnecting Prisma:", err?.message || err);
  }
};
