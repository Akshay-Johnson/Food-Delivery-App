import mongoose from "mongoose";

const emailOtpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expiresAt: Date,
});

export default mongoose.model("EmailOtp", emailOtpSchema);
