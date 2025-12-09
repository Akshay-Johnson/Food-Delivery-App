import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { ArrowLeft, Star } from "lucide-react";

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurantDetails();
  }, []);

  const loadRestaurantDetails = async () => {
    try {
      const res = await api.get(`/api/restaurants/${id}/details`);
      setRestaurant(res.data.restaurant);
      setDishes(res.data.dishes);
      setLoading(false);
    } catch (error) {
      console.error("Error loading details:", error);
    }
  };

  const addToCart = async (dish) => {
    try {
      await api.post("/api/cart/add", {
        itemId: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: 1,
      });
      alert("Item added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-black/90 text-white">
      {/* Top Bar */}
      <div className="p-4 flex items-center gap-3 bg-black/60 backdrop-blur-lg border-b border-white/10">
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
      />

      {/* Info */}
      <div className="p-4">
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
        <p className="text-gray-300">{restaurant.description}</p>

        <div className="flex items-center gap-2 mt-2 text-yellow-400">
          <Star size={20} />
          <span className="font-semibold">
            {restaurant.averageRating?.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Menu Section */}
      <div className="px-4 mt-4">
        <h2 className="text-xl font-bold mb-4">Menu</h2>

        <div className="grid grid-cols-2 gap-4">
          {dishes.map((item) => (
            <div
              key={item._id}
              className="bg-white/10 border border-white/20 rounded-xl p-3 shadow hover:scale-[1.02] transition"
            >
              <img
                src={item.image || "/assets/dishimage.jpg"}
                className="w-full h-24 object-cover rounded-md"
              />

              <p className="mt-2 text-lg font-semibold">{item.name}</p>
              <p className="text-gray-300 text-sm">₹{item.price}</p>

              <button
                onClick={() => addToCart(item)}
                className="bg-green-600 px-3 py-1 rounded mt-2"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
