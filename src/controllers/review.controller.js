import * as reviewService from "../services/review.service.js";

export const createReview = async (req, res, next) => {
    try {
        const review = await reviewService.createReview(req.user.id, req.body);
        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
};

export const getReviews = async (req, res, next) => {
    try {
        const result = await reviewService.getReviews(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
