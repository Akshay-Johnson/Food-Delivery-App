import express from 'express';
import { postReview, getReviews, updateReview, deleteReview  } from '../controllers/reviewController.js';
import  auth  from '../middlewares/authMiddleware.js';

const router = express.Router();

//post a review
router.post('/:restaurantId', auth, postReview);

//get all reviews for a restaurant
router.get('/:restaurantId', getReviews);

router.put("/:restaurantId/:reviewId", auth, updateReview);
router.delete("/:restaurantId/:reviewId", auth, deleteReview);


export default router;