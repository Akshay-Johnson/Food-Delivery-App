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

/* =========================
   AUTH
========================= */
router.post(
  "/register",
  validate(agentRegisterSchema),
  registerAgent
);

router.post(
  "/login",
  validate(agentLoginSchema),
  loginAgent
);

/* =========================
   DASHBOARD
========================= */
router.get(
  "/dashboard",
  protectAgent,
  getAgentDashboardStats
);

/* =========================
   PROFILE
========================= */
router.get(
  "/profile",
  protectAgent,
  getAgentProfile
);

router.put(
  "/profile",
  protectAgent,
  validate(agentUpdateSchema),
  updateAgentProfile
);

/* =========================
   LOCATION
========================= */
router.put(
  "/location",
  protectAgent,
  updateAgentLocation
);

/* =========================
   ORDERS
========================= */
router.get(
  "/available",
  restaurantAuth,
  getAvailableAgents
);

router.get(
  "/orders",
  protectAgent,
  getAssignedOrders
);

router.put(
  "/orders/picked/:id",
  protectAgent,
  markOrderPickedUp
);

router.put(
  "/orders/delivered/:id",
  protectAgent,
  markOrderDelivered
);

/* =========================
   FCM
========================= */
router.post(
  "/save-fcm-token",
  protectAgent,
  saveAgentFcmToken
);

export default router;
