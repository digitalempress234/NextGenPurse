import * as compareService from "../services/compare.service.js";
export const getMyCompareList = async (req, res, next) => {
    try {
        const list = await compareService.getCompareList(req.user.id);
        res.json({ status: "success", data: list });
    }
    catch (error) {
        next(error);
    }
};
export const addItem = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const list = await compareService.addItemToCompare(req.user.id, productId);
        res.json({ status: "success", message: "Product added to comparison", data: list });
    }
    catch (error) {
        next(error);
    }
};
export const removeItem = async (req, res, next) => {
    try {
        const list = await compareService.removeItemFromCompare(req.user.id, req.params.productId);
        res.json({ status: "success", message: "Product removed from comparison", data: list });
    }
    catch (error) {
        next(error);
    }
};
export const clearList = async (req, res, next) => {
    try {
        const list = await compareService.clearCompareList(req.user.id);
        res.json({ status: "success", message: "Comparison list cleared", data: list });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=compare.controller.js.map