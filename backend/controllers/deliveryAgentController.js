import DeliveryAgent from "../models/deliveryAgentModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Order from "../models/orderModel.js";
import { emailExistsAnywhere } from "../utils/checkEmailExists.js";
import EmailOtp from "../models/EmailOtp.js";
import { generateOtp, sendEmailOtp } from "../utils/emailOtp.js";

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// send email otp
export const sendAgentEmailOtp = async (req, res) => {
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

// register delivery agent
export const registerAgent = async (req, res) => {
  try {
    const { name, email, phone, password, otp } = req.body;

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

    const exists = await DeliveryAgent.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Delivery agent already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const agent = await DeliveryAgent.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,

      // ⏳ WAITING FOR ADMIN
      approvalStatus: "pending",
      isActive: false,
      isEmailVerified: true,
    });

    res.status(201).json({
      message:
        "Registration successful. Your account is pending admin approval.",
      agent: {
        _id: agent._id,
        name: agent.name,
        email: agent.email,
        approvalStatus: agent.approvalStatus,
      },
    });
  } catch (error) {
    console.error("REGISTER AGENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// login delivery agent
export const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const agent = await DeliveryAgent.findOne({ email }).select("+password");
    if (!agent) {
      return res.status(400).json({ message: "Agent not found" });
    }

    // ⛔ PENDING
    if (agent.approvalStatus === "pending") {
      return res.status(403).json({
        message: "Your account is pending admin approval",
      });
    }

    // ⛔ BLOCKED
    if (agent.approvalStatus === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked by admin",
      });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(agent._id);

    res.status(200).json({
      message: "Delivery agent logged in successfully",
      token,
      agent: {
        _id: agent._id,
        name: agent.name,
        email: agent.email,
        status: agent.status,
        approvalStatus: agent.approvalStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in delivery agent" });
  }
};

// GET AGENT PROFILE
export const getAgentProfile = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findById(req.user.id).select(
      "name email phone vehicleType vehicleNumber status image"
    );

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.status(200).json({ agent });
  } catch (error) {
    console.error("Get agent profile error:", error);
    res.status(500).json({ message: "Error fetching agent profile" });
  }
};

// ✅ UPDATE AGENT PROFILE (WITH PASSWORD SUPPORT)
export const updateAgentProfile = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findById(req.user.id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (req.body.name !== undefined) {
      agent.name = req.body.name;
    }

    if (req.body.phone !== undefined) {
      agent.phone = req.body.phone;
    }

    if (req.body.status !== undefined) {
      agent.status = req.body.status;
    }

    if (req.body.vehicleType !== undefined) {
      agent.vehicleType = req.body.vehicleType;
    }

    if (req.body.vehicleNumber !== undefined) {
      agent.vehicleNumber = req.body.vehicleNumber;
    }

    console.log("Incoming image:", req.body.image);

    if (req.body.image !== undefined) {
      agent.image = req.body.image;
    }

    if (req.body.password) {
      agent.password = await bcrypt.hash(req.body.password, 10);
    }

    await agent.save();
    console.log("Saved image:", agent.image);

    res.json({
      message: "Profile updated successfully",
      agent: {
        _id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        vehicleType: agent.vehicleType,
        vehicleNumber: agent.vehicleNumber,
        status: agent.status,
        image: agent.image,
      },
    });
  } catch (error) {
    console.error("Update agent profile error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// update agent location
export const updateAgentLocation = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findById(req.user.id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res
        .status(400)
        .json({ message: "Latitude and Longitude are required" });
    }

    agent.location = { lat, lng };
    await agent.save();

    res.json({ message: "Location updated successfully", agent });
  } catch (error) {
    res.status(500).json({ message: "Error updating location" });
  }
};

// get all agents for restaurant view
export const getAvailableAgents = async (req, res) => {
  try {
    const restaurantId = req.user.id;

    const agents = await DeliveryAgent.find({
      approvalStatus: "approved",
      isActive: true,
      "flaggedByRestaurants.restaurantId": { $ne: restaurantId },
    });

    res.json(agents);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching agents",
      error: err.message,
    });
  }
};

export const getAgentDashboardStats = async (req, res) => {
  try {
    const agentId = req.user.id;

    const assignedOrders = await Order.countDocuments({
      deliveryAgentId: agentId,
      status: { $in: ["assigned", "picked"] },
    });

    const completedOrders = await Order.countDocuments({
      deliveryAgentId: agentId,
      status: "delivered",
    });

    const agent = await DeliveryAgent.findById(agentId);

    res.json({
      assignedOrders,
      completedOrders,
      status: agent.status, // available / on-delivery
      approvalStatus: agent.approvalStatus,
    });
  } catch (error) {
    console.error("Agent dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};

// save FCM token for delivery agent
export const saveAgentFcmToken = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { fcmToken } = req.body;

    await DeliveryAgent.findByIdAndUpdate(agentId, { fcmToken });

    res.json({ message: "FCM token saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save FCM token", error });
  }
};

//flag delivery agent
export const flagAgent = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { agentId } = req.params;
    const { reason } = req.body;

    const agent = await DeliveryAgent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (
      (agent.flaggedByRestaurants || []).some(
        (f) => f.restaurantId.toString() === restaurantId
      )
    ) {
      return res.status(400).json({ message: "Agent already flagged" });
    }

    agent.flaggedByRestaurants.push({
      restaurantId,
      reason,
    });

    await agent.save();

    res.json({ message: "Agent flagged successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to flag agent" });
  }
};

//unflag delivery agent
export const unflagAgent = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { agentId } = req.params;

    await DeliveryAgent.updateOne(
      { _id: agentId },
      {
        $pull: {
          flaggedByRestaurants: { restaurantId },
        },
      }
    );

    res.json({ message: "Agent unflagged successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to unflag agent" });
  }
};

// agents flagged by THIS restaurant
export const getFlaggedAgentsByRestaurant = async (req, res) => {
  try {
    const restaurantId = req.user.id;

    const agents = await DeliveryAgent.find({
      "flaggedByRestaurants.restaurantId": restaurantId,
    });

    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: "Failed to load flagged agents" });
  }
};

// ADMIN: remove a specific restaurant flag from agent
export const adminRemoveFlag = async (req, res) => {
  try {
    const { agentId, restaurantId } = req.params;

    const result = await DeliveryAgent.updateOne(
      { _id: agentId },
      {
        $pull: {
          flaggedByRestaurants: { restaurantId },
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Flag not found or already removed" });
    }

    res.json({ message: "Flag removed successfully" });
  } catch (error) {
    console.error("ADMIN REMOVE FLAG ERROR:", error);
    res.status(500).json({ message: "Failed to remove flag" });
  }
};

export const toggleAgentStatus = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findById(req.user.id);

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // toggle status
    agent.status = agent.status === "available" ? "offline" : "available";

    await agent.save();

    res.json({
      message: "Status updated successfully",
      status: agent.status,
    });
  } catch (error) {
    console.error("TOGGLE AGENT STATUS ERROR:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};
