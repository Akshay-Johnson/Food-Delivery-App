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
} from "lucide-react";

import { useState, useEffect } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Toast from "../../../components/toast/toast";
import ResponsiveImage from "../../../components/ResponsiveImage";
import { useRef } from "react";
import { useMemo } from "react";

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

  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
    fetchTrendingDishes();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchAllDishes();
    }
  }, [selectedCategory]);

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
      const response = await api.get("/api/menu/all"); // OR /api/menu/all
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
    }, 400); // ⏳ debounce delay
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

      setToast({ message: "🍔 Item added to cart!", type: "success" });
    } catch {
      setToast({ message: "Failed to add item to cart.", type: "error" });
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      <ResponsiveImage
        src="/assets/restaurant/bg.jpg"
        alt="background"
        className="fixed inset-0 -z-20 h-full w-full object-cover pointer-events-none"
        priority
      />

      <div className="fixed inset-0 -z-10 bg-black/70 backdrop-blur-sm pointer-events-none"></div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/55 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3 sm:items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-lg font-black shadow-lg shadow-orange-500/30">
                D
              </div>

              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  DineX
                </h1>
                <p className="text-sm text-gray-300 sm:text-base">
                  Welcome back, discover your next meal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
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
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-red-500/20 bg-red-600/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                onClick={() => {
                  localStorage.removeItem("customerToken");
                  navigate("/customer/login");
                }}
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 sm:hidden">
            Tip: swipe the action row to access profile, cart, and orders.
          </p>
        </div>
      </header>

      <div className="relative z-10">
        <div className="pt-6 sm:pt-8">
          <div className="relative z-10">

            {/* WELCOME SECTION */}
            <section className="px-4 sm:px-6 py-16 sm:py-20">
              <div className="mt-4 relative w-full sm:max-w-2xl mx-auto">
                {/* SEARCH BAR */}
                <div className="flex items-center bg-black/70 backdrop-blur-lg border border-white/30 shadow-lg rounded-full px-3 sm:px-4 py-2">
                  <Search className="text-gray-300 mr-2 shrink-0" />

                  <input
                    type="text"
                    placeholder="Search for dishes or restaurants..."
                    value={searchQuery}
                    onChange={(e) => performSearch(e.target.value)}
                    className="flex-1 px-2 sm:px-3 py-2 text-sm sm:text-base text-white placeholder-gray-300 bg-transparent outline-none"
                  />

                  <div className="hidden sm:block h-6 w-px bg-white/30 mx-2" />

                  <button
                    onClick={() => setShowFilters((s) => !s)}
                    className="flex items-center gap-1 p-2 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                  >
                    <SlidersHorizontal size={14} />
                  </button>
                </div>

                {/* FILTER DROPDOWN */}
                {showFilters && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-black/90 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div>
                          <label className="block text-sm mb-1">
                            Price Range
                          </label>
                          <select
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                            className="w-full bg-black border border-white/30 rounded px-3 py-2 text-white"
                          >
                            <option value="all">All</option>
                            <option value="low">Below ₹200</option>
                            <option value="mid">₹200 – ₹400</option>
                            <option value="high">Above ₹400</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm mb-1">Sort By</label>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full bg-black border border-white/30 rounded px-3 py-2 text-white"
                          >
                            <option value="">None</option>
                            <option value="priceLow">Price: Low → High</option>
                            <option value="priceHigh">Price: High → Low</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 w-full">
                        <button
                          onClick={() => {
                            setPriceRange("all");
                            setSortBy("");
                          }}
                          className="px-4 py-2 bg-white/20 rounded hover:bg-white/30"
                        >
                          Reset
                        </button>

                        <button
                          onClick={() => setShowFilters(false)}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* SEARCH RESULTS */}
            {isSearching && (
              <section className="px-6 mt-6">
                <h3 className="text-xl font-bold mb-6">Search Results...</h3>

                {/* Restaurants */}
                {searchResults.restaurants.length > 0 && (
                  <>
                    <h4 className="font-semibold mb-2">Restaurants</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.restaurants.map((r) => (
                        <div
                          key={r._id}
                          onClick={() =>
                            navigate(`/customer/restaurant/${r._id}`)
                          }
                          className="bg-black/70 text-white border-2 border-white/20 shadow rounded-xl p-4 cursor-pointer hover:scale-105 hover:shadow-xl transition"
                        >
                          <ResponsiveImage
                            src={r.image || "/assets/restaurant.png"}
                            loading="lazy"
                            alt={r.name}
                            className="w-full h-40 object-contain rounded-lg bg-black/20"
                          />

                          <div className="flex justify-between items-center">
                            <p className="font-bold">{r.name}</p>
                            <p className="mt-1 text-yellow-500 font-semibold">
                              ⭐ {r.averageRating?.toFixed(1)}
                            </p>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {r.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Dishes */}
                {searchResults.dishes.length > 0 && (
                  <>
                    <h4 className="font-semibold mb-2 mt-4">Dishes</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                      {searchResults.dishes.map((d) => (
                        <div
                          key={d._id}
                          className="bg-black/70 text-white border-2 border-white/20 p-3 rounded-xl shadow cursor-pointer hover:scale-105 hover:shadow-xl transition flex flex-col justify-between"
                        >
                          <ResponsiveImage
                            src={d.image || "/assets/dishimage.jpg"}
                            loading="lazy"
                            className="h-24 w-full object-cover rounded-lg"
                            alt={d.name}
                          />
                          <div className="flex justify-between items-center">
                            <p className="font-semibold mt-2">{d.name}</p>
                            <p className="text-green-600 text-sm ">
                              ₹{d.price}
                            </p>
                          </div>
                          <p className="text-white text-sm">{d.description}</p>
                          <button
                            onClick={() => addToCart(d)}
                            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-3 py-1 mt-2 rounded text-white"
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* No results */}
                {searchResults.restaurants.length === 0 &&
                  searchResults.dishes.length === 0 && (
                    <p className="text-gray-300 text-center mt-4">
                      No results found.
                    </p>
                  )}
              </section>
            )}

            {/* CATEGORIES */}
            {!isSearching && (
              <section className="px-6 mt-10">
                <h3 className="text-xl font-semibold mb-3">Categories</h3>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {[
                    {
                      name: "Pizza",
                      icon: Pizza,
                      image: "/assets/categories/pizza.jpg",
                    },
                    {
                      name: "Desserts",
                      icon: IceCream,
                      image: "/assets/categories/dessert.jpg",
                    },
                    {
                      name: "Meals",
                      icon: Utensils,
                      image: "/assets/categories/meal.jpg",
                    },
                    {
                      name: "Drinks",
                      icon: Coffee,
                      image: "/assets/categories/drinks.jpg",
                    },
                    {
                      name: "Combo",
                      icon: Coffee,
                      image: "/assets/categories/combos.png",
                    },
                  ].map((c, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedCategory((prev) =>
                          prev === c.name ? null : c.name
                        );
                      }}
                      className="group relative h-28 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-lg"
                    >
                      <ResponsiveImage
                        src={c.image}
                        alt={c.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-black/60 transition group-hover:bg-black/35"></div>

                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                        <c.icon size={32} className="mb-1" />
                        <p className="font-medium">{c.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CATEGORY / RECOMMENDED DISHES */}
            <h3 className="px-4 text-xl font-bold mt-16 mb-8 sm:mt-20 sm:px-6">
              {selectedCategory
                ? `${selectedCategory} Dishes`
                : "Trending Dishes"}
            </h3>

            <section className="px-4 sm:px-6 mt-6 mb-20">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {paginatedDishes.map((dish) => {
                  const restaurant = restaurants.find(
                    (r) => r._id === dish.restaurantId
                  );

                  return (
                    <div
                      key={dish._id}
                      className="flex cursor-pointer flex-col justify-between rounded-2xl border border-white/10 bg-black/70 p-3 text-white shadow transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <ResponsiveImage
                        src={dish.image || "/assets/dishimage.jpg"}
                        loading="lazy"
                        alt={dish.name}
                        className="h-28 w-full object-cover rounded-lg"
                      />
                      <div className=" items-center pb-2">
                        <p className="font-semibold text-xl mt-2">
                          {dish.name}
                        </p>
                        <div className="flex flex-row justify-between gap-4 items-center">
                          <p className="text-green-500 font-bold">
                            ₹{dish.price}
                          </p>
                          <p className="text-xs text-orange-400">
                            🔥 {dish.orderCount ?? 0} orders
                          </p>
                        </div>
                      </div>
                      <p className="text-white">{dish.description}</p>

                      <p className="text-white/70 text-sm italic">
                        By: {restaurant ? restaurant.name : "Unknown"}
                      </p>
                      <button
                        onClick={() => addToCart(dish)}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-3 py-1 mt-2 rounded text-white"
                      >
                        Add to Cart
                      </button>
                    </div>
                  );
                })}
              </div>

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
            </section>

            {/* POPULAR RESTAURANTS */}
            <section className="px-4 sm:px-6 mt-8 sm:mt-10 mb-8 sm:mb-10">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                Restaurants
              </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                {paginatedRestaurants.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => navigate(`/customer/restaurant/${r._id}`)}
                    className="
          bg-black/70 border border-white/10 text-white
          rounded-2xl shadow
          transition
          p-3
          cursor-pointer
          hover:shadow-xl
          sm:hover:scale-105
        "
                  >
                    <div className="w-full aspect-[16/9] bg-black/30 rounded-lg overflow-hidden">
                      <ResponsiveImage
                        src={r.image || "/assets/restaurant.png"}
                        loading="lazy"
                        alt={r.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-4">
                      <h4 className="font-semibold text-base sm:text-lg">
                        {r.name}
                      </h4>

                      <p className="text-gray-300 text-sm line-clamp-2">
                        {r.description}
                      </p>

                      <p className="mt-2 text-yellow-500 font-bold text-sm sm:text-base">
                        ⭐ {r.averageRating?.toFixed(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {restaurantTotalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-2 mt-6 sm:mt-8">
                  <button
                    disabled={restaurantPage === 1}
                    onClick={() => setRestaurantPage((p) => p - 1)}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded disabled:opacity-40"
                  >
                    Prev
                  </button>

                  {Array.from({ length: restaurantTotalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setRestaurantPage(i + 1)}
                      className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded ${
                        restaurantPage === i + 1
                          ? "bg-gradient-to-r from-orange-500 to-red-600"
                          : "bg-white/20 hover:bg-white/30"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    disabled={restaurantPage === restaurantTotalPages}
                    onClick={() => setRestaurantPage((p) => p + 1)}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardAction({ icon, label, onClick }) {
  const Icon = icon;

  return (
    <button
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}
