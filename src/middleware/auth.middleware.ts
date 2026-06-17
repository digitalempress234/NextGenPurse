import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient.js";
import { withMongoId, withoutPassword } from "../utils/prismaHelpers.js";

const normalizeRole = (role) => String(role ?? "").trim().toLowerCase();

const decodePayload = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded || typeof decoded === "string") return {};
  return decoded;
};

const loadUser = async (id) => {
  const userId = Number.parseInt(String(id), 10);
  if (!Number.isInteger(userId)) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? withMongoId(withoutPassword(user)) : null;
};

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = decodePayload(token);
    const user = await loadUser(decoded.id);

    if (!user) return res.status(401).json({ message: "User not found" });
    if (!user.isActive) return res.status(403).json({ message: "Account disabled" });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize = (...roles) => {
  const allowedRoles = roles.map(normalizeRole);

  return (req, res, next) => {
    if (!allowedRoles.includes(normalizeRole(req.user?.role))) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

export const vendor = (req, res, next) => {
  if (normalizeRole(req.user?.role) !== "vendor") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

export const admin = (req, res, next) => {
  if (normalizeRole(req.user?.role) !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

export const protectVendorOnboarding = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = decodePayload(token);
    if (decoded.scope && decoded.scope !== "vendor_onboarding") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await loadUser(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    if (!user.isActive) return res.status(403).json({ message: "Account disabled" });
    if (normalizeRole(user.role) !== "vendor") return res.status(403).json({ message: "Access denied" });
    if (!user.isEmailVerified) return res.status(403).json({ message: "Verify email before onboarding" });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const protectRiderOnboarding = async (req, res, next) => {
  try {
    console.log("Auth header:", req.headers.authorization);
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.error("protectRiderOnboarding: No token");
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = decodePayload(token);
    if (decoded.scope && decoded.scope !== "rider_onboarding") {
      console.error("protectRiderOnboarding: Invalid scope", decoded.scope);
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await loadUser(decoded.id);
    if (!user) {
      console.error("protectRiderOnboarding: User not found", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }
    if (!user.isActive) return res.status(403).json({ message: "Account disabled" });
    if (normalizeRole(user.role) !== "rider") {
      console.error("protectRiderOnboarding: Invalid role", user.role);
      return res.status(403).json({ message: "Access denied" });
    }
    if (!user.isEmailVerified) return res.status(403).json({ message: "Verify email before onboarding" });

    req.user = user;
    next();
  } catch (error) {
    console.error("protectRiderOnboarding: Error", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

