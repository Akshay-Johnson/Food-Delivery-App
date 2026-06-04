import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { ArrowLeft, Star, ShoppingCart, Search, Flame, MapPin, Sparkles, MessageSquare } from "lucide-react";
import Toast from "../../../components/toast/toast";
import ResponsiveImage from "../../../components/ResponsiveImage";

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const getAvatar = (customer) => {
    if (!customer) return "/assets/defaultprofile.png";
    return (
      customer.profileImage ||
      customer.avatar ||
      "/assets/defaultprofile.png"
    );
  };

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-400 font-medium">Loading store details...</p>
      </div>
    );
  }
  
  if (!restaurant) return <p className="text-white p-6">Restaurant record not located.</p>;

  return (
    <div className="relative min-h-screen text-white bg-zinc-950/40">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-30">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-[2px]"
          style={{ backgroundImage: "url('/assets/restaurant/bg.webp')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950 pointer-events-none" />
      </div>

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/60 backdrop-blur-xl border-b border-white/5 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>

          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Restaurant Menu</h2>

          <button
            onClick={() => navigate("/customer/cart")}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition shadow-lg shadow-orange-500/10 cursor-pointer"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">

        {/* HERO CARD DETAILS */}
        <div className="bg-black/70 border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative h-48 sm:h-64 bg-zinc-950">
            <ResponsiveImage
              src={restaurant.image || "/assets/restaurant.png"}
              className="w-full h-full object-cover opacity-85"
              alt={restaurant.name || "restaurant"}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent pointer-events-none" />
            
            {/* HERO OVERLAY DETAILS */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{restaurant.name}</h1>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-xl">{restaurant.description}</p>
              </div>

              <div className="flex gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold shadow">
                  <Star size={12} className="fill-amber-400" />
                  {restaurant.averageRating ? restaurant.averageRating.toFixed(1) : "N/A"}
                </span>
                {restaurant.cuisineType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-bold">
                    {restaurant.cuisineType}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MENU + REVIEWS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-20">
          
          {/* MENU SECTION (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Flame className="text-orange-500" size={20} />
                <h2 className="text-xl font-bold">{showTrending ? "Trending Items" : "Explore Menu"}</h2>
              </div>

              <div className="flex items-center gap-2">
                {/* SEARCH MENU */}
                <div className="relative w-full sm:w-60">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all duration-300 text-xs shadow-inner"
                  />
                </div>

                <button
                  onClick={() => {
                    setShowTrending((v) => !v);
                    setSearchTerm("");
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer shrink-0 ${
                    showTrending 
                      ? "bg-orange-600 border-orange-600 text-white" 
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
                  }`}
                >
                  Trending
                </button>
              </div>
            </div>

            {/* CATEGORIES TRACK */}
            <div className="flex gap-2 flex-wrap pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full capitalize text-xs font-bold transition border cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* DISHES LIST */}
            {visibleDishes.length === 0 ? (
              <div className="bg-black/70 border border-white/15 rounded-2xl py-12 text-center text-gray-500 text-sm">
                No cuisines match your selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {visibleDishes.map((item) => (
                  <div
                    key={item._id}
                    className={`bg-black/70 border border-white/15 rounded-2xl overflow-hidden p-3 flex flex-col justify-between hover:border-orange-500/30 transition duration-300 shadow-lg min-h-[280px] ${
                      !item.isAvailable ? "opacity-65" : ""
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="relative h-28 w-full bg-white/5 rounded-xl overflow-hidden">
                        <ResponsiveImage
                          src={item.image || "/assets/dishimage.jpg"}
                          className="w-full h-full object-cover"
                          alt={item.name}
                          loading="lazy"
                        />
                        {!item.isAvailable && (
                          <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Unavailable
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                          <p className="text-emerald-400 font-black text-sm">₹{item.price}</p>
                        </div>
                        <p className="text-gray-400 text-xs line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 mt-3">
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!item.isAvailable}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase text-white cursor-pointer transition ${
                          item.isAvailable
                            ? "bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700"
                            : "bg-gray-700 cursor-not-allowed text-gray-500"
                        }`}
                      >
                        {item.isAvailable ? "Add to Cart" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAGINATION PANEL */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-8 border-t border-white/10 pt-6">
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition ${
                        currentPage === i + 1
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg"
                          : "bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* REVIEWS PANEL (1/3 width) */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <MessageSquare className="text-orange-500" size={20} />
              <h2 className="text-xl font-bold">Feedback ({safeReviews.length})</h2>
            </div>

            {safeReviews.length === 0 ? (
              <div className="bg-black/70 border border-white/15 rounded-2xl py-12 text-center text-gray-500 text-sm">
                No customer ratings posted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {safeReviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-black/70 border border-white/15 rounded-2xl p-4 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <ResponsiveImage
                        src={getAvatar(review.customerId)}
                        alt="user"
                        className="w-9 h-9 rounded-full object-cover border border-white/10 bg-white/5"
                        fallbackSrc="/assets/defaultprofile.png"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white text-xs truncate">
                          {review.customerId?.name || "Anonymous User"}
                        </p>
                        
                        {/* STAR RATINGS */}
                        <div className="flex gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              size={10}
                              className={
                                review.rating >= n
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-700"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-300 text-xs leading-relaxed font-medium">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
