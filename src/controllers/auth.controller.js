import * as authService from "../services/auth.service.js";

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const data = await authService.loginUser(email, password);

        res.json({
        message: "Login successful",
        ...data
        });

    } catch (error) {
        next(error);
    }
};

export const forgotPass = async (req, res, next) => {
    try {
        await authService.forgotPassword(req.body.email);

        res.json({
        message: "Reset link sent to email"
        });

    } catch (error) {
        next(error);
    }
};

export const resetPass = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        await authService.resetPassword(token, password);

        res.json({
        message: "Password reset successful"
        });

    } catch (error) {
        next(error);
    }
};
