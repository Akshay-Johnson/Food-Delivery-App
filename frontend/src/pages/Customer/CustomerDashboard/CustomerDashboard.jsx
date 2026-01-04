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
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("");

  const [showTrending, setShowTrending] = useState(true);

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
    fetchAllDishes();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await api.get("/api/restaurants");
      setRestaurants(response.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const fetchTrendingDishes = async () => {
    try {
      const response = await api.get("/api/menu/trending/global");
      setTrendingDishes(response.data);
    } catch (error) {
      console.error("Error fetching trending dishes:", error);
    }
  };

  const fetchAllDishes = async () => {
    try {
      const response = await api.get("/api/menu/all"); // OR /api/menu/all
      setAllDishes(response.data.filter((d) => d.isAvailable));
    } catch (error) {
      console.error("Error fetching all dishes:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (text) => {
    setSearchQuery(text);

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

  let categoryDishes = [...availableDishes];

  if (selectedCategory) {
    const normalizedCategory = selectedCategory.trim().toLowerCase();

    categoryDishes = categoryDishes.filter(
      (d) => d.category?.trim().toLowerCase() === normalizedCategory
    );
  }

  if (priceRange !== "all") {
    categoryDishes = categoryDishes.filter((d) => {
      if (priceRange === "low") return d.price < 200;
      if (priceRange === "mid") return d.price >= 200 && d.price <= 400;
      if (priceRange === "high") return d.price > 400;
      return true;
    });
  }

  if (sortBy === "priceLow") {
    categoryDishes.sort((a, b) => a.price - b.price);
  }

  if (sortBy === "priceHigh") {
    categoryDishes.sort((a, b) => b.price - a.price);
  }

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

  useEffect(() => {
    if (!selectedCategory) {
      setShowTrending(true);
    }
  }, [selectedCategory]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* BACKGROUND IMAGE (GUARANTEED) */}
      <img
        src="/assets/restaurant/bg.jpg"
        alt="background"
        className="fixed inset-0 w-full h-full object-cover -z-20"
      />

      {/* DARK OVERLAY */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm -z-10"></div>

      {/* CONTENT */}
      <div className="relative z-10 text-white">
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        {/* PAGE CONTENT */}
        <div className="relative z-10">
          {/* NAVBAR */}
          <header className="fixed top-0 z-50 w-full bg-black/50 backdrop-blur-md border-b border-white/30 shadow-md p-5 flex items-center gap-4">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 bg-clip-text text-transparent">
              DineX
            </h1>
            <h2 className="text-2xl font-bold">Welcome back 👋</h2>
            <p className="text-gray-300">What would you like to eat today?</p>
            <div className="flex justify-end flex-wrap gap-4 ml-auto">
              <button
                onClick={() => navigate("/customer/profile")}
                className="relative group flex items-center bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-md "
              >
                <User size={18} />
              </button>

              <button
                onClick={() => navigate("/customer/address")}
                className="relative group flex items-center bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-md "
              >
                <Home size={18} />
              </button>

              <button
                onClick={() => navigate("/customer/cart")}
                className="relative group flex items-center bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-md "
              >
                <ShoppingCart size={18} />
              </button>

              <button
                onClick={() => navigate("/customer/orders")}
                className="relative group flex items-center bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-md "
              >
                <Truck size={18} />
              </button>

              <button
                className="relative group flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-400 transition"
                onClick={() => {
                  localStorage.removeItem("customerToken");
                  navigate("/customer/login");
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>

          {/* WELCOME SECTION */}
          <section className="px-6 py-20">
            {/* SEARCH + FILTER WRAPPER */}
            <div className="mt-4 relative max-w-2xl mx-auto">
              {/* SEARCH BAR */}
              <div className="flex items-center bg-black/70 backdrop-blur-lg border border-white/30 shadow-lg rounded-full px-4 py-2">
                <Search className="text-gray-300 mr-2" />

                <input
                  type="text"
                  placeholder="Search for dishes or restaurants..."
                  value={searchQuery}
                  onChange={(e) => performSearch(e.target.value)}
                  className="flex-1 px-3 py-2 text-white placeholder-gray-300 bg-transparent outline-none"
                />

                <div className="h-6 w-px bg-white/30 mx-2" />

                <button
                  onClick={() => setShowFilters((s) => !s)}
                  className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                >
                  <SlidersHorizontal size={14} />
                </button>
              </div>

              {/* FILTER DROPDOWN */}
              {showFilters && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-black/90 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-2xl">
                  <div className="flex  flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* PRICE */}
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

                      {/* SORT */}
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

                    {/* ACTION BUTTONS */}
                    <div className="flex justify-end gap-3 mt-4">
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
                        <img
                          src={r.image || "/assets/restaurant.png"}
                          className="w-full h-40 object-contain rounded-lg bg-black/20"
                          alt={r.name}
                        />

                        <div className="flex justify-between items-center">
                          <p className="font-bold">{r.name}</p>
                          <p className="mt-1 text-yellow-500 font-semibold">
                            ⭐ {r.averageRating?.toFixed(1)}
                          </p>
                        </div>
                        <p className="text-gray-600 text-sm">{r.description}</p>
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
                        <img
                          src={d.image || "/assets/dishimage.jpg"}
                          className="h-24 w-full object-cover rounded-lg"
                        />
                        <div className="flex justify-between items-center">
                          <p className="font-semibold mt-2">{d.name}</p>
                          <p className="text-green-600 text-sm ">₹{d.price}</p>
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

              <div className="grid grid-cols-5 gap-4 obejct-cover">
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
                      setShowTrending(false);
                      setSelectedCategory((prev) =>
                        prev === c.name ? null : c.name
                      );
                    }}
                    style={{ backgroundImage: `url(${c.image})` }}
                    className="relative bg-cover bg-center h-28 rounded-lg cursor-pointer overflow-hidden group"
                  >
                    {/* BLUR LAYER */}
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/10 transition"></div>

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
          <h3 className="text-xl font-bold mb-10 mt-20 ml-6">
            {selectedCategory
              ? `${selectedCategory} Dishes`
              : "Trending Dishes"}
          </h3>

          <section className="px-6 mt-12 mb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedDishes.map((dish) => {
                const restaurant = restaurants.find(
                  (r) => r._id === dish.restaurantId
                );

                return (
                  <div
                    key={dish._id}
                    className="bg-black/70 border border-white/30 text-white rounded-xl shadow hover:scale-105 hover:shadow-xl transition p-3 cursor-pointer flex flex-col justify-between"
                  >
                    <img
                      src={dish.image || "/assets/dishimage.jpg"}
                      className="h-28 w-full object-cover rounded-lg"
                      alt={dish.name}
                    />
                    <div className=" items-center pb-2">
                      <p className="font-semibold text-xl mt-2">{dish.name}</p>
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
          <section className="px-6 mt-10 mb-10">
            <h3 className="text-xl font-bold mb-4"> Restaurants</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedRestaurants.map((r) => (
                <div
                  key={r._id}
                  onClick={() => navigate(`/customer/restaurant/${r._id}`)}
                  className="bg-black/70 border border-white/30 text-white rounded-xl shadow hover:scale-105 hover:shadow-xl transition p-3 cursor-pointer"
                >
                  <div className="w-full aspect-[16/9] bg-black/30 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={r.image || "/assets/restaurant.png"}
                      alt={r.name}
                      className="max-w-full max-h-80 object-contain"
                    />
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold text-lg">{r.name}</h4>
                    <p className="text-gray-600 text-sm">{r.description}</p>
                    <p className="mt-2 text-yellow-600 font-bold">
                      ⭐ {r.averageRating?.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {restaurantTotalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  disabled={restaurantPage === 1}
                  onClick={() => setRestaurantPage((p) => p - 1)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded disabled:opacity-40"
                >
                  Prev
                </button>

                {Array.from({ length: restaurantTotalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setRestaurantPage(i + 1)}
                    className={`px-4 py-2 rounded ${
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
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
