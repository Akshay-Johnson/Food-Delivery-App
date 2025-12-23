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

import { updateCustomerStatus } from "../controllers/customerController.js";

import { adminRemoveFlag } from "../controllers/deliveryAgentController.js";

import Review from "../models/reviewModel.js";
import { protectAdmin } from "../middlewares/adminAuth.js";
import { validate } from "../middlewares/validate.js";

import {
  adminRegisterSchema,
  adminLoginSchema,
} from "../models/validations/admin.js";

const router = express.Router();

//admin registration and login
router.post("/register", validate(adminRegisterSchema), registerAdmin);

router.post("/login", validate(adminLoginSchema), loginAdmin);

//restaurant controls
router.get("/restaurants", protectAdmin, getAllRestaurants);

router.put("/restaurant/status/:id", protectAdmin, updateRestaurantStatus);

//customer controls
router.get("/customers", protectAdmin, getAllCustomers);

// ADMIN: block / unblock customer
router.put("/customer/status/:id", protectAdmin, updateCustomerStatus);

//agent controls
router.get("/agents", protectAdmin, getAllAgents);

router.put("/agent/status/:id", protectAdmin, updateAgentStatus);

// ADMIN: remove restaurant flag from agent
router.put(
  "/agents/:agentId/unflag/:restaurantId",
  protectAdmin,
  adminRemoveFlag
);

//order controls
router.get("/orders", protectAdmin, getAllOrders);

//review controls
router.get("/reviews", protectAdmin, async (req, res) => {
  const reviews = await Review.find()
    .populate("customerId", "name email")
    .populate("restaurantId", "name")
    .sort({ createdAt: -1 });

  res.json(reviews);
});

router.delete("/reviews/:id", protectAdmin, async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: "Review deleted successfully" });
});

export default router;
