import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function CustomerPayment() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  //load cart
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setCart(res.data);
    } catch (e) {
      console.error("Failed to load cart:", e);
    } finally {
      setLoading(false);
    }
  };

  //load razorpay script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  //start payment
  const handlePayment = async () => {
    if (!cart || !cart.items.length) {
      alert("Cart is empty");
      return;
    }

    const loaded = await loadRazorpay();
    if (!loaded) {
      alert("Razorpay SDK failed to load");
      return;
    }

    try {
      // 1️⃣ Create Razorpay order (DO NOT multiply by 100 here)
      const { data } = await api.post("/api/payments/create-order", {
        amount: cart.totalPrice,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,

        name: "DineX",
        description: "Order Payment",

handler: async (response) => {
  try {
    // 1. Verify Payment
    await api.post("/api/payments/verify", {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    });

    // 2. Create the actual order
    // FIX: Get restaurantId from the cart object
    // FIX: Ensure selectedAddress is actually passed (you might need a state for this)
    await api.post("/api/orders/create", {
      restaurantId: cart.restaurantId, // Using cart data
      addressId: cart.addressId || "PASTE_A_VALID_ADDRESS_ID_HERE_FOR_TESTING", 
      paymentMethod: "ONLINE",
      paymentId: response.razorpay_payment_id,
    });

    alert("Order placed successfully!");
    navigate("/customer/orders");
  } catch (error) {
    console.error("Final Order Error:", error.response?.data);
    alert(error.response?.data?.message || "Payment worked, but order failed to save.");
  }
},

        theme: { color: "#22c55e" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed");
    }
  };

  if (loading || !cart)
    return <p className="text-white p-6">Loading Payment...</p>;

  return (
    <div className="min-h-screen bg-black/90 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout & Payment</h1>

      <div className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-lg max-w-lg mx-auto">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        {cart.items.map((item) => (
          <div key={item.itemId} className="flex justify-between mb-2">
            <p>
              {item.name} x {item.quantity}
            </p>
            <p>₹{item.price * item.quantity}</p>
          </div>
        ))}

        <hr className="border-white/20 my-4" />

        <div className="flex justify-between text-lg font-bold">
          <p>Total</p>
          <p>₹{cart.totalPrice}</p>
        </div>

        <button
          onClick={handlePayment}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-lg mt-6 transition"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
}
