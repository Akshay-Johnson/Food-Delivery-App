import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { ArrowLeft, Star } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);

  // ✅ IMPORTANT: reviews MUST be array
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  useEffect(() => {
    loadRestaurantDetails();
    loadReviews();
  }, [id]);

  const loadRestaurantDetails = async () => {
    try {
      const res = await api.get(`/api/restaurants/${id}/details`);
      setRestaurant(res.data.restaurant);
      setDishes(res.data.dishes || []);
    } catch (error) {
      console.error("Error loading details:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await api.get(`/api/reviews/${id}`);

      // 🔒 HARD SAFETY
      setReviews(Array.isArray(res.data?.reviews) ? res.data.reviews : []);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
    }
  };

  // 🔒 NEVER use reviews directly
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  const hasReviewed =
    !!user && safeReviews.some((r) => r.customerId?._id === user._id);

  const startEditReview = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment("");
  };

  const updateReview = async (reviewId) => {
    try {
      await api.put(`/api/reviews/${id}/${reviewId}`, {
        rating: editRating,
        comment: editComment,
      });

      cancelEdit();
      loadReviews();
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!confirm("Delete this review?")) return;

    try {
      await api.delete(`/api/reviews/${id}/${reviewId}`);
      loadReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const submitReview = async () => {
    if (!rating) return alert("Please select rating");

    try {
      await api.post(`/api/reviews/${id}`, {
        restaurantId: id,
        rating,
        comment,
      });

      setRating(0);
      setComment("");
      loadReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (!restaurant)
    return <p className="text-white p-6">Restaurant not found</p>;

  return (
    <div className="min-h-screen bg-black/90 text-white">
      {/* Top Bar */}
      <div className="p-4 flex items-center gap-3 bg-black/60 border-b border-white/10">
        <ArrowLeft
          size={28}
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <h2 className="text-xl font-bold">{restaurant.name}</h2>
      </div>

      {/* Banner */}
      <img
        src={restaurant.image || "/assets/restaurantimage.jpeg"}
        className="w-full h-48 object-cover"
        alt="Restaurant"
      />

      {/* Info */}
      <div className="p-4">
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
        <p className="text-gray-300">{restaurant.description}</p>

        <div className="flex items-center gap-2 mt-2 text-yellow-400">
          <Star size={20} />
          <span className="font-semibold">
            {restaurant.averageRating
              ? restaurant.averageRating.toFixed(1)
              : "No ratings yet"}
          </span>
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 mt-4">
        <h2 className="text-xl font-bold mb-4">Menu</h2>

        <div className="grid grid-cols-2 gap-4">
          {dishes.map((item) => (
            <div
              key={item._id}
              className="bg-white/10 border border-white/20 rounded-xl p-3"
            >
              <img
                src={item.image || "/assets/dishimage.jpg"}
                className="w-full h-24 object-cover rounded-md"
                alt={item.name}
              />

              <p className="mt-2 text-lg font-semibold">{item.name}</p>
              <p className="text-gray-300 text-sm">₹{item.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="px-4 mt-10">
        <h2 className="text-xl font-bold mb-4">Reviews</h2>

        {/* Add Review */}
        {user && !hasReviewed && (
          <div className="bg-white/10 p-4 rounded-xl mb-6">
            <div className="flex gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={22}
                  className={`cursor-pointer ${
                    rating >= n ? "text-yellow-400" : "text-gray-500"
                  }`}
                  onClick={() => setRating(n)}
                />
              ))}
            </div>

            <textarea
              className="w-full bg-black/40 p-2 rounded"
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              onClick={submitReview}
              className="bg-green-600 px-4 py-1 rounded mt-2"
            >
              Submit Review
            </button>
          </div>
        )}
        {safeReviews.map((review) => {
          const isOwner = user && review.customerId?._id === user._id;
          const isEditing = editingReviewId === review._id;

          return (
            <div key={review._id} className="bg-white/10 p-4 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {review.customerId?.name || "User"}
                    </span>

                    <div className="flex text-yellow-400">
                      {Array.from({
                        length: isEditing ? editRating : review.rating,
                      }).map((_, i) => (
                        <Star key={i} size={14} />
                      ))}
                    </div>
                  </div>

                  {!isEditing ? (
                    <p className="text-gray-300 text-sm">{review.comment}</p>
                  ) : (
                    <>
                      <div className="flex gap-2 my-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={20}
                            className={`cursor-pointer ${
                              editRating >= n
                                ? "text-yellow-400"
                                : "text-gray-500"
                            }`}
                            onClick={() => setEditRating(n)}
                          />
                        ))}
                      </div>

                      <textarea
                        className="w-full bg-black/40 p-2 rounded text-sm"
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                      />
                    </>
                  )}
                </div>

                {isOwner && (
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <>
                        <button
                          onClick={() => startEditReview(review)}
                          className="text-sm text-blue-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteReview(review._id)}
                          className="text-sm text-red-400"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => updateReview(review._id)}
                          className="text-sm text-green-400"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-sm text-gray-400"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
