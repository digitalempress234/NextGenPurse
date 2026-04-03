// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   },
//   connectionTimeout: 10000,
//   greetingTimeout: 10000,
// });
// console.log(process.env.EMAIL_USER);
// console.log(process.env.EMAIL_PASS);

// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     const info = await transporter.sendMail({
//       from: `"Next Gen Purse Superstore" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html
//     });

//     console.log("Email sent:", info.messageId);

//   } catch (error) {
//     console.error("Email error:", error);
//     throw new Error("Email could not be sent");
//   }
// };
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",   // Keep this simple for Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS   // ← MUST be the 16-char App Password
  }
});

// Test transporter on startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email transporter failed:", error.message);
  } else {
    console.log("✅ Email transporter ready");
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Next Gen Purse Superstore" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email error:", error.message);
    throw new Error("Email could not be sent: " + error.message);
  }
};