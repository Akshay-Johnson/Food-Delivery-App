import Customer from "../models/customerModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendPushNotification } from "../utils/sendpush.js";
import { emailExistsAnywhere } from "../utils/checkEmailExists.js";
import EmailOtp from "../models/emailOtp.js";
import { generateOtp, sendEmailOtp } from "../utils/emailOtp.js";

// send email otp
export const sendCustomerEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (await emailExistsAnywhere(email)) {
      return res.status(400).json({
        message: "Email already registered with another role",
      });
    }

    const otp = generateOtp();

    await EmailOtp.deleteMany({ email });

    await EmailOtp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmailOtp(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Register Customer
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, otp } = req.body;

    const otpRecord = await EmailOtp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const existingUser = await Customer.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    if (await emailExistsAnywhere(email)) {
      return res.status(400).json({
        message: "Email already registered with another role",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await Customer.create({
      name,
      email,
      password: hashedPassword,
      phone,
      isEmailVerified: true,
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Login Customer
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Customer.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been blocked. Contact support.",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get Customer Profile
export const getCustomerProfile = async (req, res) => {
  try {
    console.log("AUTH CUSTOMER:", req.customer); // 🟢 IMPORTANT DEBUG LOG

    const user = await Customer.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    res.json(user);
  } catch (error) {
    console.log("REQ CUSTOMER =", req.customer);

    res.status(500).json({ message: "Error fetching profile" });
  }
};

//edit customer profile
export const editProfile = async (req, res) => {
  try {
    const customerId = req.user.id;
    const updates = {};

    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.body.profileImage) updates.profileImage = req.body.profileImage;
    if (req.body.password)
      updates.password = await bcrypt.hash(req.body.password, 12);

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updates,
      { new: true }
    ).select("-password");

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
};

// Save FCM Token
export const saveFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token is required" });
    }

    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.fcmToken = fcmToken;
    await customer.save();

    res.json({ message: "FCM token saved successfully" });
  } catch (error) {
    console.error("Save FCM Token Error:", error);
    res.status(500).json({ message: "Failed to save FCM token" });
  }
};

export const testCustomerPush = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);

    if (!customer || !customer.fcmToken) {
      return res.status(400).json({
        message: "No FCM token found for this customer",
      });
    }

    await sendPushNotification({
      token: customer.fcmToken,
      title: "Test Push Successful",
      body: "Push notifications are working correctly 🎉",
      data: {
        type: "test",
      },
    });

    res.json({ message: "Test push sent successfully" });
  } catch (error) {
    console.error("TEST PUSH ERROR:", error);
    res.status(500).json({ message: "Failed to send test push" });
  }
};

// ADMIN: block / unblock customer
export const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.isActive = isActive;
    await customer.save();

    res.json({
      message: isActive
        ? "Customer unblocked successfully"
        : "Customer blocked successfully",
    });
  } catch (error) {
    console.error("UPDATE CUSTOMER STATUS ERROR:", error);
    res.status(500).json({ message: "Failed to update customer status" });
  }
};
