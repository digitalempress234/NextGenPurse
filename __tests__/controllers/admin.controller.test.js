import { jest, describe, it, expect, beforeEach } from "@jest/globals";

var mockPrisma;
var mockNotificationService;

jest.mock("../../src/config/prismaClient.js", () => ({
  __esModule: true,
  default: (mockPrisma = {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    vendorProfile: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  }),
}));

jest.mock("../../src/services/notification.service.js", () => ({
  __esModule: true,
  default: (mockNotificationService = {
    notifyVendorApproved: jest.fn(),
    notifyVendorRejected: jest.fn(),
    createNotification: jest.fn(),
  }),
}));

import {
  getPendingVendors,
  approveVendor,
  rejectVendor,
} from "../../src/controllers/admin.controller.js";

describe("Admin Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { id: 1, role: "admin" },
      params: {},
      body: {},
      query: { page: 1, limit: 10 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback) => callback(mockPrisma));
  });

  it("retrieves pending vendor applications", async () => {
    const vendors = [{ id: 2, email: "vendor@example.com", onboardingStep: "under_review" }];
    mockPrisma.user.count.mockResolvedValue(1);
    mockPrisma.user.findMany.mockResolvedValue(vendors);

    await getPendingVendors(req, res, next);

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { role: "vendor", onboardingStep: "under_review" },
      skip: 0,
      take: 10,
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.arrayContaining([expect.objectContaining({ _id: "2" })]),
    }));
  });

  it("supports pending vendor pagination", async () => {
    req.query = { page: 2, limit: 5 };
    mockPrisma.user.count.mockResolvedValue(15);
    mockPrisma.user.findMany.mockResolvedValue([]);

    await getPendingVendors(req, res, next);

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 5,
      take: 5,
    }));
  });

  it("approves a vendor application", async () => {
    req.params.id = "2";
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 2,
      role: "vendor",
      onboardingStep: "under_review",
      vendorProfile: { id: 9 },
    });
    mockPrisma.vendorProfile.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.user.update.mockResolvedValue({
      id: 2,
      role: "vendor",
      onboardingStep: "approved",
      isVerified: true,
    });
    mockNotificationService.notifyVendorApproved.mockResolvedValue({});

    await approveVendor(req, res, next);

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { onboardingStep: "approved", isVerified: true },
    });
    expect(mockNotificationService.notifyVendorApproved).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("rejects approval if vendor is missing", async () => {
    req.params.id = "2";
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await approveVendor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("rejects a vendor application with a reason", async () => {
    req.params.id = "2";
    req.body.reason = "Invalid documents";
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 2,
      role: "vendor",
      onboardingStep: "under_review",
    });
    mockPrisma.vendorProfile.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.user.update.mockResolvedValue({
      id: 2,
      role: "vendor",
      onboardingStep: "rejected",
    });
    mockNotificationService.notifyVendorRejected.mockResolvedValue({});

    await rejectVendor(req, res, next);

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { onboardingStep: "rejected" },
    });
    expect(mockNotificationService.notifyVendorRejected).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }), "Invalid documents");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("requires a rejection reason", async () => {
    req.params.id = "2";

    await rejectVendor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
