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
} from "../controllers/reviewController.js";
import auth from "../middlewares/authMiddleware.js";
import { protectAdmin } from "../middlewares/adminAuth.js";
import { restaurantAuth } from "../middlewares/restaurantAuth.js";

const router = express.Router();

router.get("/restaurant/my-reviews", auth, getRestaurantReview);

router.post("/:restaurantId", auth, postReview);
router.get("/:restaurantId", getReviews);
router.put("/:restaurantId/:reviewId", auth, updateReview);
router.delete("/:restaurantId/:reviewId", auth, deleteReview);

// Admin routes
router.get("/admin/all", protectAdmin, getAllReviewsAdmin);

router.put("/admin/:id/hide", protectAdmin, toggleHideReview);

router.put("/admin/:id/flag", protectAdmin, flagReview);

router.put("/restaurant/:id/report", restaurantAuth, reportReviewByRestaurant);

export default router;
