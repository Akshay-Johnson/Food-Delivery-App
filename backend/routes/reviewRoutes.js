import express from "express";
import {
  postReview,
  getReviews,
  updateReview,
  deleteReview,
  getRestaurantReview,
  getAllReviewsAdmin,
  toggleHideReview,
  flagReview,
  reportReviewByRestaurant,
  getReviewsByRestaurantAdmin,
} from "../controllers/reviewController.js";

import auth from "../middlewares/authMiddleware.js";
import { protectAdmin } from "../middlewares/adminAuth.js";
import restaurantAuth from "../middlewares/restaurantAuth.js";

const router = express.Router();

// ✅ RESTAURANT: get own reviews
router.get("/restaurant/my-reviews", restaurantAuth, getRestaurantReview);

// CUSTOMER routes
router.post("/:restaurantId", auth, postReview);
router.put("/:restaurantId/:reviewId", auth, updateReview);
router.delete("/:restaurantId/:reviewId", auth, deleteReview);

router.get(
  "/admin/restaurant/:restaurantId",
  protectAdmin,
  getReviewsByRestaurantAdmin
);

// PUBLIC
router.get("/:restaurantId", getReviews);

// ADMIN routes
router.get("/admin/all", protectAdmin, getAllReviewsAdmin);
router.put("/admin/:id/hide", protectAdmin, toggleHideReview);
router.put("/admin/:id/flag", protectAdmin, flagReview);

// RESTAURANT → report review
router.put("/restaurant/:id/report", restaurantAuth, reportReviewByRestaurant);

export default router;
