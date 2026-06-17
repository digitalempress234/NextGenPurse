import type { NextFunction, Request, Response } from "express";
import * as vendorService from "../services/vendor.service.js";
import { uploadImageBuffer } from "../services/upload.service.js";

type AuthenticatedRequest = Request & { user: { id: number | string } };
type MulterFile = { buffer: Buffer };

type VendorProfileBody = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  state?: string;
  city?: string;
  address?: string;
  avatar?: string;
};

export const registerVendor = async (
  req: Request<unknown, unknown, { email: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const user = await vendorService.registerVendor(email);

    res.status(201).json({
      status: "success",
      message: "Verification OTP sent to email",
      data: { userId: user._id },
    });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (
  req: Request<unknown, unknown, { email: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    await vendorService.resendVendorOTP(email);

    res.json({
      status: "success",
      message: "OTP resent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (
  req: Request<unknown, unknown, { email: string; otp: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    const { token } = await vendorService.verifyVendorOTP(email, otp);

    res.json({
      status: "success",
      message: "Email verified successfully",
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendorProfile = async (
  req: AuthenticatedRequest & { body: VendorProfileBody; file?: MulterFile },
  res: Response,
  next: NextFunction
) => {
  try {
    const data: VendorProfileBody = { ...req.body };

    if (req.file) {
      const result = await uploadImageBuffer(req.file.buffer, "vendor-avatars") as any;
      data.avatar = result.secure_url || result.url;
    }

    const { profile, avatar } = await vendorService.updateVendorProfile(req.user.id, data);

    res.json({
      status: "success",
      message: "Vendor profile updated",
      data: { profile, avatar },
    });
  } catch (error) {
    next(error);
  }
};

export const createStore = async (
  req: AuthenticatedRequest & { body: { category: string | number; storeName: string; state: string; city: string; address: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const store = await vendorService.createStore(req.user.id, req.body);

    res.json({
      status: "success",
      message: "Store created successfully",
      data: { store },
    });
  } catch (error) {
    next(error);
  }
};

export const setPassword = async (
  req: AuthenticatedRequest & { body: { password: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const { password } = req.body;

    await vendorService.setVendorPassword(req.user.id, password);

    res.json({
      status: "success",
      message: "Password set successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const uploadDocuments = async (
  req: AuthenticatedRequest & { body: { documents?: string[] | string }; files?: MulterFile[] },
  res: Response,
  next: NextFunction
) => {
  try {
    let documents = req.body?.documents;

    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map((file) => uploadImageBuffer(file.buffer, "vendor-documents"))
      );
      documents = uploads.map((u: any) => u.secure_url || u.url);
    }

    const profile = await vendorService.uploadVendorDocuments(req.user.id, documents || []);

    res.json({
      status: "success",
      message: "Documents uploaded successfully",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

export const submitForReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await vendorService.submitForReview(req.user.id);

    res.json({
      status: "success",
      message: "Submitted for review",
    });
  } catch (error) {
    next(error);
  }
};
