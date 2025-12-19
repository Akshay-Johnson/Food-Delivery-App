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

const router = express.Router();

//auth
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

//restaurant controls
router.get("/restaurants", protectAdmin, getAllRestaurants);
router.put("/restaurant/status/:id", protectAdmin, updateRestaurantStatus);

//customer controls
router.get("/customers", protectAdmin, getAllCustomers);

//delivery agent controls
router.get("/agents", protectAdmin, getAllAgents);
router.put("/agent/status/:id", protectAdmin, updateAgentStatus);

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
