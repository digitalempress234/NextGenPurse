import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient.js";
import { sendEmail } from "./email.service.js";
import { createHttpError } from "../utils/httpError.js";
import { toIntId, withMongoId } from "../utils/prismaHelpers.js";

interface RiderUser {
  id: number;
  role: string;
  onboardingStep: string;
  emailVerificationOTP: string | null;
  emailVerificationOTPExpires: Date | null;
}

const enforceStep = (user: any, requiredStep: string) => {
  if (user.onboardingStep !== requiredStep) throw createHttpError(`Complete ${requiredStep} step first`, 400);
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateOnboardingToken = (user: { id: number; role: string }) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");

  return jwt.sign({ id: user.id, role: user.role, scope: "rider_onboarding" }, secret, {
    expiresIn: "7d",
  });
};

export const registerRider = async (email: string) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw createHttpError("User already exists", 409);

  const otp = generateOTP();
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      role: "rider",
      isEmailVerified: false,
      onboardingStep: "created",
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: new Date(Date.now() + 1000 * 60 * 60),
    },
  });

  await sendEmail({
    to: normalizedEmail,
    subject: "Verify your rider account",
    html: `<h2>Your verification OTP is: ${otp}</h2>`,
  });

  return withMongoId(user);
};

export const resendRiderOTP = async (email: string) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findFirst({ where: { email: normalizedEmail, role: "rider" } });
  if (!user) throw createHttpError("User not found", 404);

  const otp = generateOTP();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: new Date(Date.now() + 1000 * 60 * 60),
    },
  });

  await sendEmail({
    to: normalizedEmail,
    subject: "Your New OTP",
    html: `<h2>Your OTP is: ${otp}</h2>`,
  });

  return true;
};

export const verifyRiderOTP = async (email: string, otp: string): Promise<{ token: string }> => {
  const user = await prisma.user.findFirst({
    where: { email: String(email).trim().toLowerCase(), role: "rider" },
  });

  if (!user) throw createHttpError("User not found", 404);
  if (user.emailVerificationOTP !== otp || !user.emailVerificationOTPExpires || user.emailVerificationOTPExpires < new Date()) {
    throw createHttpError("Invalid or expired OTP", 400);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      onboardingStep: "verified",
      emailVerificationOTP: null,
      emailVerificationOTPExpires: null,
    },
  });

  return { token: generateOnboardingToken(updated) };
};

export const getRiderProfile = async (userId) => {
  const id = toIntId(userId, "user id");
  const rider = await prisma.user.findUnique({
    where: { id },
    include: {
      riderProfile: true,
      wallet: true,
    },
  });

  if (!rider) throw createHttpError("Rider not found", 404);
  return rider;
};

export const setRiderPassword = async (userId: string | number, password: string) => {
  const id = toIntId(userId, "user id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw createHttpError("User not found", 404);

  enforceStep(user, "rider_updated");

  const hashedPassword = await bcrypt.hash(password, 10);
  
  await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      onboardingStep: "password_set",
    },
  });
  
  return true;
};

export const updateRiderProfile = async (userId, data) => {
  const id = toIntId(userId, "user id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw createHttpError("User not found", 404);

  enforceStep(user, "verified");

  const {
    vehicleType,
    vehicleNumber,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    email,
    phoneNumber,
    city,
  } = data;

  const updateData: any = {
    onboardingStep: "rider_updated",
  };
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (email) updateData.email = email;

  const profileUpdateData: any = {};
  if (gender) profileUpdateData.gender = gender;
  if (dateOfBirth) profileUpdateData.dateOfBirth = new Date(dateOfBirth);
  if (phoneNumber) profileUpdateData.phoneNumber = phoneNumber;
  if (city) profileUpdateData.city = city;
  if (vehicleType) profileUpdateData.vehicleType = vehicleType;
  if (vehicleNumber) profileUpdateData.vehicleNumber = vehicleNumber;

  const [profile] = await prisma.$transaction([
    prisma.riderProfile.upsert({
      where: { userId: id },
      update: profileUpdateData,
      create: { userId: id, ...profileUpdateData },
    }),
    prisma.user.update({
      where: { id },
      data: updateData,
    }),
  ]);

  return withMongoId(profile);
};

export const updateAvailability = async (userId, isOnline) => {
  const id = toIntId(userId, "user id");
  return prisma.riderProfile.update({
    where: { userId: id },
    data: { isOnline },
  });
};

export const setRiderBusinessDetails = async (userId: string | number, data: any) => {
  const id = toIntId(userId, "user id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw createHttpError("User not found", 404);

  enforceStep(user, "rider_updated");

  const { businessName, businessState, businessCity, businessAddress } = data;

  await prisma.$transaction([
    prisma.riderProfile.update({
      where: { userId: id },
      data: { businessName, businessState, businessCity, businessAddress },
    }),
    prisma.user.update({
      where: { id },
      data: { onboardingStep: "business_details_set" },
    }),
  ]);

  return true;
};

export const uploadDocument = async (userId, data) => {
  const id = toIntId(userId, "user id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw createHttpError("User not found", 404);

  enforceStep(user, "business_details_set");

  const { type, url } = data;

  const [document] = await prisma.$transaction([
    prisma.riderDocument.create({
      data: {
        userId: id,
        type,
        url,
        status: "pending",
      },
    }),
    prisma.user.update({
      where: { id },
      data: { onboardingStep: "documents_uploaded" },
    }),
  ]);

  return withMongoId(document);
};

export const setBankAccount = async (userId, data) => {
  const id = toIntId(userId, "user id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw createHttpError("User not found", 404);

  enforceStep(user, "documents_uploaded");

  const { bankName, accountNumber, accountName } = data;

  const [account] = await prisma.$transaction([
    prisma.riderBankAccount.upsert({
      where: { userId: id },
      update: { bankName, accountNumber, accountName },
      create: { userId: id, bankName, accountNumber, accountName },
    }),
    prisma.user.update({
      where: { id },
      data: { onboardingStep: "bank_account_set" },
    }),
  ]);

  return withMongoId(account);
};

export const submitForReview = async (userId: string | number) => {
  const id = toIntId(userId, "user id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw createHttpError("User not found", 404);

  enforceStep(user, "bank_account_set");

  await prisma.user.update({
    where: { id },
    data: { onboardingStep: "under_review" },
  });
  return true;
};

export const getApplicationStatus = async (userId: string | number) => {
  const id = toIntId(userId, "user id");
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      onboardingStep: true,
      isVerified: true,
      isActive: true,
    },
  });

  if (!user) throw createHttpError("User not found", 404);
  return user;
};

export const getWalletData = async (userId) => {
  const id = toIntId(userId, "user id");
  const wallet = await prisma.wallet.findUnique({
    where: { userId: id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!wallet) {
    // Create wallet if it doesn't exist
    return prisma.wallet.create({
      data: { userId: id, balance: 0 },
      include: { transactions: true },
    });
  }

  return wallet;
};
