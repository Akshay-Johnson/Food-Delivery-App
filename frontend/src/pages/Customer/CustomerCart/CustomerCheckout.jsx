import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { MapPin, CreditCard, Wallet, ArrowLeft } from "lucide-react";
import Toast from "../../../components/toast/toast";

export default function CustomerCheckout() {
  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadCheckoutInfo();
  }, []);

  const loadCheckoutInfo = async () => {
    try {
      const addressRes = await api.get("/api/address");
      const cartRes = await api.get("/api/cart");

      setAddresses(addressRes.data || []);
      setCart(cartRes.data);

      const defaultAddress = addressRes.data?.find((a) => a.isDefault);
      if (defaultAddress) setSelectedAddress(defaultAddress._id);
    } catch (error) {
      console.error("Checkout load error:", error);
    }
  };
  // 1. Helper to load the script (add this inside your component)
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 2. Updated placeOrder function
  const placeOrder = async () => {
    if (!selectedAddress) {
      setToast({ type: "error", message: "Please select a delivery address." });
      return;
    }
    if (!cart?.items?.length) {
      setToast({ type: "error", message: "Your cart is empty!" });
      return;
    }

    const restaurantId =
      cart.restaurantId ||
      cart.items[0]?.restaurantId ||
      cart.items[0]?.restaurant;

    // --- CASE 1: CASH ON DELIVERY ---
    if (paymentMethod === "COD") {
      try {
        await api.post("/api/orders/create", {
          restaurantId,
          addressId: selectedAddress,
          paymentMethod: "COD",
        });

        setToast({ type: "success", message: "Order placed successfully!" });
        setTimeout(() => {
          setToast(null);
          navigate("/customer/orders");
        }, 3000);
      } catch (error) {
        setToast({ type: "error", message: "Failed to place order." });
      }
      return;
    }

    // --- CASE 2: ONLINE PAYMENT ---
    if (paymentMethod === "ONLINE") {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setToast({ type: "error", message: "Razorpay SDK failed to load." });
        return;
      }

      try {
        // Step A: Create Razorpay Order on Backend
        const { data: rpOrder } = await api.post("/api/payments/create-order", {
          amount: cart.totalPrice,
        });

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: rpOrder.amount,
          currency: rpOrder.currency,
          name: "DineX",
          description: "Order Payment",
          order_id: rpOrder.id,
          handler: async (response) => {
            try {
              // Step B: Verify Payment
              await api.post("/api/payments/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              // Step C: Create actual Order in DB
              await api.post("/api/orders/create", {
                restaurantId,
                addressId: selectedAddress,
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
              }, 3000);
            } catch (err) {
              console.error("Verification/Order Error:", err);
              setToast({
                type: "error",
                message: "Payment verification failed.",
              });
            }
          },
          theme: { color: "#22c55e" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        console.error("Payment initiation failed:", error);
      }
    }
  };

  if (!cart) {
    return <p className="text-white p-6">Loading checkout...</p>;
  }

  return (
    <div className="relative min-h-screen bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center text-white">
      {/* BLUR OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-none"></div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* CONTENT */}
      <div className="relative z-10 max-w-3xl mx-auto p-6">
        {/* TOP BAR */}
        <div className="flex items-center gap-3 mb-6">
          <ArrowLeft
            size={26}
            onClick={() => navigate(-1)}
            className="cursor-pointer"
          />
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        {/* ADDRESS SECTION */}
        <h2 className="text-xl font-bold mb-3">Delivery Address</h2>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              onClick={() => setSelectedAddress(addr._id)}
              className={`p-4 rounded-xl border cursor-pointer transition
                min-w-[280px] max-w-[280px] min-h-[150px]
                ${
                  selectedAddress === addr._id
                    ? "border-green-500 bg-white/10"
                    : "border-white/20 bg-white/5"
                }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin />
                <p className="font-bold">{addr.fullName}</p>
              </div>

              <p className="text-gray-300 text-sm">{addr.phone}</p>
              <p className="text-gray-400 text-sm">
                {addr.addressLine1}, {addr.city}, {addr.state} – {addr.pincode}
              </p>
            </div>
          ))}
        </div>

        {/* ORDER SUMMARY */}
        <h2 className="text-xl font-bold mt-8 mb-3">Order Summary</h2>

        <div className="bg-white/10 border border-white/20 rounded-xl p-4">
          {cart.items.map((item) => (
            <div key={item._id} className="flex justify-between mb-2">
              <p>
                {item.name} × {item.quantity}
              </p>
              <p>₹{item.price * item.quantity}</p>
            </div>
          ))}

          <hr className="border-white/30 my-3" />

          <div className="flex justify-between text-lg font-semibold">
            <p>Total</p>
            <p>₹{cart.totalPrice}</p>
          </div>
        </div>

        {/* PAYMENT METHODS */}
        <h2 className="text-xl font-bold mt-8 mb-3">Payment Method</h2>

        <div className="flex gap-4">
          <div
            onClick={() => setPaymentMethod("COD")}
            className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer border min-w-[180px]
              ${
                paymentMethod === "COD"
                  ? "border-green-500 bg-white/10"
                  : "border-white/20 bg-white/5"
              }`}
          >
            <Wallet /> Cash on Delivery
          </div>

          <div
            onClick={() => setPaymentMethod("ONLINE")}
            className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer border min-w-[180px]
              ${
                paymentMethod === "ONLINE"
                  ? "border-green-500 bg-white/10"
                  : "border-white/20 bg-white/5"
              }`}
          >
            <CreditCard /> Online Payment
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 mt-10">
          <button
            onClick={() => navigate("/customer/address")}
            className="flex-1 bg-blue-600 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Change / Edit Address
          </button>

          <button
            onClick={placeOrder}
            className="flex-1 bg-green-600 py-2 rounded-lg text-lg font-bold hover:bg-green-700 transition"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
