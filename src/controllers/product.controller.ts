import type { NextFunction, Request, Response } from "express";
import * as productService from "../services/product.service.js";

type AuthenticatedRequest = Request & { user: { id: number | string } };

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.createProduct(req.user.id, req.body as Record<string, unknown>);

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as Record<string, string | undefined>;
    const products = await productService.getProducts(query);

    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const getMyProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await productService.getVendorProducts(
      req.user.id,
      req.query as Record<string, string | undefined>
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.updateProduct(
      req.user.id,
      req.params.id,
      req.body as Record<string, unknown>
    );

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    await productService.deleteProduct(req.user.id, req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};
