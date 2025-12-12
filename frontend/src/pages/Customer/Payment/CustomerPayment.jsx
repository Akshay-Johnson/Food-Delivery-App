import { use, useEffect, useState } from "react";
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
      ScatterChart(res.data);
      setLoading(false);
    } catch (e) {
      console.error("Failed to load cart:", e);
      setLoading(false);
    }
  };

  //load razorpay script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  //start payment
  const handlePayment = async () => {
    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const orderRes = await api.post("/api/payments/create-order", {
        amount: cart.totalPrice * 100,
      });

      const { orderId, amount, currency } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "DineX",
        description: "Order Payment",
        order_id: orderId,

        handler: async function (response) {
          try {
            await api.post("/api/orders/create", {
              cartItems: cart.items,
              amount: cart.totalPrice,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });

            //clear cart after successful payment
            await api.delete("/api/cart/clear");

            navigate("/customer/order-success");
          } catch (error) {
            console.error("order save failed ", error);
            alert("Order placement failed. Please contact support.");
          }
        },

        prefill: {
          name: "Customer",
          email: "email@example.com",
          contact: "9999999999",
        },

        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Razorpay order failed", error);
      alert("Payment failed. Please try again.");
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
