import express from "express";

import {
  registerAdmin,
  loginAdmin,
  getAllRestaurants,
  updateRestaurantStatus,
  getAllCustomers,
  getAllAgents,
  updateAgentStatus,
  getAllOrders,
} from "../controllers/adminController.js";

import Review from "../models/reviewModel.js";
import { protectAdmin } from "../middlewares/adminAuth.js";
import { validate } from "../middlewares/validate.js";

import {
  adminRegisterSchema,
  adminLoginSchema,
} from "../models/validations/admin.js";

const router = express.Router();

/* =========================
   AUTH
========================= */
router.post(
  "/register",
  validate(adminRegisterSchema),
  registerAdmin
);

router.post(
  "/login",
  validate(adminLoginSchema),
  loginAdmin
);

/* =========================
   RESTAURANT CONTROLS
========================= */
router.get(
  "/restaurants",
  protectAdmin,
  getAllRestaurants
);

router.put(
  "/restaurant/status/:id",
  protectAdmin,
  updateRestaurantStatus
);

/* =========================
   CUSTOMER CONTROLS
========================= */
router.get(
  "/customers",
  protectAdmin,
  getAllCustomers
);

/* =========================
   AGENT CONTROLS
========================= */
router.get(
  "/agents",
  protectAdmin,
  getAllAgents
);

router.put(
  "/agent/status/:id",
  protectAdmin,
  updateAgentStatus
);

/* =========================
   ORDER CONTROLS
========================= */
router.get(
  "/orders",
  protectAdmin,
  getAllOrders
);

/* =========================
   REVIEW CONTROLS
========================= */
router.get(
  "/reviews",
  protectAdmin,
  async (req, res) => {
    const reviews = await Review.find()
      .populate("customerId", "name email")
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  }
);

router.delete(
  "/reviews/:id",
  protectAdmin,
  async (req, res) => {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted successfully" });
  }
);

export default router;
