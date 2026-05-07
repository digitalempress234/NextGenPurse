import { jest, describe, it, expect, beforeEach } from "@jest/globals";

var mockPrisma;
var mockNotificationService;

jest.mock("../../src/config/prismaClient.js", () => ({
  __esModule: true,
  default: (mockPrisma = {
    order: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    store: {
      findUnique: jest.fn(),
    },
    product: {
      update: jest.fn(),
    },
    payment: {
      update: jest.fn(),
    },
    deliveryStatusUpdate: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  }),
}));

jest.mock("../../src/services/notification.service.js", () => ({
  __esModule: true,
  default: (mockNotificationService = {
    createNotification: jest.fn(),
    notifyOrderStatusUpdate: jest.fn(),
    notifyOrderPlaced: jest.fn(),
  }),
}));

import * as orderService from "../../src/services/order.service.js";

describe("Order Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (input) => {
      if (typeof input === "function") return input(mockPrisma);
      return Promise.all(input);
    });
  });

  describe("getCustomerOrders", () => {
    it("retrieves customer order history with pagination", async () => {
      mockPrisma.order.count.mockResolvedValue(1);
      mockPrisma.order.findMany.mockResolvedValue([
        {
          id: 1,
          orderNumber: "ORD-001",
          userId: 3,
          storeId: 4,
          customerName: "Ada Lovelace",
          customerEmail: "ada@example.com",
          currentStatus: "Order Received",
          items: [],
        },
      ]);

      const result = await orderService.getCustomerOrders(3, { page: 1, limit: 10 });

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 3 },
        skip: 0,
        take: 10,
      }));
      expect(result.items[0]._id).toBe("1");
      expect(result.meta.total).toBe(1);
    });
  });

  describe("cancelOrder", () => {
    it("cancels an order, restores stock, refunds payment, and notifies the customer", async () => {
      const order = {
        id: 7,
        orderNumber: "ORD-7",
        userId: 3,
        currentStatus: "Order Received",
        createdAt: new Date(),
        items: [{ productId: 11, quantity: 2 }],
        payment: { id: 5 },
      };
      const updatedOrder = { ...order, currentStatus: "cancelled", user: { id: 3 }, store: { id: 4 } };

      mockPrisma.order.findUnique.mockResolvedValueOnce(order);
      mockPrisma.order.findUnique.mockResolvedValueOnce(updatedOrder);
      mockPrisma.order.update.mockResolvedValue(updatedOrder);
      mockPrisma.product.update.mockResolvedValue({});
      mockPrisma.payment.update.mockResolvedValue({});
      mockNotificationService.createNotification.mockResolvedValue({});

      const result = await orderService.cancelOrder(7, 3);

      expect(result.currentStatus).toBe("cancelled");
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 11 },
        data: { stock: { increment: 2 } },
      });
      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { status: "refunded" },
      });
      expect(mockNotificationService.createNotification).toHaveBeenCalled();
    });

    it("rejects cancellation when the user does not own the order", async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 7,
        userId: 99,
        currentStatus: "Order Received",
        createdAt: new Date(),
        items: [],
      });

      await expect(orderService.cancelOrder(7, 3)).rejects.toThrow("Unauthorized");
    });
  });

  describe("processRefund", () => {
    it("refunds payment for a cancelled order", async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 7,
        currentStatus: "cancelled",
        payment: { id: 5 },
      });
      mockPrisma.payment.update.mockResolvedValue({ id: 5, status: "refunded" });

      const result = await orderService.processRefund(7);

      expect(result.status).toBe("refunded");
      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { status: "refunded" },
      });
    });

    it("rejects refund for non-cancelled orders", async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 7, currentStatus: "delivered", payment: { id: 5 } });

      await expect(orderService.processRefund(7)).rejects.toThrow("Order cannot be refunded");
    });
  });

  describe("updateOrderStatus", () => {
    it("updates order status when transition is valid", async () => {
      const currentOrder = {
        id: 7,
        userId: 3,
        orderNumber: "ORD-7",
        currentStatus: "confirmed",
        store: { vendorId: 8 },
        delivery: { id: 4 },
      };
      const updatedOrder = {
        ...currentOrder,
        currentStatus: "preparing",
        user: { id: 3 },
        items: [],
        payment: null,
        delivery: { id: 4, statusUpdates: [] },
      };

      mockPrisma.order.findUnique.mockResolvedValueOnce(currentOrder);
      mockPrisma.order.findUnique.mockResolvedValueOnce(updatedOrder);
      mockPrisma.order.update.mockResolvedValue(updatedOrder);
      mockNotificationService.notifyOrderStatusUpdate.mockResolvedValue([]);

      const result = await orderService.updateOrderStatus(7, "preparing", { id: 8, role: "vendor" });

      expect(result.currentStatus).toBe("preparing");
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: { currentStatus: "preparing" },
      });
    });

    it("rejects invalid status transitions", async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 7,
        currentStatus: "delivered",
        store: { vendorId: 8 },
      });

      await expect(orderService.updateOrderStatus(7, "Processing", { id: 8, role: "admin" }))
        .rejects.toThrow("Invalid status transition");
    });
  });
});
