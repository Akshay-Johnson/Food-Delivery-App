import express from "express";
import {
  postReview,
  getReviews,
  updateReview,
  deleteReview,
  getRestaurantReview,
} from "../controllers/reviewController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();


router.get("/restaurant/my-reviews", auth, getRestaurantReview);


router.post("/:restaurantId", auth, postReview);
router.get("/:restaurantId", getReviews);
router.put("/:restaurantId/:reviewId", auth, updateReview);
router.delete("/:restaurantId/:reviewId", auth, deleteReview);

export default router;
