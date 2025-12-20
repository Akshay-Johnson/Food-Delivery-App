import { sendPushNotification } from "../utils/sendpush.js";
import Review from "../models/reviewModel.js";
import Restaurant from "../models/restaurantModel.js";

//auto udate restaurant rating when a new review is added
const updateRestaurantRating = async (restaurantId) => {
  const reviews = await Review.find({ restaurantId });

  let avgRating = 0;

  if (reviews.length > 0) {
    avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }

  await Restaurant.findByIdAndUpdate(restaurantId, {
    averageRating: avgRating.toFixed(1),
    totalReviews: reviews.length,
  });
};

export const postReview = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { restaurantId } = req.params;
    const { rating, comment } = req.body;

    //validate rating
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5." });
    }

    //prevent duplicate reviews
    const existingReview = await Review.findOne({ customerId, restaurantId });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this restaurant." });
    }
    const review = await Review.create({
      customerId,
      restaurantId,
      rating,
      comment,
    });

    const restaurant = await Restaurant.findById(restaurantId);
    console.log("Restaurant ID:", restaurantId);
    console.log("Restaurant FCM Token:", restaurant?.fcmToken);

    try {
      if (restaurant?.fcmToken) {
        await sendPushNotification({
          token: restaurant.fcmToken,
          title: "New Review Received",
          body: `Your restaurant has received a new review with a rating of ${rating} stars.`,
          data: {
            restaurantName: restaurant.name ,
            rating: rating.toString(),
          },
        });
      }
    } catch (err) {
      console.error("Error sending push notification:", err);
    }

    await updateRestaurantRating(restaurantId);

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//get all reviews for a restaurant
export const getReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ restaurantId })
      .populate("customerId", "name email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ restaurantId });

    res.status(200).json({ reviews, total, page, limit });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
};

//update review
export const updateReview = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { restaurantId, reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      _id: reviewId,
      customerId,
      restaurantId,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    //prevent updating after 24 hours
    if (Date.now() - new Date(review.createdAt).getTime() > 86400000) {
      return res.status(400).json({
        message: "You can only update your review within 24 hours of posting.",
      });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    await review.save();

    //update restaurant rating
    await updateRestaurantRating(restaurantId);

    res.json({ message: "Review updated successfully", review });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating review", error: error.message });
  }
};

//delete review
export const deleteReview = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { restaurantId, reviewId } = req.params;

    const review = await Review.findOne({
      _id: reviewId,
      customerId,
      restaurantId,
    });

    if (!review) return res.status(404).json({ message: "Review not found" });

    await Review.deleteOne({ _id: reviewId, customerId, restaurantId });

    //recalculate restaurant rating
    await updateRestaurantRating(restaurantId);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting review", error: error.message });
  }
};

//get restaurant review
export const getRestaurantReview = async (req, res) => {
  try {
    const restaurantId = req.user.id;

    const reviews = await Review.find({ restaurantId })
      .populate("customerId", "name profileImage")
      .sort({ createdAt: -1 });
      isHidden: false

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching restaurant reviews",
      error: error.message,
    });
  }
};


/* ======================================================
   ADMIN: GET ALL REVIEWS (WITH CUSTOMER & RESTAURANT)
====================================================== */
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("restaurantId", "name")
      .populate("customerId", "name email profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Admin get reviews error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

/* ======================================================
   ADMIN: HIDE / UNHIDE REVIEW
====================================================== */
export const toggleHideReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { isHidden } = req.body;

    if (typeof isHidden !== "boolean") {
      return res.status(400).json({ message: "Invalid hide value" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.isHidden = isHidden;
    await review.save();

    res.status(200).json({
      message: isHidden ? "Review hidden" : "Review unhidden",
      review,
    });
  } catch (error) {
    console.error("Toggle hide review error:", error);
    res.status(500).json({ message: "Failed to update review visibility" });
  }
};

/* ======================================================
   ADMIN: FLAG REVIEW AS ABUSIVE
====================================================== */
export const flagReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.isFlagged = true;
    await review.save();

    res.status(200).json({
      message: "Review flagged successfully",
      review,
    });
  } catch (error) {
    console.error("Flag review error:", error);
    res.status(500).json({ message: "Failed to flag review" });
  }
};

/* ======================================================
   RESTAURANT: REPORT REVIEW (REQUEST MODERATION)
====================================================== */
export const reportReviewByRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.isFlagged = true;
    await review.save();

    res.status(200).json({
      message: "Review reported to admin",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to report review" });
  }
};
