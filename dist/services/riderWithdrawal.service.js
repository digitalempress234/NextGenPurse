import prisma from "../config/prismaClient.js";
import { createHttpError } from "../utils/httpError.js";
import { toIntId } from "../utils/prismaHelpers.js";
export const initializeWithdrawal = async (userId, amount) => {
    const id = toIntId(userId, "user id");
    // 1. Check wallet balance
    const wallet = await prisma.wallet.findUnique({
        where: { userId: id },
    });
    if (!wallet || wallet.balance < amount) {
        throw createHttpError("Insufficient wallet balance", 400);
    }
    // 2. Get bank account
    const bankAccount = await prisma.riderBankAccount.findUnique({
        where: { userId: id },
    });
    if (!bankAccount) {
        throw createHttpError("Set up your bank account before withdrawal", 400);
    }
    // 3. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes
    // 4. Create pending withdrawal
    return prisma.withdrawal.create({
        data: {
            userId: id,
            amount,
            bankName: bankAccount.bankName,
            accountNumber: bankAccount.accountNumber,
            accountName: bankAccount.accountName,
            otp,
            otpExpires,
            status: "pending",
        },
    });
};
export const verifyAndCompleteWithdrawal = async (userId, withdrawalId, otp) => {
    const uId = toIntId(userId, "user id");
    const wId = toIntId(withdrawalId, "withdrawal id");
    return prisma.$transaction(async (tx) => {
        const withdrawal = await tx.withdrawal.findUnique({
            where: { id: wId },
        });
        if (!withdrawal || withdrawal.userId !== uId) {
            throw createHttpError("Withdrawal request not found", 404);
        }
        if (withdrawal.status !== "pending") {
            throw createHttpError("Withdrawal already processed", 400);
        }
        if (withdrawal.otp !== otp || new Date() > withdrawal.otpExpires) {
            throw createHttpError("Invalid or expired OTP", 400);
        }
        // 1. Debit wallet
        const wallet = await tx.wallet.update({
            where: { userId: uId },
            data: { balance: { decrement: withdrawal.amount } },
        });
        // 2. Create transaction record
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                amount: -withdrawal.amount,
                type: "debit",
                description: `Withdrawal to ${withdrawal.bankName} (${withdrawal.accountNumber})`,
            },
        });
        // 3. Complete withdrawal
        return tx.withdrawal.update({
            where: { id: wId },
            data: { status: "completed", otp: null, otpExpires: null },
        });
    });
};
export const getWithdrawalHistory = async (userId) => {
    const id = toIntId(userId, "user id");
    return prisma.withdrawal.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
    });
};
//# sourceMappingURL=riderWithdrawal.service.js.map