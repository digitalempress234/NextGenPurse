import * as vendorService from "../services/vendor.service.js";
import { uploadImageBuffer } from "../services/upload.service.js";

export const registerVendor = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await vendorService.registerVendor(email);

        res.status(201).json({
        message: "OTP sent to email",
        userId: user._id
        });

    } catch (error) {
        next(error);
    }
};

export const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        await vendorService.resendVendorOTP(email);

        res.json({
        message: "OTP resent successfully"
        });

    } catch (error) {
        next(error);
    }
};

export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const { token } = await vendorService.verifyVendorOTP(email, otp);

        res.json({
        message: "Email verified successfully",
        token
        });

    } catch (error) {
        next(error);
    }
};

export const updateVendorProfile = async (req, res, next) => {
    try {
        const data = { ...req.body };

        if (req.file) {
        const result = await uploadImageBuffer(req.file.buffer, "vendor-avatars");
        data.avatar = result.secure_url || result.url;
        }

        const { profile, avatar } = await vendorService.updateVendorProfile(
        req.user.id,
        data
        );

        res.json({
        message: "Vendor profile updated",
        profile,
        avatar
        });

    } catch (error) {
        next(error);
    }
};

export const createStore = async (req, res, next) => {
    try {
        const store = await vendorService.createStore(
        req.user.id,
        req.body
        );

        res.json({
        message: "Store created successfully",
        store
        });

    } catch (error) {
        next(error);
    }
};

export const setPassword = async (req, res, next) => {
    try {
        const { password } = req.body;

        await vendorService.setVendorPassword(
        req.user.id,
        password
        );

        res.json({
        message: "Password set successfully"
        });

    } catch (error) {
        next(error);
    }
};

export const uploadDocuments = async (req, res, next) => {
    try {
        let documents = req.body?.documents;

        if (req.files && req.files.length > 0) {
        const uploads = await Promise.all(
            req.files.map((file) =>
            uploadImageBuffer(file.buffer, "vendor-documents")
            )
        );
        documents = uploads.map((u) => u.secure_url || u.url);
        }

        const profile = await vendorService.uploadVendorDocuments(
        req.user.id,
        documents
        );

        res.json({
        message: "Documents uploaded successfully",
        profile
        });

    } catch (error) {
        next(error);
    }
};

export const submitForReview = async (req, res, next) => {
    try {
        await vendorService.submitForReview(req.user.id);

        res.json({
        message: "Submitted for review"
        });

    } catch (error) {
        next(error);
    }
};
