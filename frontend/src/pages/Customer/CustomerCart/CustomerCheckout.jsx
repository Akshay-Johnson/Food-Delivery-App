import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { MapPin, CreditCard, Wallet, ArrowLeft } from "lucide-react";

export default function CustomerCheckout() {
  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const navigate = useNavigate();

  useEffect(() => {
    loadCheckoutInfo();
  }, []);

  const loadCheckoutInfo = async () => {
    try {
      const addressRes = await api.get("/api/address");
      const cartRes = await api.get("/api/cart");
          console.log("CART DATA:", cartRes.data);

      setAddresses(addressRes.data);
      setCart(cartRes.data);

      // Auto-select default address
      const defaultAddress = addressRes.data.find((a) => a.isDefault);
      if (defaultAddress) setSelectedAddress(defaultAddress._id);
    } catch (error) {
      console.error("Checkout load error:", error);
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      return alert("Please select a delivery address!");
    }

    if (!paymentMethod) {
      return alert("Please select payment method!");
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      return alert("Your cart is empty!");
    }

    const restaurantId =
      cart.restaurantId ||
      cart.items[0]?.restaurantId ||
      cart.items[0]?.restaurant;

    if (!restaurantId) {
      return alert("Restaurant information missing. Please try again.");
    }

    try {
      await api.post("/api/orders/create", {
        restaurantId,
        addressId: selectedAddress,
        paymentMethod,
      });

      alert("Order placed successfully!");
      navigate("/customer/orders");
    } catch (error) {
      console.error("Order error:", error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    }
  };

  if (!cart) return <p className="text-white p-6">Loading checkout...</p>;

  return (
    <div className="min-h-screen bg-[url('/assets/cart/cart.jpg')] bg-cover bg-center text-white p-4">
        <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>
      {/* TOP BAR */}
      <div className="relative z-10 max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-4">
        <ArrowLeft
          size={26}
          onClick={() => navigate(-1)}
          className="cursor-pointer"
        />
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      {/* ADDRESS SECTION */}
      <h2 className="text-xl font-bold mb-3">Delivery Address</h2>

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            onClick={() => setSelectedAddress(addr._id)}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              selectedAddress === addr._id
                ? "border-green-500 bg-white/10"
                : "border-white/20 bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin />
              <p className="font-bold">{addr.fullName}</p>
            </div>

            <p className="text-gray-300 text-sm">{addr.phone}</p>
            <p className="text-gray-400 text-sm">
              {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/customer/address")}
        className="w-full bg-blue-600 py-2 mt-2 rounded-lg hover:bg-blue-700"
      >
        Change Address
      </button>

      {/* CART SUMMARY */}
      <h2 className="text-xl font-bold mt-6 mb-3">Order Summary</h2>

      <div className="bg-white/10 border border-white/20 rounded-xl p-4">
        {cart.items.map((item) => (
          <div key={item._id} className="flex justify-between mb-3">
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
      <h2 className="text-xl font-bold mt-6 mb-3">Payment Method</h2>

      <div className="space-y-3">
        <div
          onClick={() => setPaymentMethod("COD")}
          className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer border ${
            paymentMethod === "COD"
              ? "border-green-500 bg-white/10"
              : "border-white/20 bg-white/5"
          }`}
        >
          <Wallet /> Cash on Delivery
        </div>

        <div
          onClick={() => setPaymentMethod("ONLINE")}
          className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer border ${
            paymentMethod === "ONLINE"
              ? "border-green-500 bg-white/10"
              : "border-white/20 bg-white/5"
          }`}
        >
          <CreditCard /> Online Payment
        </div>
      </div>

      {/* PLACE ORDER */}
      <button
        onClick={placeOrder}
        className="w-full bg-green-600 text-white py-3 rounded-xl text-lg font-bold mt-6 hover:bg-green-700"
      >
        Place Order
      </button>
    </div>
    </div>
  );
}
