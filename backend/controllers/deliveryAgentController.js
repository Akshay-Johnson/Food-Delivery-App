import DeliveryAgent from "../models/deliveryAgentModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Order from "../models/orderModel.js";

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ✅ REGISTER DELIVERY AGENT
export const registerAgent = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await DeliveryAgent.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Delivery agent already exists" });
    }

    // ✅ HASH AND USE IT
    const hashedPassword = await bcrypt.hash(password, 10);

    const agent = await DeliveryAgent.create({
      name,
      email,
      phone,
      password: hashedPassword, // ✅ FIX
      approvalStatus: "approved",
      isActive: true,
    });

    const token = generateToken(agent._id);

    res.status(201).json({
      message: "Delivery agent registered successfully",
      token,
      agent: {
        _id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        approvalStatus: agent.approvalStatus,
      },
    });
  } catch (error) {
    console.error("REGISTER AGENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ LOGIN DELIVERY AGENT
export const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const agent = await DeliveryAgent.findOne({ email }).select("+password");

    if (!agent) {
      return res.status(400).json({ message: "Agent not found" });
    }

    if (agent.status === "blocked") {
      return res
        .status(403)
        .json({ message: "Your account is blocked by Admin" });
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
        phone: agent.phone,
        status: agent.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in delivery agent" });
  }
};

export const getAgentProfile = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findById(req.user.id)
      .select("name email phone vehicleType vehicleNumber status image");

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

// ✅ UPDATE AGENT LOCATION
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
    const agents = await DeliveryAgent.find({
      approvalStatus: "approved",
      status: "available",
      isActive: true,
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

    // Active (assigned / picked) orders
    const assignedOrders = await Order.countDocuments({
      deliveryAgentId: agentId,
      status: { $in: ["assigned", "picked"] },
    });

    // Completed (delivered) orders
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
