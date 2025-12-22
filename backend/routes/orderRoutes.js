import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrderStatus,
} from "../controllers/orderController.js";

import protectCustomer from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", protectCustomer, createOrder);

router.get("/my-orders", protectCustomer, getMyOrders);

router.get("/track/:id", protectCustomer, trackOrderStatus);

router.get("/:id", protectCustomer, getOrderById);

export default router;
