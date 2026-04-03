import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

export const registerCustomer = async (data) => {
    const { firstName, lastName, email, password,  } = data;
    if (!email || !password || !firstName || !lastName) {
        throw new Error("All fields are required");
    }

    const existing = await User.findOne({ email });
    if (existing) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        ...data,
        password: hashedPassword,
        role: "customer",
        isEmailVerified: true
    });

    const token = generateToken(user);

    return { token };
};

export const getCustomerProfile = async (userId) => {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

export const updateCustomerProfile = async (userId, data) => {
    const allowedFields = [
        "firstName",
        "lastName",
        "phoneNumber",
        "avatar"
    ];

    const updates = {};

    // Only allow specific fields
    for (let key of allowedFields) {
        if (data[key] !== undefined) {
        updates[key] = data[key];
        }
    }

    const user = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true }
    ).select("-password");

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

export const addCustomerAddress = async (userId, data) => {
    if (!data || !data.address) {
        throw new Error("Address is required");
    }

    const user = await User.findById(userId).select("-password");
    if (!user) throw new Error("User not found");

    const newAddress = {
        label: data.label,
        state: data.state,
        city: data.city,
        address: data.address,
        isDefault: Boolean(data.isDefault)
    };

    if (newAddress.isDefault) {
        user.addresses.forEach((a) => {
        a.isDefault = false;
        });
    }

    user.addresses.push(newAddress);
    await user.save();

    return user;
};

export const updateCustomerAddress = async (userId, addressId, data) => {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new Error("User not found");

    const address = user.addresses.id(addressId);
    if (!address) throw new Error("Address not found");

    const fields = ["label", "state", "city", "address", "isDefault"];
    fields.forEach((key) => {
        if (data[key] !== undefined) {
        address[key] = data[key];
        }
    });

    if (address.isDefault) {
        user.addresses.forEach((a) => {
        if (a._id.toString() !== addressId) {
            a.isDefault = false;
        }
        });
    }

    await user.save();
    return user;
};

export const deleteCustomerAddress = async (userId, addressId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new Error("User not found");

    const address = user.addresses.id(addressId);
    if (!address) throw new Error("Address not found");

    address.deleteOne();
    await user.save();

    return user;
};
