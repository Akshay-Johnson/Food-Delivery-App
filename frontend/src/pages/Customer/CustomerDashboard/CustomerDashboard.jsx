import {
  Search,
  Utensils,
  Coffee,
  Pizza,
  IceCream,
  Truck,
  User,
  ShoppingCart,
  LogOut,
  Home,
  SlidersHorizontal,
  Star,
  MapPin,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Flame,
  ArrowRight
} from "lucide-react";

import { useState, useEffect, useRef, useMemo } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Toast from "../../../components/toast/toast";
import ResponsiveImage from "../../../components/ResponsiveImage";

export default function CustomerDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [trendingDishes, setTrendingDishes] = useState([]);
  const [allDishes, setAllDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    restaurants: [],
    dishes: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const searchTimeout = useRef(null);

  const baseDishes = selectedCategory ? allDishes : trendingDishes;
  const availableDishes = baseDishes.filter((d) => d.isAvailable);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [restaurantPage, setRestaurantPage] = useState(1);
  const restaurantsPerPage = 6;

  const [toast, setToast] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
    fetchTrendingDishes();
    fetchDefaultAddress();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchAllDishes();
    }
  }, [selectedCategory]);

  async function fetchDefaultAddress() {
    try {
      const response = await api.get("/api/address/default");
      setDefaultAddress(response.data || null);
    } catch (error) {
      console.error("Error fetching default address:", error);
    }
  }

  const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDistanceStr = (restaurantLocation) => {
    if (!defaultAddress?.location?.lat || !restaurantLocation?.lat) return null;
    const dist = getDistanceInKm(
      defaultAddress.location.lat,
      defaultAddress.location.lng,
      restaurantLocation.lat,
      restaurantLocation.lng
    );
    return `${dist.toFixed(1)} km`;
  };

  async function fetchRestaurants() {
    try {
      const response = await api.get("/api/restaurants");
      setRestaurants(response.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  }

  async function fetchTrendingDishes() {
    try {
      const response = await api.get("/api/menu/trending/global");
      setTrendingDishes(response.data);
    } catch (error) {
      console.error("Error fetching trending dishes:", error);
    }
  }

  async function fetchAllDishes() {
    try {
      const response = await api.get("/api/menu/all");
      setAllDishes(response.data.filter((d) => d.isAvailable));
    } catch (error) {
      console.error("Error fetching all dishes:", error);
    }
  }

  const performSearch = (text) => {
    setSearchQuery(text);
    clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      if (!text.trim()) {
        setIsSearching(false);
        setSearchResults({ restaurants: [], dishes: [] });
        return;
      }

      try {
        const { data } = await api.get(`/api/search?q=${text}`);
        setSearchResults({
          restaurants: data.restaurants || [],
          dishes: (data.dishes || []).filter((d) => d.isAvailable),
        });
        setIsSearching(true);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults({ restaurants: [], dishes: [] });
        setIsSearching(true);
      }
    }, 400);
  };

  const filteredRestaurants = (
    searchQuery.trim()
      ? restaurants.filter((r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : restaurants
  ).sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));

  const restaurantTotalPages = Math.ceil(
    filteredRestaurants.length / restaurantsPerPage
  );

  const paginatedRestaurants = filteredRestaurants.slice(
    (restaurantPage - 1) * restaurantsPerPage,
    restaurantPage * restaurantsPerPage
  );

  useEffect(() => {
    setRestaurantPage(1);
  }, [searchQuery, restaurants]);

  const categoryDishes = useMemo(() => {
    let list = [...availableDishes];

    if (selectedCategory) {
      const cat = selectedCategory.trim().toLowerCase();
      list = list.filter((d) => d.category?.trim().toLowerCase() === cat);
    }

    if (priceRange !== "all") {
      list = list.filter((d) => {
        if (priceRange === "low") return d.price < 200;
        if (priceRange === "mid") return d.price >= 200 && d.price <= 400;
        if (priceRange === "high") return d.price > 400;
        return true;
      });
    }

    if (sortBy === "priceLow") list.sort((a, b) => a.price - b.price);
    if (sortBy === "priceHigh") list.sort((a, b) => b.price - a.price);

    return list;
  }, [availableDishes, selectedCategory, priceRange, sortBy]);

  const totalPages = Math.ceil(categoryDishes.length / itemsPerPage);
  const paginatedDishes = categoryDishes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, sortBy, searchQuery]);

  const addToCart = async (dish) => {
    try {
      await api.post("/api/cart/add", {
        itemId: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: 1,
        restaurantId: dish.restaurantId,
      });
      setToast({ message: "Item added to cart!", type: "success" });
    } catch {
      setToast({ message: "Failed to add item to cart.", type: "error" });
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden text-white bg-zinc-950/40">
      {/* Dynamic Ambient Background */}
      <ResponsiveImage
        src="/assets/restaurant/bg.webp"
        alt="background"
        className="fixed inset-0 -z-30 h-full w-full object-cover pointer-events-none opacity-40 filter blur-[2px]"
        priority
      />
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-zinc-950 pointer-events-none"></div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* STYLISH HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/60 backdrop-blur-xl shadow-lg">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-red-600 text-base font-black shadow-lg shadow-orange-500/20">
              DX
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                DineX
              </h1>
              {defaultAddress && (
                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="text-orange-500" />
                  <span className="truncate max-w-[150px] sm:max-w-[240px]">
                    {defaultAddress.addressLine1}, {defaultAddress.city}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DashboardAction
              icon={User}
              label="Profile"
              onClick={() => navigate("/customer/profile")}
            />
            <DashboardAction
              icon={Home}
              label="Address"
              onClick={() => navigate("/customer/address")}
            />
            <DashboardAction
              icon={ShoppingCart}
              label="Cart"
              onClick={() => navigate("/customer/cart")}
            />
            <DashboardAction
              icon={Truck}
              label="Orders"
              onClick={() => navigate("/customer/orders")}
            />
            <button
              className="inline-flex shrink-0 items-center justify-center h-9 w-9 sm:h-auto sm:w-auto sm:gap-2 rounded-xl border border-red-500/20 bg-red-600 hover:bg-red-700 sm:px-4 py-2 text-xs font-bold text-white transition shadow-lg shadow-red-500/10 cursor-pointer"
              onClick={() => {
                localStorage.removeItem("customerToken");
                navigate("/customer/login");
              }}
              title="Logout"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD HERO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        
        {/* BANNER SECTOR */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600/90 to-red-600/90 p-8 sm:p-12 shadow-2xl flex flex-col justify-center min-h-[220px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-lg space-y-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-orange-200">
              <Sparkles size={12} className="text-amber-300" />
              Special offers inside
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Delicious Food,<br />Delivered Instantly.
            </h2>
            <p className="text-orange-100 text-sm">
              Discover unique recipes, trending bistros, and custom deals just for you.
            </p>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="relative max-w-2xl mx-auto space-y-4">
          <div className="flex items-center bg-black/60 backdrop-blur-md border border-white/15 shadow-xl rounded-2xl px-4 py-3">
            <Search className="text-gray-400 mr-2 shrink-0" size={20} />
            <input
              type="text"
              placeholder="Search dishes, cuisines, or restaurants..."
              value={searchQuery}
              onChange={(e) => performSearch(e.target.value)}
              className="flex-1 px-2 py-1 text-sm sm:text-base text-white placeholder-gray-500 bg-transparent outline-none"
            />
            <div className="h-6 w-px bg-white/10 mx-2" />
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`p-2 rounded-xl transition border cursor-pointer ${
                showFilters 
                  ? "bg-orange-500 border-orange-500 text-white" 
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
              }`}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {/* DYNAMIC FILTER POPUP */}
          {showFilters && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Price Range
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="all">All prices</option>
                    <option value="low">Under ₹200</option>
                    <option value="mid">₹200 – ₹400</option>
                    <option value="high">Above ₹400</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Sort Cuisines</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Default sorting</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => {
                    setPriceRange("all");
                    setSortBy("");
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold cursor-pointer"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-xs font-bold cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SEARCH RESULTS IF SEARCHING */}
        {isSearching && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold border-l-4 border-orange-500 pl-3">Search Results</h3>

            {/* Restaurants */}
            {searchResults.restaurants.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Matched Bistro Stores</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.restaurants.map((r) => (
                    <div
                      key={r._id}
                      onClick={() => navigate(`/customer/restaurant/${r._id}`)}
                      className="bg-black/70 border border-white/15 rounded-2xl overflow-hidden hover:border-orange-500/30 hover:scale-[1.01] transition duration-300 cursor-pointer shadow-lg flex flex-col"
                    >
                      <div className="relative h-40 bg-black/20">
                        <ResponsiveImage
                          src={r.image || "/assets/restaurant.png"}
                          loading="lazy"
                          alt={r.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-white text-base truncate">{r.name}</h4>
                            <span className="flex items-center gap-0.5 text-xs font-bold text-amber-400 shrink-0 bg-amber-500/10 px-2 py-0.5 rounded-full">
                              <Star size={10} className="fill-amber-400" />
                              {r.averageRating?.toFixed(1) || "0.0"}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">{r.description}</p>
                        </div>
                        {getDistanceStr(r.location) && (
                          <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            <span>Distance</span>
                            <span className="text-orange-400 normal-case">{getDistanceStr(r.location)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dishes */}
            {searchResults.dishes.length > 0 && (
              <div className="space-y-3 pt-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Matched Menu Items</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {searchResults.dishes.map((d) => (
                    <div
                      key={d._id}
                      className="bg-black/70 border border-white/15 rounded-2xl overflow-hidden hover:border-orange-500/30 transition duration-300 shadow-lg flex flex-col justify-between p-3"
                    >
                      <ResponsiveImage
                        src={d.image || "/assets/dishimage.jpg"}
                        loading="lazy"
                        className="h-28 w-full object-cover rounded-xl"
                        alt={d.name}
                      />
                      <div className="space-y-2 pt-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-white text-sm truncate">{d.name}</h4>
                          <p className="text-gray-400 text-[10px] line-clamp-2 mt-1 leading-relaxed">{d.description}</p>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <p className="text-emerald-400 font-black text-sm">₹{d.price}</p>
                          <button
                            onClick={() => addToCart(d)}
                            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-3 py-1 rounded-lg text-[10px] font-bold uppercase text-white cursor-pointer"
                          >
                            Add +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {searchResults.restaurants.length === 0 && searchResults.dishes.length === 0 && (
              <div className="bg-black/75 border border-white/10 rounded-2xl py-12 text-center text-gray-500 text-sm">
                No matching cuisines or stores located. Try searching another term!
              </div>
            )}
          </div>
        )}

        {/* ORIGINAL TABS & RECOMMENDATIONS GRID */}
        {!isSearching && (
          <>
            {/* CATEGORIES SECTION */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categories Cuisines</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  { name: "Pizza", icon: Pizza, image: "/assets/categories/pizza.jpg" },
                  { name: "Desserts", icon: IceCream, image: "/assets/categories/dessert.jpg" },
                  { name: "Meals", icon: Utensils, image: "/assets/categories/meal.jpg" },
                  { name: "Drinks", icon: Coffee, image: "/assets/categories/drinks.jpg" },
                  { name: "Combo", icon: Coffee, image: "/assets/categories/combos.png" },
                ].map((c, i) => {
                  const isSelected = selectedCategory === c.name;
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedCategory((prev) => (prev === c.name ? null : c.name))}
                      className={`group relative h-24 cursor-pointer overflow-hidden rounded-2xl border transition shadow-lg ${
                        isSelected ? "border-orange-500 ring-2 ring-orange-500/20" : "border-white/10"
                      }`}
                    >
                      <ResponsiveImage
                        src={c.image}
                        alt={c.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/60 transition group-hover:bg-black/40"></div>
                      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                        <c.icon size={24} className={`mb-1 transition-all ${isSelected ? "text-orange-400 scale-110" : "text-white"}`} />
                        <p className={`text-xs font-bold tracking-wide ${isSelected ? "text-orange-400 font-black" : "text-white"}`}>
                          {c.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FOOD ITEMS SECTION */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Flame className="text-orange-500" size={18} />
                <h3 className="text-xl font-bold">
                  {selectedCategory ? `${selectedCategory} Dishes` : "Trending Globally"}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {paginatedDishes.map((dish) => {
                  const restaurant = restaurants.find((r) => r._id === dish.restaurantId);
                  return (
                    <div
                      key={dish._id}
                      className="bg-black/70 border border-white/20 rounded-2xl p-3 flex flex-col justify-between hover:border-orange-500/30 transition duration-300 shadow-lg min-h-[300px]"
                    >
                      <div className="space-y-2">
                        <div className="relative h-28 w-full bg-white/5 rounded-xl overflow-hidden">
                          <ResponsiveImage
                            src={dish.image || "/assets/dishimage.jpg"}
                            loading="lazy"
                            alt={dish.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-bold text-white text-sm truncate">{dish.name}</h4>
                            <span className="text-[10px] font-bold text-orange-400 shrink-0 bg-orange-500/10 px-2 py-0.5 rounded-full">
                              {dish.orderCount ?? 0} orders
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs line-clamp-2 mt-1 leading-relaxed">{dish.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-white/5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 font-bold truncate">Store: {restaurant ? restaurant.name : "N/A"}</span>
                          <span className="text-emerald-400 font-black text-sm">₹{dish.price}</span>
                        </div>
                        <button
                          onClick={() => addToCart(dish)}
                          className="w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 py-2 rounded-xl text-xs font-bold tracking-wide uppercase text-white cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 mt-8 border-t border-white/10 pt-6">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition border border-white/5 text-xs font-bold"
                  >
                    Previous
                  </button>
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
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition border border-white/5 text-xs font-bold"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* POPULAR RESTAURANTS SECTION */}
            <div className="space-y-4 pt-4 pb-16">
              <div className="flex items-center gap-2">
                <Utensils className="text-orange-500" size={18} />
                <h3 className="text-xl font-bold">Restaurants Nearby</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedRestaurants.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => navigate(`/customer/restaurant/${r._id}`)}
                    className="bg-black/70 border border-white/15 rounded-2xl overflow-hidden hover:border-orange-500/30 hover:scale-[1.01] transition duration-300 cursor-pointer shadow-lg flex flex-col group"
                  >
                    <div className="relative h-44 bg-black/20 overflow-hidden">
                      <ResponsiveImage
                        src={r.image || "/assets/restaurant.png"}
                        loading="lazy"
                        alt={r.name}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-white text-base truncate group-hover:text-orange-400 transition">{r.name}</h4>
                          <span className="flex items-center gap-0.5 text-xs font-bold text-amber-400 shrink-0 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                            <Star size={10} className="fill-amber-400" />
                            {r.averageRating?.toFixed(1) || "0.0"}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">{r.description}</p>
                      </div>

                      {getDistanceStr(r.location) && (
                        <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          <span>Delivery Range</span>
                          <span className="text-orange-400 normal-case">{getDistanceStr(r.location)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* RESTAURANTS PAGINATION */}
              {restaurantTotalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 mt-8 border-t border-white/10 pt-6">
                  <button
                    disabled={restaurantPage === 1}
                    onClick={() => setRestaurantPage((p) => p - 1)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition border border-white/5 text-xs font-bold"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: restaurantTotalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setRestaurantPage(i + 1)}
                        className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition ${
                          restaurantPage === i + 1
                            ? "bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg"
                            : "bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={restaurantPage === restaurantTotalPages}
                    onClick={() => setRestaurantPage((p) => p + 1)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition border border-white/5 text-xs font-bold"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DashboardAction({ icon, label, onClick }) {
  const Icon = icon;
  return (
    <button
      onClick={onClick}
      className="inline-flex shrink-0 items-center justify-center h-9 w-9 sm:h-auto sm:w-auto sm:gap-2 rounded-xl border border-white/10 bg-white/5 sm:px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10 shadow cursor-pointer"
      title={label}
    >
      <Icon size={14} className="text-gray-300" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
