import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Toast from "../../../components/toast/toast";

export default function CustomerPayment() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  /* ================= LOAD CART ================= */
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setCart(res.data);
    } catch (e) {
      console.error("Failed to load cart:", e);
      setToast({ type: "error", message: "Failed to load cart" });
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD RAZORPAY SCRIPT ================= */
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  /* ================= START PAYMENT ================= */
  const handlePayment = async () => {
    /* ---- BASIC VALIDATIONS ---- */
    if (!cart || !cart.items?.length) {
      setToast({ type: "error", message: "Your cart is empty!" });
      return;
    }

    if (!cart.addressId) {
      setToast({ type: "error", message: "Please select a delivery address" });
      return;
    }

    const restaurantId =
      cart.restaurantId ||
      cart.restaurant?._id ||
      cart.items?.[0]?.restaurantId;

    if (!restaurantId) {
      console.error("❌ Restaurant missing in cart:", cart);
      setToast({ type: "error", message: "Restaurant not found in cart" });
      return;
    }

    const loaded = await loadRazorpay();
    if (!loaded) {
      setToast({ type: "error", message: "Razorpay SDK failed to load" });
      return;
    }

    try {
      /* ================= 1️⃣ CREATE RAZORPAY ORDER ================= */
      const { data } = await api.post("/api/payments/create-order", {
        amount: cart.totalPrice,
      });

      if (!data?.key || !data?.id) {
        console.error("❌ Invalid Razorpay response:", data);
        setToast({ type: "error", message: "Payment configuration error" });
        return;
      }

      console.log("✅ Razorpay key:", data.key);

      /* ================= 2️⃣ RAZORPAY OPTIONS ================= */
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,

        name: "DineX",
        description: "Order Payment",

        handler: async (response) => {
          try {
            /* ================= 3️⃣ VERIFY PAYMENT ================= */
            await api.post("/api/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            /* ================= 4️⃣ CREATE FINAL ORDER ================= */
            await api.post("/api/orders/create", {
              restaurantId,
              addressId: cart.addressId,
              paymentMethod: "ONLINE",
              paymentId: response.razorpay_payment_id,
            });

            setToast({
              type: "success",
              message: "Order placed successfully!",
            });

            setTimeout(() => {
              setToast(null);
              navigate("/customer/orders");
            }, 2000);
          } catch (error) {
            console.error("❌ Final Order Error:", error.response?.data || error);
            setToast({
              type: "error",
              message:
                error.response?.data?.message ||
                "Payment succeeded, but order failed to save.",
            });
          }
        },

        theme: { color: "#22c55e" },
      };

      /* ================= 5️⃣ OPEN RAZORPAY ================= */
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("❌ Payment error:", error);
      setToast({ type: "error", message: "Payment failed" });
    }
  };

  if (loading || !cart) {
    return <p className="text-white p-6">Loading Payment...</p>;
  }

  return (
    <div className="min-h-screen bg-black/90 text-white p-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

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
