import express from "express";
import {
  registerAgent,
  loginAgent,
  getAgentProfile,
  updateAgentProfile,
  updateAgentLocation,
  getAvailableAgents,
} from "../controllers/deliveryAgentController.js";

import { protectAgent } from "../middlewares/agentAuth.js";
import { restaurantAuth } from "../middlewares/restaurantAuth.js";


import {
  getAssignedOrders,
  markOrderPickedUp,
  markOrderDelivered,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/register", registerAgent);
router.post("/login", loginAgent);

//profile
router.get("/profile", protectAgent, getAgentProfile);
router.put("/profile", protectAgent, updateAgentProfile);

//location
router.put("/location", protectAgent, updateAgentLocation);

//order
router.get("/available", restaurantAuth, getAvailableAgents);
router.get("/orders", protectAgent, getAssignedOrders);
router.put("/orders/picked/:id", protectAgent, markOrderPickedUp);
router.put("/orders/delivered/:id", protectAgent, markOrderDelivered);

export default router;
