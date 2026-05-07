import { jest, describe, it, expect, beforeEach } from "@jest/globals";

var mockPrisma;

jest.mock("../../src/config/prismaClient.js", () => ({
  __esModule: true,
  default: (mockPrisma = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  }),
}));

import notificationService from "../../src/services/notification.service.js";

describe("Notification Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a notification with Prisma", async () => {
    mockPrisma.notification.create.mockResolvedValue({
      id: 12,
      recipientId: 3,
      title: "Order Confirmed",
      message: "Your order has been received",
      type: "order_placed",
      isRead: false,
    });

    const result = await notificationService.createNotification(
      3,
      "Order Confirmed",
      "Your order has been received",
      "order_placed",
      { orderId: 9 }
    );

    expect(result._id).toBe("12");
    expect(mockPrisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        recipientId: 3,
        title: "Order Confirmed",
        type: "order_placed",
        data: { orderId: 9 },
        isRead: false,
      }),
    });
  });

  it("retrieves paginated user notifications", async () => {
    mockPrisma.notification.findMany.mockResolvedValue([{ id: 1, recipientId: 3 }]);
    mockPrisma.notification.count.mockResolvedValue(11);

    const result = await notificationService.getUserNotifications(3, 2, 10, false);

    expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
      where: { recipientId: 3, isRead: false },
      orderBy: { createdAt: "desc" },
      skip: 10,
      take: 10,
    });
    expect(result.notifications).toHaveLength(1);
    expect(result.pagination.totalPages).toBe(2);
  });

  it("marks a single notification as read", async () => {
    mockPrisma.notification.findFirst.mockResolvedValue({ id: 7, recipientId: 3 });
    mockPrisma.notification.update.mockResolvedValue({ id: 7, isRead: true });

    const result = await notificationService.markAsRead(7, 3);

    expect(result.isRead).toBe(true);
    expect(mockPrisma.notification.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { isRead: true, readAt: expect.any(Date) },
    });
  });

  it("marks all unread notifications as read", async () => {
    mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

    const result = await notificationService.markAllAsRead(3);

    expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
      where: { recipientId: 3, isRead: false },
      data: { isRead: true, readAt: expect.any(Date) },
    });
    expect(result.modifiedCount).toBe(5);
  });

  it("creates vendor approval notifications", async () => {
    mockPrisma.notification.create.mockResolvedValue({ id: 44, type: "vendor_approved" });

    await notificationService.notifyVendorApproved({ id: 8 });

    expect(mockPrisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        recipientId: 8,
        type: "vendor_approved",
        priority: "high",
      }),
    });
  });
});
