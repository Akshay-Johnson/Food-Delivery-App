import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { Trash, Plus, Minus, Home } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function CustomerCart() {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setCart(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const updateQty = async (itemId, quantity) => {
    if (quantity < 1) return;
    await api.put(`/api/cart/update/${itemId}`, { quantity });
    loadCart();
  };

  const removeItem = async (itemId) => {
    await api.delete(`/api/cart/remove/${itemId}`);
    loadCart();
  };

  if (!cart) return <p className="text-white p-6">Loading Cart...</p>;

  return (
    <div className="relative min-h-screen bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center text-white pt-10">
      {/* BLUR OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      {/* CONTENT */}
      <div className="relative z-10"></div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Your Cart</h1>

          <div className="flex justify-end gap-2">
            <Link to="/customer/dashboard">
              <button className="bg-blue-600 p-4 rounded-lg hover:bg-blue-500 transition">
                <Home size={18} />
              </button>
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Empty Cart */}
        {cart.items.length === 0 ? (
          <div className="text-center bg-black/40 p-10 rounded-xl">
            <p className="text-xl mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate("/customer/dashboard")}
              className="bg-green-600 px-6 py-3 rounded-lg hover:bg-green-500 transition"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.itemId}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 flex justify-between items-center mt-20"
                >
                  <div>
                    <p className="font-semibold text-lg">{item.name}</p>
                    <p className="text-gray-300">₹{item.price}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-black/40 rounded-lg px-2 py-1">
                      <button
                        onClick={() =>
                          updateQty(item.itemId, item.quantity - 1)
                        }
                        className="hover:text-red-400"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="min-w-[20px] text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQty(item.itemId, item.quantity + 1)
                        }
                        className="hover:text-green-400"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.itemId)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-18 bg-black/50 rounded-xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">Total</span>
                <span className="text-2xl font-bold">₹{cart.totalPrice}</span>
              </div>

              <button
                className="  w-full bg-blue-600 py-3 rounded-lg text-lg font-semibold hover:bg-green-500 transition"
                onClick={() => navigate("/customer/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
