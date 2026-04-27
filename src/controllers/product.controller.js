import * as productService from "../services/product.service.js";

export const createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct(
            req.user.id,
            req.body
        );

        res.status(201).json(product);

    } catch (error) {
        next(error);
    }
};

export const getProducts = async (req, res, next) => {
    try {
        const products = await productService.getProducts(req.query);

        res.json(products);

    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.json(product);
    } catch (error) {
        next(error);
    }
};

export const getMyProducts = async (req, res, next) => {
    try {
        const result = await productService.getVendorProducts(req.user.id, req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const product = await productService.updateProduct(
            req.user.id,
            req.params.id,
            req.body
        );

        res.json(product);
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        await productService.deleteProduct(req.user.id, req.params.id);
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        next(error);
    }
};
