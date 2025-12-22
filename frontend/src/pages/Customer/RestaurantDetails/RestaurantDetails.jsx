import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { ArrowLeft, Star } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import Toast from "../../../components/toast/toast";

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [toast, setToast] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  /* ===== DISH PAGINATION ===== */
  const ITEMS_PER_PAGE = 6;
  const [page, setPage] = useState(1);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const visibleDishes = dishes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(dishes.length / ITEMS_PER_PAGE);

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
      console.error("Error loading restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await api.get(`/api/reviews/${id}`);
      setReviews(Array.isArray(res.data?.reviews) ? res.data.reviews : []);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
    }
  };

  const addToCart = async (dish) => {
    try {
      await api.post("/api/cart/add", {
        itemId: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: 1,
        restaurantId: dish.restaurantId,
      });
      setToast({ type: "success", message: "🍔 Dish added to cart!" });
    } catch {
      setToast({ type: "error", message: "❌ Failed to add dish to cart." });
    }
  };

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
    try {
      await api.delete(`/api/reviews/${id}/${reviewId}`);
      setToast({ type: "success", message: "Review deleted successfully" });
      loadReviews();
    } catch {
      setToast({ type: "error", message: "Failed to delete review" });
    }
  };

  const submitReview = async () => {
    if (!rating)
      return setToast({ type: "error", message: "Please select rating" });

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
    <div className="relative min-h-[100dvh] text-white">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/restaurant/bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 p-2 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Banner */}
        <img
          src={restaurant.image || "/assets/restaurantprofile.png"}
          className="w-full h-64 object-cover"
          alt="Restaurant"
        />

        {/* INFO */}
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <p className="text-gray-300">{restaurant.description}</p>

          <div className="flex justify-center gap-2 mt-2 text-yellow-400">
            <Star size={20} />
            <span className="font-semibold">
              {restaurant.averageRating
                ? restaurant.averageRating.toFixed(1)
                : "No ratings yet"}
            </span>
          </div>
        </div>

        {/* MENU */}
        <div className="px-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Menu</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleDishes.map((item) => (
              <div
                key={item._id}
                className="bg-black/70 border border-white/20 rounded-xl p-3"
              >
                <img
                  src={item.image || "/assets/dishimage.jpg"}
                  className="w-full h-24 object-cover rounded-md"
                  alt={item.name}
                />
                <p className="mt-2 font-semibold">{item.name}</p>
                <p className="text-gray-300 text-sm">₹{item.price}</p>

                <button
                  onClick={() => addToCart(item)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 mt-2 rounded"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* REVIEWS GRID */}
        <div className="px-6 mt-12 mb-10">
          <h2 className="text-xl font-bold mb-6">Reviews</h2>

          {user && !hasReviewed && (
            <div className="bg-black/70 p-4 rounded-xl mb-6 max-w-lg">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeReviews.map((review) => {
              const isOwner = user && review.customerId?._id === user._id;
              const isEditing = editingReviewId === review._id;

              return (
                <div
                  key={review._id}
                  className="bg-black/70 p-4 rounded-xl border border-white/20 flex flex-col"
                >
                  <p className="font-semibold">
                    {review.customerId?.name || "User"}
                  </p>

                  <div className="flex text-yellow-400 mb-1">
                    {Array.from({
                      length: isEditing ? editRating : review.rating,
                    }).map((_, i) => (
                      <Star key={i} size={14} />
                    ))}
                  </div>

                  {!isEditing ? (
                    <p className="text-gray-300 text-sm">{review.comment}</p>
                  ) : (
                    <>
                      <div className="flex gap-2 my-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={18}
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

                  {isOwner && (
                    <div className="flex gap-2 text-sm mt-auto pt-3">
                      {!isEditing ? (
                        <>
                          <button
                            onClick={() => startEditReview(review)}
                            className="text-blue-400"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteReview(review._id)}
                            className="text-red-400"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => updateReview(review._id)}
                            className="text-green-400"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-400"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
