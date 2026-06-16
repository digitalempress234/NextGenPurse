import type { Request, Response } from "express";
import * as customerService from "../services/customer.service.js";

type AuthenticatedRequest = Request & { user: { id: number | string } };

export const register = async (
  req: Request<unknown, unknown, { firstName: string; lastName: string; email: string; password: string }>,
  res: Response
) => {
  const data = await customerService.registerCustomer(req.body);
  res.status(201).json({
    message: "Registration successful",
    ...data,
  });
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const user = await customerService.getCustomerProfile(req.user.id);

  res.json(user);
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = await customerService.updateCustomerProfile(req.user.id, req.body);

  res.json({
    message: "Profile updated",
    user,
  });
};

export const addAddress = async (req: AuthenticatedRequest, res: Response) => {
  const user = await customerService.addCustomerAddress(req.user.id, req.body);

  res.json({
    message: "Address added",
    user,
  });
};

export const updateAddress = async (
  req: AuthenticatedRequest & { params: { addressId: string } },
  res: Response
) => {
  const user = await customerService.updateCustomerAddress(req.user.id, req.params.addressId, req.body);

  res.json({
    message: "Address updated",
    user,
  });
};

export const deleteAddress = async (
  req: AuthenticatedRequest & { params: { addressId: string } },
  res: Response
) => {
  const user = await customerService.deleteCustomerAddress(req.user.id, req.params.addressId);

  res.json({
    message: "Address deleted",
    user,
  });
};
