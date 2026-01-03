import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { ArrowLeft, Star, ShoppingCart } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  /* ======================
     REVIEW STATE
  ====================== */
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  /* ======================
     MENU / FILTER STATE
  ====================== */
  const [showTrending, setShowTrending] = useState(false);
  const [trendingDishes, setTrendingDishes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  /* ======================
     PAGINATION
  ====================== */
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  /* ======================
     LOAD DATA
  ====================== */
  useEffect(() => {
    loadRestaurantDetails();
    loadReviews();
    loadTrendingDishes();
    setCurrentPage(1);
    setSelectedCategory("all");
  }, [id]);

  const loadRestaurantDetails = async () => {
    try {
      const res = await api.get(`/api/restaurants/${id}/details`);
      setRestaurant(res.data.restaurant);
      setDishes((res.data.dishes || []).filter((d) => d.isAvailable));
    } catch (err) {
      console.error("Error loading restaurant:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingDishes = async () => {
    try {
      const res = await api.get(`/api/menu/trending?restaurantId=${id}`);
      setTrendingDishes(res.data || []);
    } catch (err) {
      console.error("Error loading trending dishes:", err);
      setTrendingDishes([]);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await api.get(`/api/reviews/${id}`);
      setReviews(Array.isArray(res.data?.reviews) ? res.data.reviews : []);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setReviews([]);
    }
  };

  /* ======================
     CART
  ====================== */
  const addToCart = async (dish) => {
    try {
      await api.post("/api/cart/add", {
        itemId: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: 1,
        restaurantId: id,
      });

      setToast({ type: "success", message: "Item added to cart" });
      return;
    } catch (error) {
      const msg = error.response?.data?.message;

      if (msg?.includes("one restaurant")) {
        const confirmClear = window.confirm(
          "Your cart contains items from another restaurant. Clear cart and continue?"
        );

        if (!confirmClear) return;

        try {
          await api.delete("/api/cart/clear");

          await api.post("/api/cart/add", {
            itemId: dish._id,
            name: dish.name,
            price: dish.price,
            quantity: 1,
            restaurantId: id,
          });

          setToast({ type: "success", message: "Item added to cart" });
          return;
        } catch (retryErr) {
          console.error("Retry failed:", retryErr.response?.data);
          setToast({
            type: "error",
            message: "Failed to add item after clearing cart",
          });
          return;
        }
      }

      setToast({
        type: "error",
        message: msg || "Failed to add item to cart",
      });
    }
  };

  /* ======================
     FILTER + PAGINATION LOGIC
  ====================== */
  const baseDishes = showTrending ? trendingDishes : dishes;

  const filteredDishes =
    selectedCategory === "all"
      ? baseDishes
      : baseDishes.filter((d) => d.category === selectedCategory);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleDishes = filteredDishes.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredDishes.length / ITEMS_PER_PAGE);

  const categories = [
    "all",
    ...Array.from(new Set(baseDishes.map((d) => d.category))),
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, showTrending]);

  /* ======================
     REVIEWS
  ====================== */
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const hasReviewed =
    !!user && safeReviews.some((r) => r.customerId?._id === user._id);

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
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  const updateReview = async (reviewId) => {
    try {
      await api.put(`/api/reviews/${id}/${reviewId}`, {
        rating: editRating,
        comment: editComment,
      });
      setEditingReviewId(null);
      loadReviews();
    } catch (err) {
      console.error("Error updating review:", err);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/api/reviews/${id}/${reviewId}`);
      setToast({ type: "success", message: "Review deleted" });
      loadReviews();
    } catch {
      setToast({ type: "error", message: "Failed to delete review" });
    }
  };

  /* ======================
     UI STATES
  ====================== */
  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (!restaurant)
    return <p className="text-white p-6">Restaurant not found</p>;

  return (
    <div className="relative min-h-screen text-white">
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

      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 bg-black/50 p-2 rounded-full"
      >
        <ArrowLeft size={20} />
      </button>

      <img
        src={restaurant.image || "/assets/restaurant.png"}
        className="w-full h-64 object-cover rounded-b-xl"
        alt="Restaurant"
      />

      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
        <p className="text-gray-300">{restaurant.description}</p>
        <div className="flex justify-center gap-2 mt-2 text-yellow-400">
          <Star size={20} />
          <span>
            {restaurant.averageRating
              ? restaurant.averageRating.toFixed(1)
              : "No ratings yet"}
          </span>
        </div>
      </div>

      {/* MENU */}
      <div className="px-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {showTrending ? "🔥 Trending Dishes" : "Menu"}
          </h2>

          <div className="flex gap-3">
            <button
              onClick={() => setShowTrending((v) => !v)}
              className={`px-4 py-2 rounded transition font-medium
    ${
      showTrending
        ? "bg-orange-600 text-white shadow-lg scale-105"
        : "bg-white/20 text-white hover:bg-white/30"
    }
  `}
            >
              🔥 Trending
            </button>

            <button
              onClick={() => navigate("/customer/cart")}
              className="bg-blue-600 px-4 py-2 rounded"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1 rounded-full capitalize ${
                selectedCategory === cat
                  ? "bg-green-600"
                  : "bg-white/20 hover:bg-white/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* DISH GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
          {visibleDishes.map((item) => (
            <div
              key={item._id}
              className="bg-black/70 border border-white/20 rounded-xl p-3 flex flex-col h-auto gap-2"
            >
              <img
                src={item.image || "/assets/dishimage.jpg"}
                className="w-full h-28 object-cover rounded"
                alt={item.name}
              />

              <div className="flex justify-between mt-2">
                <p className="font-semibold">{item.name}</p>
                {showTrending && item.orderCount && (
                  <span className="text-xs bg-orange-600 px-2 py-1 rounded self-end">
                    🔥 {item.orderCount}
                  </span>
                )}
                <p className="text-green-500">₹{item.price}</p>
              </div>

              <p className="text-gray-400 text-sm mt-1">{item.description}</p>

              <button
                onClick={() => addToCart(item)}
                className="mt-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-3 py-1 rounded"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded disabled:opacity-40"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === i + 1
                    ? "bg-gradient-to-r from-orange-500 to-red-600"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* REVIEWS */}
      <div className="px-6 mt-12 mb-10 border-t border-white/20 pt-6">
        <h2 className="text-xl font-bold mb-6">Reviews</h2>

        {user && !hasReviewed && (
          <div className="bg-black/70 p-4 rounded mb-6 max-w-lg">
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
              value={comment}
              placeholder="Write your review..."
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
          {safeReviews.map((review) => (
            <div
              key={review._id}
              className="bg-black/70 p-4 rounded border border-white/20"
            >
              <p className="font-semibold">
                {review.customerId?.name || "User"}
              </p>
              {editingReviewId === review._id ? (
                <>
                  {/* Rating */}
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={18}
                        className={`cursor-pointer ${
                          editRating >= n ? "text-yellow-400" : "text-gray-500"
                        }`}
                        onClick={() => setEditRating(n)}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <textarea
                    className="w-full bg-black/40 p-2 rounded text-sm"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                  />

                  {/* Actions */}
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => updateReview(review._id)}
                      className="bg-green-600 px-3 py-1 rounded text-sm"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => setEditingReviewId(null)}
                      className="bg-gray-600 px-3 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={16}
                        className={
                          review.rating >= n
                            ? "text-yellow-400"
                            : "text-gray-600"
                        }
                      />
                    ))}
                  </div>

                  <p className="text-gray-300 text-sm">{review.comment}</p>
                </>
              )}

              {user &&
                review.customerId?._id === user._id &&
                editingReviewId !== review._id && (
                  <div className="flex gap-3 mt-2 text-sm">
                    <button
                      onClick={() => {
                        setEditingReviewId(review._id);
                        setEditRating(review.rating);
                        setEditComment(review.comment);
                      }}
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
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
