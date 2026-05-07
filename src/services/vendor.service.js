import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient.js";
import { sendEmail } from "./email.service.js";
import { toIntId, withMongoId } from "../utils/prismaHelpers.js";

const enforceStep = (user, requiredStep) => {
  if (user.onboardingStep !== requiredStep) throw new Error(`Complete ${requiredStep} step first`);
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateOnboardingToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role, scope: "vendor_onboarding" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const registerVendor = async (email) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new Error("User already exists");

  const otp = generateOTP();
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      role: "vendor",
      isEmailVerified: false,
      onboardingStep: "created",
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: new Date(Date.now() + 1000 * 60 * 60),
    },
  });

  await sendEmail({
    to: normalizedEmail,
    subject: "Verify your vendor account",
    html: `<h2>Your verification OTP is: ${otp}</h2>`,
  });

  return withMongoId(user);
};

export const resendVendorOTP = async (email) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findFirst({ where: { email: normalizedEmail, role: "vendor" } });
  if (!user) throw new Error("User not found");

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

export const verifyVendorOTP = async (email, otp) => {
  const user = await prisma.user.findFirst({
    where: { email: String(email).trim().toLowerCase(), role: "vendor" },
  });

  if (!user) throw new Error("User not found");
  if (user.emailVerificationOTP !== otp || user.emailVerificationOTPExpires < new Date()) {
    throw new Error("Invalid or expired OTP");
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

export const updateVendorProfile = async (userId, data) => {
  const id = toIntId(userId, "user id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");
  enforceStep(user, "verified");

  const existingProfile = await prisma.vendorProfile.findUnique({ where: { userId: id } });
  if (existingProfile) throw new Error("Vendor profile already exists");

  const [profile, updatedUser] = await prisma.$transaction([
    prisma.vendorProfile.create({
      data: {
        userId: id,
        phoneNumber: data.phoneNumber ?? null,
        state: data.state,
        city: data.city,
        address: data.address,
      },
    }),
    prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName ?? user.firstName,
        lastName: data.lastName ?? user.lastName,
        phoneNumber: data.phoneNumber ?? user.phoneNumber,
        state: data.state ?? user.state,
        city: data.city ?? user.city,
        address: data.address ?? user.address,
        avatar: data.avatar ?? user.avatar,
        onboardingStep: "vendor_updated",
      },
    }),
  ]);

  return { profile: withMongoId(profile), avatar: updatedUser.avatar };
};

export const createStore = async (userId, data) => {
  const id = toIntId(userId, "user id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");
  enforceStep(user, "vendor_updated");
  if (!data.category) throw new Error("Category is required");

  const categoryId = toIntId(data.category, "category");
  const category = await prisma.category.findFirst({
    where: { id: categoryId, level: 1, isActive: true },
  });
  if (!category) throw new Error("Category not found");

  const existingStore = await prisma.store.findUnique({ where: { vendorId: id } });
  if (existingStore) throw new Error("Store already exists");

  const [store] = await prisma.$transaction([
    prisma.store.create({
      data: {
        vendorId: id,
        categoryId,
        storeName: data.storeName,
        state: data.state,
        city: data.city,
        address: data.address,
      },
    }),
    prisma.user.update({ where: { id }, data: { onboardingStep: "store_created" } }),
  ]);

  return withMongoId(store);
};

export const setVendorPassword = async (userId, password) => {
  const id = toIntId(userId, "user id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");
  enforceStep(user, "store_created");

  await prisma.user.update({
    where: { id },
    data: {
      password: await bcrypt.hash(password, 10),
      onboardingStep: "password_set",
    },
  });

  return true;
};

export const uploadVendorDocuments = async (userId, documents) => {
  const id = toIntId(userId, "user id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");
  enforceStep(user, "password_set");

  let docs = documents;
  if (typeof docs === "string") docs = [docs];
  if (!docs || (Array.isArray(docs) && docs.length === 0)) throw new Error("Documents are required");

  const [profile] = await prisma.$transaction([
    prisma.vendorProfile.update({
      where: { userId: id },
      data: { documents: docs },
    }),
    prisma.user.update({ where: { id }, data: { onboardingStep: "documents_uploaded" } }),
  ]);

  return withMongoId(profile);
};

export const submitForReview = async (userId) => {
  const id = toIntId(userId, "user id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");
  enforceStep(user, "documents_uploaded");

  await prisma.user.update({ where: { id }, data: { onboardingStep: "under_review" } });
  return true;
};
