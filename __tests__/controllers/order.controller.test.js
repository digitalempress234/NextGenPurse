import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import {
  getCustomerOrderHistory,
  cancelOrder,
  updateOrderStatus,
} from "../../src/controllers/order.controller.js";
import * as orderService from "../../src/services/order.service.js";

jest.mock("../../src/services/order.service.js", () => ({
  __esModule: true,
  getCustomerOrders: jest.fn(),
  cancelOrder: jest.fn(),
  updateOrderStatus: jest.fn(),
}));

describe("Order Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { id: 3, role: "customer" },
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
  });

  it("returns customer order history", async () => {
    const serviceResult = {
      items: [{ id: 1, orderNumber: "ORD-001" }],
      meta: { total: 1, pages: 1, page: 1, limit: 10 },
    };
    orderService.getCustomerOrders.mockResolvedValue(serviceResult);

    await getCustomerOrderHistory(req, res, next);

    expect(orderService.getCustomerOrders).toHaveBeenCalledWith(3, { page: 1, limit: 10 });
    expect(res.json).toHaveBeenCalledWith(serviceResult);
  });

  it("passes service errors to next while fetching order history", async () => {
    const error = new Error("Database error");
    orderService.getCustomerOrders.mockRejectedValue(error);

    await getCustomerOrderHistory(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("cancels an order", async () => {
    req.params.id = "7";
    orderService.cancelOrder.mockResolvedValue({ id: 7, currentStatus: "cancelled" });

    await cancelOrder(req, res, next);

    expect(orderService.cancelOrder).toHaveBeenCalledWith("7", 3);
    expect(res.json).toHaveBeenCalledWith({
      message: "Order cancelled successfully",
      order: { id: 7, currentStatus: "cancelled" },
    });
  });

  it("passes cancellation errors to next", async () => {
    req.params.id = "7";
    const error = new Error("Order cannot be cancelled");
    orderService.cancelOrder.mockRejectedValue(error);

    await cancelOrder(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("updates an order status", async () => {
    req.user.role = "admin";
    req.params.id = "7";
    req.body.status = "preparing";
    orderService.updateOrderStatus.mockResolvedValue({ id: 7, currentStatus: "preparing" });

    await updateOrderStatus(req, res, next);

    expect(orderService.updateOrderStatus).toHaveBeenCalledWith("7", "preparing", req.user);
    expect(res.json).toHaveBeenCalledWith({
      message: "Order status updated",
      order: { id: 7, currentStatus: "preparing" },
    });
  });

  it("passes status update errors to next", async () => {
    req.params.id = "7";
    req.body.status = "invalid";
    const error = new Error("Invalid status transition");
    orderService.updateOrderStatus.mockRejectedValue(error);

    await updateOrderStatus(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
