import express from "express";

import {
  registerRestaurant,
  loginRestaurant,
  getRestaurantProfile,
  updateRestaurantProfile,
  getAllRestaurants,
  getRestaurantById,
  addCategory,
  removeCategory,
  getCategories,
  searchRestaurants,
  getRestaurantDetails,
  saveFCMToken,
  getRestaurantReviewsForOwner,
} from "../controllers/restaurantController.js";

import {
  getRestaurantOrders,
  getAssignedOrders,
  assignOrderToAgent,
} from "../controllers/orderController.js";

import restaurantAuth from "../middlewares/restaurantAuth.js";
import { validate } from "../middlewares/validate.js";

import {
  restaurantRegisterSchema,
  restaurantLoginSchema,
  restaurantUpdateSchema,
} from "../models/validations/restaurant.js";

const router = express.Router();

/* =========================
   AUTH
========================= */
router.post(
  "/register",
  validate(restaurantRegisterSchema),
  registerRestaurant
);

router.post(
  "/login",
  validate(restaurantLoginSchema),
  loginRestaurant
);

/* =========================
   FCM TOKEN
========================= */
router.post(
  "/save-fcm-token",
  restaurantAuth,
  saveFCMToken
);

/* =========================
   PRIVATE RESTAURANT ROUTES
========================= */
router.get(
  "/profile",
  restaurantAuth,
  getRestaurantProfile
);

router.put(
  "/profile",
  restaurantAuth,
  validate(restaurantUpdateSchema),
  updateRestaurantProfile
);

router.get(
  "/orders",
  restaurantAuth,
  getRestaurantOrders
);

router.put(
  "/assign/orders",
  restaurantAuth,
  getAssignedOrders
);

router.put(
  "/orders/assign/:orderId",
  restaurantAuth,
  assignOrderToAgent
);

router.get(
  "/reviews",
  restaurantAuth,
  getRestaurantReviewsForOwner
);

/* =========================
   PUBLIC ROUTES
========================= */
router.get("/", getAllRestaurants);

router.get("/search", searchRestaurants);

router.get("/:id/categories", getCategories);

router.get("/:id/details", getRestaurantDetails);

router.get("/:id", getRestaurantById);

/* =========================
   CATEGORY MANAGEMENT
========================= */
router.post(
  "/categories",
  restaurantAuth,
  addCategory
);

router.delete(
  "/categories",
  restaurantAuth,
  removeCategory
);

export default router;
