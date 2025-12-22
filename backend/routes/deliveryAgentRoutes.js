import express from "express";

import {
  registerAgent,
  loginAgent,
  getAgentProfile,
  updateAgentProfile,
  updateAgentLocation,
  getAvailableAgents,
  getAgentDashboardStats,
  saveAgentFcmToken,
} from "../controllers/deliveryAgentController.js";

import { protectAgent } from "../middlewares/agentAuth.js";
import { restaurantAuth } from "../middlewares/restaurantAuth.js";

import {
  getAssignedOrders,
  markOrderPickedUp,
  markOrderDelivered,
} from "../controllers/orderController.js";

import { validate } from "../middlewares/validate.js";

import {
  agentRegisterSchema,
  agentLoginSchema,
  agentUpdateSchema,
} from "../models/validations/deliveryagent.js";

const router = express.Router();

//agent registration and login
router.post("/register", validate(agentRegisterSchema), registerAgent);

router.post("/login", validate(agentLoginSchema), loginAgent);

//dashboard stats
router.get("/dashboard", protectAgent, getAgentDashboardStats);

//profile routes
router.get("/profile", protectAgent, getAgentProfile);

router.put(
  "/profile",
  protectAgent,
  validate(agentUpdateSchema),
  updateAgentProfile
);

//update location
router.put("/location", protectAgent, updateAgentLocation);

//get available agents for restaurant to assign orders
router.get("/available", restaurantAuth, getAvailableAgents);

router.get("/orders", protectAgent, getAssignedOrders);

router.put("/orders/picked/:id", protectAgent, markOrderPickedUp);

router.put("/orders/delivered/:id", protectAgent, markOrderDelivered);

//save fcm token
router.post("/save-fcm-token", protectAgent, saveAgentFcmToken);

export default router;
