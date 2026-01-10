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
     SEARCH + FILTER STATE
  ====================== */
  const [searchTerm, setSearchTerm] = useState("");
  const [showTrending, setShowTrending] = useState(false);
  const [trendingDishes, setTrendingDishes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  /* ======================
     PAGINATION
  ====================== */
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  /* ======================
     REVIEW STATE
  ====================== */
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const safeReviews = Array.isArray(reviews)
    ? reviews.filter((r) => !r.isHidden)
    : [];

  /* ======================
     LOAD DATA
  ====================== */
  useEffect(() => {
    setLoading(true);
    loadRestaurantDetails();
    loadReviews();
    loadTrendingDishes();

    setCurrentPage(1);
    setSelectedCategory("all");
    setSearchTerm("");
    setShowTrending(false);
  }, [id]);

  const loadRestaurantDetails = async () => {
    try {
      const res = await api.get(`/api/restaurants/${id}/details`);
      setRestaurant(res.data?.restaurant || null);
      setDishes(res.data?.dishes || []);
    } catch (err) {
      console.error("Error loading restaurant:", err);
      setRestaurant(null);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingDishes = async () => {
    try {
      const res = await api.get(`/api/menu/trending?restaurantId=${id}`);
      setTrendingDishes(res.data || []);
    } catch {
      setTrendingDishes([]);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await api.get(`/api/reviews/${id}`);
      setReviews(res.data?.reviews || []);
    } catch {
      setReviews([]);
    }
  };

  /* ======================
     AVATAR HELPER
  ====================== */
  const getAvatar = (customer) => {
    if (!customer) return "/assets/defaultprofile.png";
    return (
      customer.profileImage ||
      customer.avatar ||
      "/assets/defaultprofile.png"
    );
  };

  /* ======================
     CART
  ====================== */
  const addToCart = async (dish) => {
    if (!dish.isAvailable) {
      setToast({ type: "error", message: "This item is currently unavailable." });
      return;
    }

    try {
      await api.post("/api/cart/add", {
        itemId: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: 1,
        restaurantId: id,
      });
      setToast({ type: "success", message: "Item added to cart" });
    } catch (error) {
      const msg = error.response?.data?.message;

      if (msg?.includes("one restaurant")) {
        if (!window.confirm("Clear cart and continue?")) return;
        await api.delete("/api/cart/clear");
        await api.post("/api/cart/add", {
          itemId: dish._id,
          name: dish.name,
          price: dish.price,
          quantity: 1,
          restaurantId: id,
        });
        setToast({ type: "success", message: "Item added to cart" });
      } else {
        setToast({ type: "error", message: msg || "Failed to add item" });
      }
    }
  };

  /* ======================
     FILTER + PAGINATION
  ====================== */
  const baseDishes = showTrending ? trendingDishes : dishes;

  const filteredDishes = baseDishes.filter((d) => {
    const matchesCategory =
      selectedCategory === "all" || d.category === selectedCategory;

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      d.name?.toLowerCase().includes(term) ||
      d.description?.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleDishes = filteredDishes.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredDishes.length / ITEMS_PER_PAGE);

  const categories = [
    "all",
    ...Array.from(new Set(baseDishes.map((d) => d.category).filter(Boolean))),
  ];

  useEffect(() => setCurrentPage(1), [
    selectedCategory,
    showTrending,
    searchTerm,
  ]);

  /* ======================
     UI
  ====================== */
  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (!restaurant) return <p className="text-white p-6">Not found</p>;

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
        <Toast {...toast} onClose={() => setToast(null)} />
      )}

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-3 left-3 sm:top-4 sm:left-4 bg-black/50 p-2 rounded-full"
      >
        <ArrowLeft size={18} />
      </button>

      {/* HERO IMAGE */}
      <img
        src={restaurant.image || "/assets/restaurant.png"}
        className="w-full h-48 sm:h-64 object-cover rounded-b-xl"
        alt="restaurant"
      />

      {/* HEADER */}
      <div className="p-4 text-center">
        <h1 className="text-xl sm:text-2xl font-bold">{restaurant.name}</h1>
        <p className="text-gray-300 text-sm sm:text-base">
          {restaurant.description}
        </p>
        <div className="flex justify-center gap-2 mt-2 text-yellow-400">
          <Star size={18} />
          <span>
            {restaurant.averageRating
              ? restaurant.averageRating.toFixed(1)
              : "No ratings yet"}
          </span>
        </div>
      </div>

      {/* MENU */}
      <div className="px-4 sm:px-6 mt-6">
        {/* CONTROLS */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-center lg:text-left">
            {showTrending ? "🔥 Trending Dishes" : "Menu"}
          </h2>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
            />

            <button
              onClick={() => {
                setShowTrending((v) => !v);
                setSearchTerm("");
              }}
              className={`px-4 py-2 rounded ${
                showTrending ? "bg-orange-600" : "bg-white/20 hover:bg-white/30"
              }`}
            >
              🔥 Trending
            </button>

            <button
              onClick={() => navigate("/customer/cart")}
              className="bg-blue-600 px-4 py-2 rounded flex justify-center"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>

        {/* CATEGORY */}
        <div className="flex gap-2 flex-wrap justify-center sm:justify-start mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1 rounded-full capitalize text-sm ${
                selectedCategory === cat ? "bg-green-600" : "bg-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* DISH GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {visibleDishes.map((item) => (
            <div
              key={item._id}
              className={`relative bg-black/70 border border-white/20 rounded-xl p-3 flex flex-col ${
                !item.isAvailable ? "opacity-60" : ""
              }`}
            >
              <img
                src={item.image || "/assets/dishimage.jpg"}
                className="w-full h-32 object-cover rounded"
                alt={item.name}
              />

              {!item.isAvailable && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  Unavailable
                </span>
              )}

              <div className="flex justify-between mt-2">
                <p className="font-semibold text-sm sm:text-base">
                  {item.name}
                </p>
                <p className="text-green-500 text-sm sm:text-base">
                  ₹{item.price}
                </p>
              </div>

              <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">
                {item.description}
              </p>

              <button
                onClick={() => addToCart(item)}
                disabled={!item.isAvailable}
                className={`mt-auto px-3 py-1 rounded text-sm text-white ${
                  item.isAvailable
                    ? "bg-gradient-to-r from-orange-500 to-red-600"
                    : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                {item.isAvailable ? "Add to Cart" : "Unavailable"}
              </button>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 rounded text-sm ${
                  currentPage === i + 1 ? "bg-orange-600" : "bg-white/20"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* REVIEWS */}
      <div className="px-4 sm:px-6 mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {safeReviews.map((review) => (
          <div
            key={review._id}
            className="bg-black/70 p-4 rounded border border-white/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src={getAvatar(review.customerId)}
                alt="user"
                className="w-9 h-9 rounded-full object-cover border border-white/30"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/assets/defaultprofile.png";
                }}
              />

              <div>
                <p className="font-semibold text-sm">
                  {review.customerId?.name || "User"}
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={12}
                      className={
                        review.rating >= n
                          ? "text-yellow-400"
                          : "text-gray-600"
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-gray-300 text-sm mt-2">
              {review.comment}
            </p>

            {user && review.customerId?._id === user._id && (
              <div className="flex gap-4 mt-3 text-sm">
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
  );
}
