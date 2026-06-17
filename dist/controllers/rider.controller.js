import * as riderService from "../services/rider.service.js";
import { uploadImageBuffer } from "../services/upload.service.js";
export const registerRider = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await riderService.registerRider(email);
        res.status(201).json({
            status: "success",
            message: "Verification OTP sent to email",
            userId: user._id,
        });
    }
    catch (error) {
        console.error("REGISTER ERROR:", error);
        next(error);
    }
};
export const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        await riderService.resendRiderOTP(email);
        res.json({
            status: "success",
            message: "OTP resent successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const { token } = await riderService.verifyRiderOTP(email, otp);
        res.json({
            status: "success",
            message: "Email verified successfully",
            token,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getProfile = async (req, res, next) => {
    try {
        const profile = await riderService.getRiderProfile(req.user.id);
        res.json({ status: "success", data: profile });
    }
    catch (error) {
        next(error);
    }
};
export const setBusinessDetails = async (req, res, next) => {
    try {
        await riderService.setRiderBusinessDetails(req.user.id, req.body);
        res.json({ status: "success", message: "Business details set successfully" });
    }
    catch (error) {
        next(error);
    }
};
export const setPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        await riderService.setRiderPassword(req.user.id, password);
        res.json({ status: "success", message: "Password set successfully" });
    }
    catch (error) {
        next(error);
    }
};
export const updateProfile = async (req, res, next) => {
    try {
        const profile = await riderService.updateRiderProfile(req.user.id, req.body);
        res.json({ status: "success", message: "Profile updated", data: profile });
    }
    catch (error) {
        next(error);
    }
};
export const toggleAvailability = async (req, res, next) => {
    try {
        const { isOnline } = req.body;
        const profile = await riderService.updateAvailability(req.user.id, isOnline);
        res.json({ status: "success", message: `Rider is now ${isOnline ? "online" : "offline"}`, data: profile });
    }
    catch (error) {
        next(error);
    }
};
export const submitDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No file uploaded" });
        }
        const { type } = req.body;
        if (!type) {
            return res.status(400).json({ status: "error", message: "Document type is required" });
        }
        const uploadResult = (await uploadImageBuffer(req.file.buffer, "rider_documents"));
        const document = await riderService.uploadDocument(req.user.id, {
            type,
            url: uploadResult.secure_url
        });
        res.status(201).json({ status: "success", message: "Document submitted", data: document });
    }
    catch (error) {
        next(error);
    }
};
export const updateBankAccount = async (req, res, next) => {
    try {
        const account = await riderService.setBankAccount(req.user.id, req.body);
        res.json({ status: "success", message: "Bank account updated", data: account });
    }
    catch (error) {
        next(error);
    }
};
export const submitForReview = async (req, res, next) => {
    try {
        await riderService.submitForReview(req.user.id);
        res.json({ status: "success", message: "Submitted for review" });
    }
    catch (error) {
        next(error);
    }
};
export const getApplicationStatus = async (req, res, next) => {
    try {
        const status = await riderService.getApplicationStatus(req.user.id);
        res.json({ status: "success", data: status });
    }
    catch (error) {
        next(error);
    }
};
export const getWallet = async (req, res, next) => {
    try {
        const wallet = await riderService.getWalletData(req.user.id);
        res.json({ status: "success", data: wallet });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=rider.controller.js.map