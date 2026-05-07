import asyncHandler from "express-async-handler";
import prisma from "../config/prismaClient.js";
import notificationService from "../services/notification.service.js";
import { formatOrder, toIntId, userPublicSelect, withMongoId } from "../utils/prismaHelpers.js";

const pageArgs = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
};

const searchUserWhere = (search) => search
  ? {
      OR: [
        { firstName: { contains: String(search) } },
        { lastName: { contains: String(search) } },
        { email: { contains: String(search) } },
      ],
    }
  : {};

const pagination = (page, limit, total, key) => ({
  currentPage: page,
  totalPages: Math.ceil(total / limit),
  [key]: total,
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1,
});

export const getPendingVendors = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageArgs(req.query);
  const where = { role: "vendor", onboardingStep: "under_review" };

  const [total, vendors] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: { ...userPublicSelect, vendorProfile: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  res.status(200).json({ success: true, data: withMongoId(vendors), pagination: pagination(page, limit, total, "totalVendors") });
});

export const approveVendor = asyncHandler(async (req, res) => {
  const id = toIntId(req.params.id, "vendor id");
  const vendor = await prisma.user.findUnique({ where: { id }, include: { vendorProfile: true } });
  if (!vendor || vendor.role !== "vendor") {
    res.status(404);
    throw new Error("Vendor not found");
  }
  if (vendor.onboardingStep !== "under_review") {
    res.status(400);
    throw new Error("Vendor is not under review");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.vendorProfile.updateMany({
      where: { userId: id },
      data: { documentReviewStatus: "approved" },
    });
    return tx.user.update({ where: { id }, data: { onboardingStep: "approved", isVerified: true } });
  });

  await notificationService.notifyVendorApproved(updated);
  res.status(200).json({
    success: true,
    message: "Vendor application approved successfully",
    data: { vendorId: updated.id, status: "approved", approvedAt: new Date() },
  });
});

export const rejectVendor = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason) {
    res.status(400);
    throw new Error("Rejection reason is required");
  }

  const id = toIntId(req.params.id, "vendor id");
  const vendor = await prisma.user.findUnique({ where: { id } });
  if (!vendor || vendor.role !== "vendor") {
    res.status(404);
    throw new Error("Vendor not found");
  }
  if (vendor.onboardingStep !== "under_review") {
    res.status(400);
    throw new Error("Vendor is not under review");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.vendorProfile.updateMany({
      where: { userId: id },
      data: { documentReviewStatus: "rejected" },
    });
    return tx.user.update({ where: { id }, data: { onboardingStep: "rejected" } });
  });

  await notificationService.notifyVendorRejected(updated, reason);
  res.status(200).json({
    success: true,
    message: "Vendor application rejected",
    data: { vendorId: updated.id, status: "rejected", reason, rejectedAt: new Date() },
  });
});

export const getAllVendors = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageArgs(req.query);
  const where = { role: "vendor", ...searchUserWhere(req.query.search) };
  if (req.query.status === "approved") where.onboardingStep = "approved";
  if (req.query.status === "pending") where.onboardingStep = "under_review";
  if (req.query.status === "rejected") where.onboardingStep = "rejected";

  const [total, vendors] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: { ...userPublicSelect, store: { select: { id: true, storeName: true, isActive: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  res.status(200).json({ success: true, data: withMongoId(vendors), pagination: pagination(page, limit, total, "totalVendors") });
});

export const getAllCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageArgs(req.query);
  const where = { role: "customer", ...searchUserWhere(req.query.search) };

  const [total, customers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, select: userPublicSelect, orderBy: { createdAt: "desc" }, skip, take: limit }),
  ]);

  res.status(200).json({ success: true, data: withMongoId(customers), pagination: pagination(page, limit, total, "totalCustomers") });
});

export const getAllRiders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageArgs(req.query);
  const where = { role: "rider", ...searchUserWhere(req.query.search) };

  const [total, riders] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, select: userPublicSelect, orderBy: { createdAt: "desc" }, skip, take: limit }),
  ]);

  res.status(200).json({ success: true, data: withMongoId(riders), pagination: pagination(page, limit, total, "totalRiders") });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageArgs(req.query);
  const where = {};
  if (req.query.status) where.currentStatus = req.query.status;
  if (req.query.search) {
    where.OR = [
      { orderNumber: { contains: String(req.query.search) } },
      { customerEmail: { contains: String(req.query.search) } },
      { customerName: { contains: String(req.query.search) } },
    ];
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        store: { select: { id: true, storeName: true } },
        payment: true,
        delivery: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  res.status(200).json({ success: true, data: orders.map(formatOrder), pagination: pagination(page, limit, total, "totalOrders") });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const id = toIntId(req.params.id, "user id");
  const currentUserId = toIntId(req.user.id ?? req.user._id, "user id");
  if (id === currentUserId) {
    res.status(400);
    throw new Error("Cannot modify your own account status");
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: Boolean(req.body.isActive) },
  }).catch(() => null);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const title = user.isActive ? "Account Activated" : "Account Deactivated";
  const message = user.isActive
    ? "Your account has been activated. You can now access all features."
    : `Your account has been deactivated.${req.body.reason ? ` Reason: ${req.body.reason}` : ""}`;

  await notificationService.createNotification(
    user.id,
    title,
    message,
    "system_announcement",
    { reason: req.body.reason, updatedBy: currentUserId },
    "high"
  );

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
    data: { userId: user.id, isActive: user.isActive, updatedAt: new Date() },
  });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalVendors,
    totalCustomers,
    pendingVendors,
    totalOrders,
    recentOrders,
    orderGroups,
    revenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "vendor" } }),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.user.count({ where: { role: "vendor", onboardingStep: "under_review" } }),
    prisma.order.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        store: { select: { id: true, storeName: true } },
      },
    }),
    prisma.order.groupBy({ by: ["currentStatus"], _count: { _all: true } }),
    prisma.payment.aggregate({ _sum: { total: true, paidByCustomer: true } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: { total: totalUsers, vendors: totalVendors, customers: totalCustomers, pendingVendors },
      orders: {
        total: totalOrders,
        statuses: orderGroups.map((item) => ({ _id: item.currentStatus, count: item._count._all })),
        recent: recentOrders.map(formatOrder),
      },
      revenue: {
        totalRevenue: revenue._sum.total || 0,
        totalPaid: revenue._sum.paidByCustomer || 0,
      },
    },
  });
});
