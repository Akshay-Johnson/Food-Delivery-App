import { sendEmail } from "./brevoMailer.js";

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendEmailOtp = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: "Verify your email",
    html: `<h2>Your OTP: ${otp}</h2><p>Valid for 5 minutes</p>`,
  });
};
