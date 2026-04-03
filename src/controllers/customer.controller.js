import * as customerService from "../services/customer.service.js";

export const register = async (req, res) => {
    const user = await customerService.registerCustomer(req.body);
    res.json({ message: "User created", user });
};

export const getProfile = async (req, res) => {
    const user = await customerService.getCustomerProfile(req.user.id);

    res.json(user);
};

export const updateProfile = async (req, res) => {
    const user = await customerService.updateCustomerProfile(
        req.user.id,
        req.body
    );

    res.json({
        message: "Profile updated",
        user
    });
};

export const addAddress = async (req, res) => {
    const user = await customerService.addCustomerAddress(
        req.user.id,
        req.body
    );

    res.json({
        message: "Address added",
        user
    });
};

export const updateAddress = async (req, res) => {
    const user = await customerService.updateCustomerAddress(
        req.user.id,
        req.params.addressId,
        req.body
    );

    res.json({
        message: "Address updated",
        user
    });
};

export const deleteAddress = async (req, res) => {
    const user = await customerService.deleteCustomerAddress(
        req.user.id,
        req.params.addressId
    );

    res.json({
        message: "Address deleted",
        user
    });
};
