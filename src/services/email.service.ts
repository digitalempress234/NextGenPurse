import nodemailer from "nodemailer";
import { config } from "../config/env.js";
import { createHttpError } from "../utils/httpError.js";

const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: config.emailPort,
  secure: config.emailSecure,
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

if (config.nodeEnv !== "test") {
  transporter.verify((error) => {
    if (error) {
      console.error("Email transporter failed:", error.message);
    } else if (config.nodeEnv === "development") {
      console.log("Email transporter ready");
    }
  });
}

export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!config.emailUser || !config.emailPass) {
      throw createHttpError("Email service is not configured", 500);
    }

    const info = await transporter.sendMail({
      from: `"NextGenPurse Superstore" <${config.emailUser}>`,
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    console.error("Email error:", error.message);
    throw createHttpError(
      "Email could not be sent: " + error.message,
      error.statusCode || 500
    );
  }
};