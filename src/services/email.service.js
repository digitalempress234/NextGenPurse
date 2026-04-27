import nodemailer from "nodemailer";
import { createHttpError } from "../utils/httpError.js";

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  
  }
});

// Test transporter on startup
if (process.env.NODE_ENV !== "test") {
  transporter.verify((error) => {
    if (error) {
      console.error(" Email transporter failed:", error.message);
    } else if (process.env.NODE_ENV === "development") {
      console.log(" Email transporter ready");
    }
  });
}

export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw createHttpError("Email service is not configured", 500);
    }
    const info = await transporter.sendMail({
      from: `"NextGenPurse Superstore" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Email sent successfully:", info.messageId);
    }
    return info;
  } catch (error) {
    console.error("Email error:", error.message);
    throw createHttpError("Email could not be sent: " + error.message, error.statusCode || 500);
  }
};