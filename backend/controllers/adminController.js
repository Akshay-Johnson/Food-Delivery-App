import Admin from "../models/adminModel.js";
import Customer from "../models/customerModel.js";
import Restaurant from "../models/restaurantModel.js";
import Order from "../models/orderModel.js";
import DeliveryAgent from "../models/deliveryAgentModel.js";
import { emailExistsAnywhere } from "../utils/checkEmailExists.js";
import EmailOtp from "../models/EmailOtp.js";
import { generateOtp, sendEmailOtp } from "../utils/emailOtp.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendRestaurantApprovalEmail, sendAgentApprovalEmail } from "../utils/sendApprovalEmail.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// send email otp
export const sendAdminEmailOtp = async (req, res) => {
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

//admin registration
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    const otpRecord = await EmailOtp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (await emailExistsAnywhere(email)) {
      return res.status(400).json({
        message: "Email already registered with another role",
      });
    }

    const exists = await Admin.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isEmailVerified: true,
    });

    const token = generateToken(admin);

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin" });
  }
};

//admin login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(admin);

    res.json({
      message: "Admin logged in successfully",
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in admin" });
  }
};

//get all restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.aggregate([
      // Orders count
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "restaurantId",
          as: "orders",
        },
      },
      // Reviews count
      {
        $lookup: {
          from: "reviews", // ✅ reviews collection
          localField: "_id",
          foreignField: "restaurantId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          orderCount: { $size: "$orders" },
          reviewCount: { $size: "$reviews" }, // ✅ NEW
        },
      },
      {
        $project: {
          orders: 0,
          reviews: 0,
          password: 0,
        },
      },
    ]);

    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants", error);
    res.status(500).json({ message: "Error fetching restaurants" });
  }
};

//approve or block restaurant
export const updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" | "blocked"

    if (!["approved", "blocked", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const previousStatus = restaurant.status;

    restaurant.status = status;
    await restaurant.save();

    // ✅ SEND APPROVAL EMAIL (only when moving to approved)
    if (previousStatus !== "approved" && status === "approved") {
      try {
        await sendRestaurantApprovalEmail(restaurant.email, restaurant.name);
      } catch (emailErr) {
        console.error("Approval email failed:", emailErr);
        // ❗ Do NOT fail the request if email fails
      }
    }

    res.json({
      message: `Restaurant status updated to ${status}`,
      restaurant,
    });
  } catch (error) {
    console.error("Update restaurant status error:", error);
    res.status(500).json({
      message: "Error updating restaurant status",
    });
  }
};

//get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select("-password");
    res.json(customers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching customers", error: error.message });
  }
};

//get all delivery agents
export const getAllAgents = async (req, res) => {
  try {
    const agents = await DeliveryAgent.find()
      .select("-password")
      .populate("flaggedByRestaurants.restaurantId", "name");

    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching delivery agents" });
  }
};

//approve or block delivery agent
export const updateAgentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body; // pending | approved | blocked

    if (!["pending", "approved", "blocked"].includes(approvalStatus)) {
      return res.status(400).json({ message: "Invalid approval status" });
    }

    const agent = await DeliveryAgent.findById(id);
    if (!agent) {
      return res.status(404).json({ message: "Delivery Agent not found" });
    }

    const previousStatus = agent.approvalStatus;

    agent.approvalStatus = approvalStatus;
    agent.isActive = approvalStatus === "approved";

    await agent.save();

    // 📧 SEND APPROVAL EMAIL
    if (previousStatus !== "approved" && approvalStatus === "approved") {
      try {
        await sendAgentApprovalEmail(agent.email, agent.name);
      } catch (err) {
        console.error("Agent approval email failed:", err);
      }
    }

    res.json({
      message: `Delivery Agent ${approvalStatus} successfully`,
      agent,
    });
  } catch (error) {
    console.error("Update agent status error:", error);
    res.status(500).json({ message: "Error updating delivery agent status" });
  }
};

//get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "name email")
      .populate("restaurantId", "name email")
      .populate("deliveryAgentId", "name email");

    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

export const getOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId).select(
      "name image"
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const orders = await Order.find({ restaurantId })
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    res.json({
      restaurant,
      orders,
    });
  } catch (err) {
    console.error("Admin get orders by restaurant failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};
