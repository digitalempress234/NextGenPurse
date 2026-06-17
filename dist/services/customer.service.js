import prisma from "../config/prismaClient.js";
import { registerUser } from "./auth.service.js";
import { toIntId, userPublicSelect, withMongoId } from "../utils/prismaHelpers.js";
const includeAddresses = {
    addresses: { orderBy: { id: "asc" } },
};
export const registerCustomer = async (data) => {
    const { firstName, lastName, email, password } = data;
    return registerUser({
        firstName,
        lastName,
        email,
        password,
        role: "customer",
    });
};
export const getCustomerProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: toIntId(userId, "user id") },
        select: { ...userPublicSelect, addresses: true },
    });
    if (!user)
        throw new Error("User not found");
    return withMongoId(user);
};
export const updateCustomerProfile = async (userId, data) => {
    const allowedFields = ["firstName", "lastName", "phoneNumber", "avatar"];
    const updates = {};
    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            updates[key] = data[key] === null ? null : String(data[key]);
        }
    }
    const user = await prisma.user.update({
        where: { id: toIntId(userId, "user id") },
        data: updates,
        select: { ...userPublicSelect, addresses: true },
    });
    return withMongoId(user);
};
export const addCustomerAddress = async (userId, data) => {
    if (!data || !data.address)
        throw new Error("Address is required");
    const id = toIntId(userId, "user id");
    const user = await prisma.$transaction(async (tx) => {
        const existing = await tx.user.findUnique({ where: { id } });
        if (!existing)
            throw new Error("User not found");
        if (data.isDefault) {
            await tx.address.updateMany({ where: { userId: id }, data: { isDefault: false } });
        }
        await tx.address.create({
            data: {
                userId: id,
                label: data.label ?? null,
                state: data.state ?? null,
                city: data.city ?? null,
                address: data.address,
                isDefault: Boolean(data.isDefault),
            },
        });
        return tx.user.findUnique({ where: { id }, select: { ...userPublicSelect, ...includeAddresses } });
    });
    return withMongoId(user);
};
export const updateCustomerAddress = async (userId, addressId, data) => {
    const id = toIntId(userId, "user id");
    const addrId = toIntId(addressId, "address id");
    const user = await prisma.$transaction(async (tx) => {
        const address = await tx.address.findFirst({ where: { id: addrId, userId: id } });
        if (!address)
            throw new Error("Address not found");
        if (data.isDefault) {
            await tx.address.updateMany({
                where: { userId: id, NOT: { id: addrId } },
                data: { isDefault: false },
            });
        }
        const updateData = {};
        for (const key of ["label", "state", "city", "address", "isDefault"]) {
            if (data[key] !== undefined)
                updateData[key] = data[key];
        }
        await tx.address.update({ where: { id: addrId }, data: updateData });
        return tx.user.findUnique({ where: { id }, select: { ...userPublicSelect, ...includeAddresses } });
    });
    return withMongoId(user);
};
export const deleteCustomerAddress = async (userId, addressId) => {
    const id = toIntId(userId, "user id");
    const addrId = toIntId(addressId, "address id");
    const user = await prisma.$transaction(async (tx) => {
        const address = await tx.address.findFirst({ where: { id: addrId, userId: id } });
        if (!address)
            throw new Error("Address not found");
        await tx.address.delete({ where: { id: addrId } });
        return tx.user.findUnique({ where: { id }, select: { ...userPublicSelect, ...includeAddresses } });
    });
    return withMongoId(user);
};
//# sourceMappingURL=customer.service.js.map