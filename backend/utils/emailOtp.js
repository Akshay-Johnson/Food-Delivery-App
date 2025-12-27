import nodemailer from "nodemailer";

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendEmailOtp = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: email,
    subject: "Verify your email",
    html: `<h2>Your OTP: ${otp}</h2><p>Valid for 5 minutes</p>`,
  });
};
