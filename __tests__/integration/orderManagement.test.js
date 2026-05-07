import { jest, describe, it, expect, beforeEach } from "@jest/globals";

var mockPrisma;
var mockNotificationService;

jest.mock("../../src/config/prismaClient.js", () => ({
  __esModule: true,
  default: (mockPrisma = {
    cart: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    cartItem: {
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    delivery: {
      create: jest.fn(),
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
    notifyOrderPlaced: jest.fn(),
    createNotification: jest.fn(),
    notifyOrderStatusUpdate: jest.fn(),
  }),
}));

import * as orderService from "../../src/services/order.service.js";

describe("Order Management Integration Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback) => callback(mockPrisma));
  });

  it("creates orders from a cart, decrements inventory, creates delivery, clears cart, and notifies customer", async () => {
    mockPrisma.cart.findUnique.mockResolvedValue({
      id: 1,
      userId: 3,
      currency: "NGN",
      items: [
        {
          id: 10,
          productId: 11,
          storeId: 4,
          quantity: 2,
          unitPrice: 1000,
          totalPrice: 2000,
          product: { id: 11 },
        },
      ],
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 3,
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phoneNumber: "0800",
    });
    mockPrisma.order.create.mockResolvedValue({ id: 20, orderNumber: "ORD-20", userId: 3, total: 2000 });
    mockPrisma.product.findUnique.mockResolvedValue({
      id: 11,
      productName: "Bag",
      stock: 5,
      images: ["bag.png"],
    });
    mockPrisma.orderItem.create.mockResolvedValue({});
    mockPrisma.product.update.mockResolvedValue({});
    mockPrisma.delivery.create.mockResolvedValue({});
    mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mockPrisma.cart.update.mockResolvedValue({});
    mockNotificationService.notifyOrderPlaced.mockResolvedValue({});

    const orders = await orderService.placeOrderFromCart(3, {
      shippingAddress: {
        label: "Home",
        state: "Lagos",
        city: "Ikeja",
        address: "1 Test Street",
      },
    });

    expect(orders).toHaveLength(1);
    expect(mockPrisma.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 3,
        storeId: 4,
        customerEmail: "ada@example.com",
        subtotal: 2000,
        total: 2000,
      }),
    });
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 11 },
      data: { stock: { decrement: 2 }, totalSold: { increment: 2 } },
    });
    expect(mockPrisma.delivery.create).toHaveBeenCalled();
    expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 1 } });
    expect(mockNotificationService.notifyOrderPlaced).toHaveBeenCalled();
  });

  it("prevents checkout when product stock is insufficient", async () => {
    mockPrisma.cart.findUnique.mockResolvedValue({
      id: 1,
      userId: 3,
      currency: "NGN",
      items: [{ productId: 11, storeId: 4, quantity: 9, unitPrice: 1000, totalPrice: 9000 }],
    });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 3, email: "ada@example.com" });
    mockPrisma.order.create.mockResolvedValue({ id: 20, orderNumber: "ORD-20", userId: 3 });
    mockPrisma.product.findUnique.mockResolvedValue({ id: 11, productName: "Bag", stock: 2, images: [] });

    await expect(orderService.placeOrderFromCart(3, {})).rejects.toThrow("Insufficient stock");
  });

  it("updates status and records delivery progress", async () => {
    mockPrisma.order.findUnique.mockResolvedValueOnce({
      id: 20,
      userId: 3,
      orderNumber: "ORD-20",
      currentStatus: "ready_for_delivery",
      store: { vendorId: 8 },
      delivery: { id: 6 },
    });
    mockPrisma.order.update.mockResolvedValue({});
    mockPrisma.deliveryStatusUpdate.create.mockResolvedValue({});
    mockPrisma.order.findUnique.mockResolvedValueOnce({
      id: 20,
      userId: 3,
      orderNumber: "ORD-20",
      currentStatus: "out_for_delivery",
      customerName: "Ada",
      customerEmail: "ada@example.com",
      store: { vendorId: 8 },
      user: { id: 3 },
      items: [],
      payment: null,
      delivery: { id: 6, statusUpdates: [] },
    });

    await orderService.updateOrderStatus(20, "out_for_delivery", { id: 8, role: "vendor" });

    expect(mockPrisma.deliveryStatusUpdate.create).toHaveBeenCalledWith({
      data: { deliveryId: 6, status: "Out for delivery", location: "En route" },
    });
    expect(mockNotificationService.notifyOrderStatusUpdate).toHaveBeenCalled();
  });
});
