import * as categoryService from "../services/category.service.js";

export const listCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.listCategories(req.query);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryTree = async (req, res, next) => {
  try {
    const tree = await categoryService.getCategoryTree(req.query);
    res.json(tree);
  } catch (error) {
    next(error);
  }
};

