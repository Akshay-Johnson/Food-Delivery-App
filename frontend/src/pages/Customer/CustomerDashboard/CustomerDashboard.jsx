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
} from "lucide-react";

import { useState, useEffect } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Toast from "../../../components/toast/toast";

export default function CustomerDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [restaurantPage, setRestaurantPage] = useState(1);
  const restaurantsPerPage = 6;

  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  //fetch restaurants & dishes
  useEffect(() => {
    fetchRestaurants();
    fetchRecommendedDishes();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await api.get("/api/restaurants");
      setRestaurants(response.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const fetchRecommendedDishes = async () => {
    try {
      const response = await api.get("/api/menu/recommended");
      setDishes(response.data);
    } catch (error) {
      console.error("Error fetching recommended dishes:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (text) => {
    setSearchQuery(text);

    if (text.trim() === "") {
      setIsSearching(false);
      setSearchResults({
        restaurants: filteredRestaurants,
        dishes: filteredDishes,
      });
      return;
    }

    try {
      const response = await api.get(`/api/search?query=${text}`);

      // merge backend results + local matches
      const mergedDishResults = [
        ...response.data.dishes,
        ...dishes.filter(
          (d) =>
            d.name.toLowerCase().includes(text.toLowerCase()) ||
            d.category?.toLowerCase().includes(text.toLowerCase())
        ),
      ];

      setSearchResults({
        restaurants: response.data.restaurants,
        dishes: mergedDishResults,
      });

      setIsSearching(true);
    } catch (error) {
      console.error("Search error:", error);

      // fallback purely to local matching
      setSearchResults({
        restaurants: filteredRestaurants,
        dishes: filteredDishes,
      });

      setIsSearching(true);
    }
  };

  const filteredRestaurants = searchQuery.trim()
    ? restaurants.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : restaurants;

  const restaurantTotalPages = Math.ceil(
    filteredRestaurants.length / restaurantsPerPage
  );

  const paginatedRestaurants = filteredRestaurants.slice(
    (restaurantPage - 1) * restaurantsPerPage,
    restaurantPage * restaurantsPerPage
  );

  // Reset page when search changes OR restaurant list changes
  useEffect(() => {
    setRestaurantPage(1);
  }, [searchQuery, restaurants]);

  const filteredDishes = dishes.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  let categoryDishes = selectedCategory
    ? dishes.filter(
        (d) => d.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    : [...dishes];

  /* ===== PRICE FILTER ===== */
  if (priceRange !== "all") {
    categoryDishes = categoryDishes.filter((d) => {
      if (priceRange === "low") return d.price < 200;
      if (priceRange === "mid") return d.price >= 200 && d.price <= 400;
      if (priceRange === "high") return d.price > 400;
      return true;
    });
  }

  /* ===== SORT ===== */
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

      setToast({
        message: "🍔 Item added to cart!",
        type: "success",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      setToast({
        message: "Failed to add item to cart.",
        type: "error",
      });
    }
  };

  return (
    <div
      className="relative min-h-screen text-white flex flex-col relative min-h-screen overflow-x-hidden "
      style={{
        backgroundImage: "url('/assets/dishimage.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ======= BLUR OVERLAY ======= */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl "></div>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* ========= PAGE CONTENT ========= */}
      <div className="relative z-10 flex-justify-end ">
        {/* NAVBAR */}
        <header className="bg-black/70 border-b border-white/30 shadow-md p-5 flex items-end gap-4 top-0 z-20 ml-auto">
          <h1 className="text-3xl font-extrabold text-blue-600">DineX</h1>
          <div className="flex justify-end flex-wrap gap-4 ml-auto">
            <button
              onClick={() => navigate("/customer/profile")}
              className="relative group flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-green-400 transition"
            >
              <User size={18} />

              <span
                className="absolute top-full mb-2 hidden group-hover:block whitespace-nowrap
                   bg-black text-white text-xs px-2 py-1 rounded-md shadow-lg"
              >
                Profile
              </span>
            </button>

            <button
              onClick={() => navigate("/customer/address")}
              className="relative group flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-green-400 transition"
            >
              <Home size={18} />

              <span
                className="absolute top-full mb-2 hidden group-hover:block whitespace-nowrap
                   bg-black text-white text-xs px-2 py-1 rounded-md shadow-lg"
              >
                Address
              </span>
            </button>

            <button
              onClick={() => navigate("/customer/cart")}
              className="relative group flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-green-400 transition"
            >
              <ShoppingCart size={18} />
              <span
                className="absolute top-full mb-2 hidden group-hover:block whitespace-nowrap
                   bg-black text-white text-xs px-2 py-1 rounded-md shadow-lg"
              >
                Cart
              </span>
            </button>

            <button
              className="relative group flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-green-400 transition"
              onClick={() => navigate("/customer/orders")}
            >
              <Truck size={18} />
              <span
                className="absolute top-full mb-2 hidden group-hover:block whitespace-nowrap
                   bg-black text-white text-xs px-2 py-1 rounded-md shadow-lg"
              >
                Orders
              </span>
            </button>

            <button
              className="relative group flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-400 transition"
              onClick={() => {
                localStorage.removeItem("customerToken");
                navigate("/customer/login");
              }}
            >
              <LogOut size={18} />
              <span
                className="absolute top-full mb-2 hidden group-hover:block whitespace-nowrap
                   bg-black text-white text-xs px-2 py-1 rounded-md shadow-lg"
              >
                Logout
              </span>
            </button>
          </div>
        </header>

        {/* WELCOME SECTION */}
        <section className="px-6 py-8">
          <h2 className="text-2xl font-bold">Welcome back 👋</h2>
          <p className="text-gray-300">What would you like to eat today?</p>

          {/* ======= FIXED SEARCH BAR ======= */}
          <div className="mt-4 flex items-center gap-2">
            {/* SEARCH */}
            <div className="flex flex-1 items-center bg-black/70 backdrop-blur-lg border border-white/30 shadow-lg rounded-full px-4 py-3">
              <Search className="text-gray-200" />

              <input
                type="text"
                placeholder="Search for dishes or restaurants..."
                value={searchQuery}
                onChange={(e) => performSearch(e.target.value)}
                className="flex-1 px-3 py-2 text-white placeholder-gray-300 bg-transparent outline-none"
              />
            </div>

            {/* FILTER BUTTON */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-black/70 backdrop-blur-lg border border-white/30 px-5 py-2 rounded-full hover:bg-white/30 transition font-medium"
            >
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 bg-black/60 backdrop-blur-lg border border-white/20 rounded-xl p-2 pt-5 max-w-2xl flex items-center justify-center ml-auto">
              {/* PRICE */}
              <div className="mb-3 flex flex-row gap-4 w-xl">
                <label className="block  text-sm mb-1">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-black border border-white rounded px-3 py-2 text-white"
                >
                  <option value="all">All</option>
                  <option value="low">Below ₹200</option>
                  <option value="mid">₹200 – ₹400</option>
                  <option value="high">Above ₹400</option>
                </select>
                <label className="block text-sm mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-black/40 border border-white/30 rounded px-3 py-2"
                >
                  <option value="">None</option>
                  <option value="priceLow">Price: Low → High</option>
                  <option value="priceHigh">Price: High → Low</option>
                </select>
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
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </section>

        {/* SEARCH RESULTS */}
        {isSearching && (
          <section className="px-6 mt-6">
            <h3 className="text-xl font-bold mb-2">Search Results</h3>

            {/* Restaurants */}
            {searchResults.restaurants.length > 0 && (
              <>
                <h4 className="font-semibold mb-2">Restaurants</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.restaurants.map((r) => (
                    <div
                      key={r._id}
                      onClick={() => navigate(`/customer/restaurant/${r._id}`)}
                      className="bg-white text-black shadow rounded-xl p-4 cursor-pointer hover:scale-105 hover:shadow-xl transition"
                    >
                      <p className="font-bold">{r.name}</p>
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
                      className="bg-white text-black p-3 rounded-xl shadow cursor-pointer hover:scale-105 hover:shadow-xl transition"
                    >
                      <img
                        src={d.image || "/assets/dishimage.jpg"}
                        className="h-24 w-full object-cover rounded-lg"
                      />
                      <p className="font-semibold mt-2">{d.name}</p>
                      <p className="text-gray-700 text-sm">₹{d.price}</p>
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
        <section className="px-6 mt-10">
          <h3 className="text-xl font-semibold mb-3">Categories</h3>

          <div className="grid grid-cols-4 gap-4">
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
            ].map((c, i) => (
              <div
                key={i}
                onClick={() => setSelectedCategory(c.name)}
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

        {/* CATEGORY / RECOMMENDED DISHES */}
        <h3 className="text-xl font-bold mb-10 mt-20 ml-6">
          {selectedCategory
            ? `${selectedCategory} Dishes`
            : "Recommended For You"}
        </h3>

        <section className="px-6 mt-12 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
            {paginatedDishes.map((dish) => {
              const restaurant = restaurants.find(
                (r) => r._id === dish.restaurantId
              );

              return (
                <div
                  key={dish._id}
                  className="bg-black/70 border border-white/30 text-white rounded-xl shadow hover:scale-105 hover:shadow-xl transition p-3 cursor-pointer"
                >
                  <img
                    src={dish.image || "/assets/dishimage.jpg"}
                    className="h-28 w-full object-cover rounded-lg"
                    alt={dish.name}
                  />

                  <p className="font-semibold mt-2">{dish.name}</p>
                  <p className="text-white font-bold">₹{dish.price}</p>

                  <p className="text-white/70 text-sm italic">
                    By: {restaurant ? restaurant.name : "Unknown"}
                  </p>
                  <button
                    onClick={() => addToCart(dish)}
                    className="bg-blue-600 hover:bg-green-700 px-3 py-1 mt-2 rounded text-white"
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
                className="px-4 py-2 bg-white/20 rounded disabled:opacity-40"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded ${
                    currentPage === i + 1
                      ? "bg-blue-600"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 bg-white/20 rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>

        {/* POPULAR RESTAURANTS */}
        <section className="px-6 mt-10 mb-10">
          <h3 className="text-xl font-bold mb-4">Popular Restaurants</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRestaurants.map((r) => (
              <div
                key={r._id}
                onClick={() => navigate(`/customer/restaurant/${r._id}`)}
                className="bg-black/70 border border-white/30 text-white rounded-xl shadow hover:scale-105 hover:shadow-xl transition p-3 cursor-pointer"
              >
                <img
                  src={r.image || `/assets/restaurantimage.jpeg`}
                  className="h-40 w-full object-cover"
                  alt={r.name}
                />
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
                className="px-4 py-2 bg-white/20 rounded disabled:opacity-40"
              >
                Prev
              </button>

              {Array.from({ length: restaurantTotalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setRestaurantPage(i + 1)}
                  className={`px-4 py-2 rounded ${
                    restaurantPage === i + 1
                      ? "bg-blue-600"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={restaurantPage === restaurantTotalPages}
                onClick={() => setRestaurantPage((p) => p + 1)}
                className="px-4 py-2 bg-white/20 rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
