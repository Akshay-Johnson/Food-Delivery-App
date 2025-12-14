import express from "express";
import {
  getRestaurantOrders,
  acceptOrder,
  rejectOrder,
  markPreparing,
  markReady,
  assignOrderToAgent,
} from "../controllers/orderController.js";
import restaurantAuth from "../middlewares/restaurantAuth.js";

const router = express.Router();

// list orders
router.get("/orders", restaurantAuth, getRestaurantOrders);

router.post('/orders/assign-agent/:orderId', restaurantAuth, assignOrderToAgent);


// status updates
router.put("/orders/:id/accept", restaurantAuth, acceptOrder);
router.put("/orders/:id/preparing", restaurantAuth, markPreparing);
router.put("/orders/:id/ready", restaurantAuth, markReady);
router.put("/orders/:id/reject", restaurantAuth, rejectOrder);

// assign agent
router.post(
  "/orders/:id/assign-agent",
  restaurantAuth,
  assignOrderToAgent
);

export default router;
