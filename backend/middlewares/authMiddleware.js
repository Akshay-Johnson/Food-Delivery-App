import jwt from "jsonwebtoken";
import Customer from "../models/customerModel.js";

const protectCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const customer = await Customer.findById(decoded.id);

    if (!customer) {
      return res.status(401).json({ message: "Customer not found" });
    }

    // 🔴 THIS CHECK CAUSED YOUR BUG
    if (!customer.isActive) {
      return res.status(403).json({
        message: "Your account has been blocked. Contact support.",
      });
    }
    req.user = customer;

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default protectCustomer;
