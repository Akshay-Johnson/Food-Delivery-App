import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { Trash, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-black/80 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>

      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.itemId}
              className="bg-white/10 p-4 rounded-xl flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-gray-300">₹{item.price}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQty(item.itemId, item.quantity - 1)}
                >
                  <Minus size={18} />
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() => updateQty(item.itemId, item.quantity + 1)}
                >
                  <Plus size={18} />
                </button>

                <button
                  onClick={() => removeItem(item.itemId)}
                  className="text-red-500"
                >
                  <Trash size={20} />
                </button>
              </div>
            </div>
          ))}

          <h2 className="text-2xl font-bold mt-4">Total: ₹{cart.totalPrice}</h2>

          <button
            className="w-full bg-green-600 py-3 rounded-lg text-lg mt-4"
            onClick={() => navigate("/customer/checkout")}
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}
