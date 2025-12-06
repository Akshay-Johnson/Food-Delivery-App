import { Search, Utensils, Coffee, Pizza, IceCream, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";

export default function CustomerDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ restaurants: [], dishes: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

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
    setSearchResults({ restaurants: [], dishes: [] });
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


  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDishes = dishes.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryDishes = selectedCategory
    ? dishes.filter((d) => d.category?.toLowerCase() === selectedCategory.toLowerCase())
    : dishes;

  return (
    <div
      className="relative min-h-screen text-white flex flex-col"
      style={{
        backgroundImage: "url('/assets/dishimage.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ======= BLUR OVERLAY ======= */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl"></div>

      {/* ========= PAGE CONTENT ========= */}
      <div className="relative z-10">

        {/* NAVBAR */}
        <header className="bg-black/50 border-b border-white/30 shadow-md p-5 flex justify-between items-center  top-0 z-20">
          <h1 className="text-3xl font-extrabold text-blue-600">DineX</h1>

          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-green-400 transition">
            <Truck size={18} />
            Track Order
          </button>
        </header>

        {/* WELCOME SECTION */}
        <section className="px-6 py-8">
          <h2 className="text-2xl font-bold">Welcome back 👋</h2>
          <p className="text-gray-300">What would you like to eat today?</p>

          {/* ======= FIXED SEARCH BAR ======= */}
          <div className="mt-4 flex items-center bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg rounded-full px-4 py-3">
            <Search className="text-gray-200" />

            <input
              type="text"
              placeholder="Search for dishes or restaurants..."
              value={searchQuery}
              onChange={(e) => performSearch(e.target.value)}
              className="flex-1 px-3 py-2 text-white placeholder-gray-300 bg-transparent outline-none"
            />
          </div>
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
                    <div key={r._id} className="bg-white text-black shadow rounded-xl p-4">
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
                    <div key={d._id} className="bg-white text-black p-3 rounded-xl shadow">
                      <img src={d.image || "/assets/dishimage.jpg"} className="h-24 w-full object-cover rounded-lg" />
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
                <p className="text-gray-300 text-center mt-4">No results found.</p>
              )}
          </section>
        )}

        {/* POPULAR RESTAURANTS */}
        <section className="px-6 mt-10">
          <h3 className="text-xl font-bold mb-4">Popular Restaurants</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((r) => (
              <div
                key={r._id}
                className="bg-black/40 text-white border border-white/30 rounded-xl shadow hover:shadow-xl transition overflow-hidden"
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
                    ⭐ {r.averageRating?.toFixed(1)} ({r.totalReviews} reviews)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="px-6 mt-20">
          <h3 className="text-xl font-semibold mb-3">Categories</h3>

          <div className="grid grid-cols-4 gap-4">
            {[
              { name: "Pizza", icon: Pizza, image: "/assets/categories/pizza.jpg" },
              { name: "Desserts", icon: IceCream, image: "/assets/categories/dessert.jpg" },
              { name: "Meals", icon: Utensils, image: "/assets/categories/meal.jpg" },
              { name: "Drinks", icon: Coffee, image: "/assets/categories/drinks.jpg" },
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
          {selectedCategory ? `${selectedCategory} Dishes` : "Recommended For You"}
        </h3>

        <section className="px-6 mt-12 mb-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryDishes.map((dish) => {
              const restaurant = restaurants.find((r) => r._id === dish.restaurantId);

              return (
                <div
                  key={dish._id}
                  className="bg-black/40 border border-white/30 text-white rounded-xl shadow hover:scale-105 hover:shadow-xl transition p-3 cursor-pointer"
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
                </div>
              );
            })}


          </div>
        </section>
      </div>
    </div>
  );
}
