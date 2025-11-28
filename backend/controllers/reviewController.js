import Review from '../models/reviewModel.js';
import Restaurant from '../models/restaurantModel.js';


//auto udate restaurant rating when a new review is added
const updateRestaurantRating = async (restaurantId) => {
    const reviews = await Review.find({ restaurantId });

    const avgRating = reviews.reduce((sum , r ) => sum + r.rating, 0) / reviews.length;

    await Restaurant.findByIdAndUpdate(restaurantId, { 
        averageRating: avgRating.toFixed(1),
        totalReviews: reviews.length
    });
};


export const postReview = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { restaurantId } = req.params;
        const { rating, comment } = req.body;

        //validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        //prevent duplicate reviews
        const existingReview = await Review.findOne({ customerId, restaurantId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this restaurant.' });
        }
        const review = await Review.create({
            customerId,
            restaurantId,
            rating,
            comment
        });

        await updateRestaurantRating(restaurantId);

        res.status(201).json({
            message: 'Review submitted successfully',
            review
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//get all reviews for a restaurant
export const getReviews = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const reviews = await Review.find({ restaurantId })
            .populate('customerId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};

//update review
export const updateReview = async (req, res) => {
    try{
        const customerId = req.user.id;
        const { restaurantId, reviewId } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findOne({
            _id: reviewId,
            customerId,
            restaurantId
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        //prevent updating after 24 hours
        if (Date.now() - new Date ( review.createdAt).getTime() > 86400000) {
            return res.status(400).json({ message: 'You can only update your review within 24 hours of posting.' });
        }

        review.rating = rating ?? review.rating;
        review.comment = comment ?? review.comment;

        await review.save();

        //update restaurant rating
        await updateRestaurantRating(restaurantId);

        res.json({ message: 'Review updated successfully', review });
    } catch (error) {
        res.status(500).json({ message: 'Error updating review', error: error.message });
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
            restaurantId
        });

        if (!review) 
            return res.status(404).json({ message: 'Review not found' });

            await Review.deleteOne({ _id: reviewId, customerId, restaurantId });

            //recalculate restaurant rating
            await updateRestaurantRating(restaurantId);

            res.json({ message: 'Review deleted successfully' });
    } catch(error) {
            res.status(500).json({ message: 'Error deleting review', error: error.message });
    }
};

