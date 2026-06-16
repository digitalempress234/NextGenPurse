import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import prisma from "../config/prismaClient.js";
import { sendEmail } from "./email.service.js";
import { config } from "../config/env.js";
import { withMongoId } from "../utils/prismaHelpers.js";

interface JwtUser {
  id: number;
  role: string;
}

interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface PublicUser {
  id: number;
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const generateToken = (user: JwtUser): string => {
  const signOptions: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
    ...signOptions,
  });
};

export const registerUser = async (userData: RegisterUserInput): Promise<{ user: PublicUser }> => {
  const { email, password, firstName, lastName, role = "customer" } = userData;
  const normalizedEmail = String(email).trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    const error = new Error("Email already registered") as Error & { statusCode?: number };
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
      subject: "Welcome to PurseByNextGenPurse",
      html: `<p>Welcome ${firstName}! Your account has been created successfully.</p>`,
    });
  } catch (emailError: unknown) {
    const message = emailError instanceof Error ? emailError.message : String(emailError);
    console.warn("Failed to send welcome email:", message);
  }

  return {
    user: withMongoId({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }) as PublicUser,
  };
};

export const loginUser = async (email: string, password: string): Promise<{ token: string }> => {
  const user = await prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
  });

  const unauthorizedError = new Error("Invalid credentials") as Error & { statusCode?: number };
  unauthorizedError.statusCode = 401;

  if (!user) throw unauthorizedError;
  if (!user.password) throw new Error("Complete onboarding before login");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw unauthorizedError;
  if (!user.isActive) {
    const error = new Error("Account disabled") as Error & { statusCode?: number };
    error.statusCode = 403;
    throw error;
  }

  const onboardingError = new Error("Complete onboarding before login") as Error & { statusCode?: number };
  onboardingError.statusCode = 401;

  if (user.role === "vendor") {
    if (!user.isEmailVerified) {
      const emailError = new Error("Verify email before login") as Error & { statusCode?: number };
      emailError.statusCode = 401;
      throw emailError;
    }
    if (user.onboardingStep !== "approved") throw onboardingError;
  }

  if (user.role === "rider") {
    if (!user.isEmailVerified) {
      const emailError = new Error("Verify email before login") as Error & { statusCode?: number };
      emailError.statusCode = 401;
      throw emailError;
    }
    if (user.onboardingStep !== "approved") throw onboardingError;
  }

  return { token: generateToken(user) };
};

export const forgotPassword = async (email: string): Promise<true> => {
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

export const resetPassword = async (token: string, newPassword: string): Promise<true> => {
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
