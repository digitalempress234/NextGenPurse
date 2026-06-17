import prisma from "../config/prismaClient.js";
import { registerUser } from "./auth.service.js";
import { toIntId, userPublicSelect, withMongoId } from "../utils/prismaHelpers.js";

type RegisterCustomerInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type CustomerProfileUpdateInput = Partial<{
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  avatar: string | null;
}>;

type AddressInput = Partial<{
  label: string | null;
  state: string | null;
  city: string | null;
  address: string;
  isDefault: boolean;
}>;

const includeAddresses = {
  addresses: { orderBy: { id: "asc" as const } },
};

export const registerCustomer = async (data: RegisterCustomerInput) => {
  const { firstName, lastName, email, password } = data;

  return registerUser({
    firstName,
    lastName,
    email,
    password,
    role: "customer",
  });
};

export const getCustomerProfile = async (userId: number | string) => {
  const user = await prisma.user.findUnique({
    where: { id: toIntId(userId, "user id") },
    select: { ...userPublicSelect, addresses: true },
  });

  if (!user) throw new Error("User not found");

  return withMongoId(user);
};

export const updateCustomerProfile = async (userId: number | string, data: CustomerProfileUpdateInput) => {
  const allowedFields = ["firstName", "lastName", "phoneNumber", "avatar"] as const;
  const updates: Record<string, string | null> = {};

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

export const addCustomerAddress = async (userId: number | string, data: AddressInput) => {
  if (!data || !data.address) throw new Error("Address is required");
  const id = toIntId(userId, "user id");

  const user = await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { id } });
    if (!existing) throw new Error("User not found");

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

export const updateCustomerAddress = async (
  userId: number | string,
  addressId: number | string,
  data: AddressInput
) => {
  const id = toIntId(userId, "user id");
  const addrId = toIntId(addressId, "address id");

  const user = await prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({ where: { id: addrId, userId: id } });
    if (!address) throw new Error("Address not found");

    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId: id, NOT: { id: addrId } },
        data: { isDefault: false },
      });
    }

    const updateData: Record<string, unknown> = {};
    for (const key of ["label", "state", "city", "address", "isDefault"] as const) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }

    await tx.address.update({ where: { id: addrId }, data: updateData });
    return tx.user.findUnique({ where: { id }, select: { ...userPublicSelect, ...includeAddresses } });
  });

  return withMongoId(user);
};

export const deleteCustomerAddress = async (userId: number | string, addressId: number | string) => {
  const id = toIntId(userId, "user id");
  const addrId = toIntId(addressId, "address id");

  const user = await prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({ where: { id: addrId, userId: id } });
    if (!address) throw new Error("Address not found");

    await tx.address.delete({ where: { id: addrId } });
    return tx.user.findUnique({ where: { id }, select: { ...userPublicSelect, ...includeAddresses } });
  });

  return withMongoId(user);
};
