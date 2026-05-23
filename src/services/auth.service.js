import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient.js";
import { sendEmail } from "./email.service.js";
import { config } from "../config/env.js";
import { withMongoId } from "../utils/prismaHelpers.js";

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const registerUser = async (userData) => {
  const { email, password, firstName, lastName, role = "customer" } = userData;
  const normalizedEmail = String(email).trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      firstName,
      lastName,
      role,
    },
  });

  try {
    await sendEmail({
      to: user.email,
      subject: "Welcome to purse-backend",
      html: `<p>Welcome ${firstName}! Your account has been created successfully.</p>`,
    });
  } catch (emailError) {
    console.warn("Failed to send welcome email:", emailError.message);
  }

  return {
    token: generateToken(user),
    user: withMongoId({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }),
  };
};

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
  });

  if (!user) throw new Error("Invalid credentials");
  if (!user.password) throw new Error("Complete onboarding before login");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");
  if (!user.isActive) throw new Error("Account disabled");

  if (user.role === "vendor") {
    if (!user.isEmailVerified) throw new Error("Verify email before login");
    if (user.onboardingStep !== "approved") throw new Error("Complete onboarding before login");
  }

  return { token: generateToken(user) };
};

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
  });
  if (!user) throw new Error("User not found");

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 1000 * 60 * 30),
    },
  });

  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const link = `${baseUrl}/reset-password/${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "Reset Password",
    html: `<p>Reset your password:</p><a href="${link}">${link}</a>`,
  });

  return true;
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) throw new Error("Invalid or expired token");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(newPassword, 10),
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return true;
};
