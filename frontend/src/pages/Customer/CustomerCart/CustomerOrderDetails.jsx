import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, } from "react-router-dom";
import api from "../../../api/axiosInstance";
import { Home, ArrowLeft } from "lucide-react";

/* 🔁 REUSABLE BUTTON STYLES (SAME AS CustomerOrders) */
const headerBtnBase =
  "h-11 flex items-center justify-center  rounded bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition";

const headerIconBtn = `${headerBtnBase} w-11`;
const headerTextBtn = `${headerBtnBase} px-5`;

export default function CustomerOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agentLocation, setAgentLocation] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      setOrder(res.data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!order?.deliveryAgentId) return;

    const unsubscribe = listenToAgentLocation(
      order.deliveryAgentId,
      (location) => {
        setAgentLocation(location);
      }
    );

    return () => unsubscribe();
  }, [order?.deliveryAgentId]);

  if (loading) {
    return (
      <p className="p-6 text-white">Loading order...</p>
    );
  }

  if (!order) {
    return (
      <p className="p-6 text-red-500">Order not found</p>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      {/* BACKGROUND */}
      <div className="fixed inset-0 bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center -z-10" />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md -z-10" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-4">
        {/* HEADER ROW — SAME AS CustomerOrders */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Order Details</h1>

          <div className="flex gap-2">
            <Link to="/customer/dashboard">
              <button className={headerIconBtn}>
                <Home size={18} />
              </button>
            </Link>

            <button
              onClick={() => navigate(-1)}
              className={headerTextBtn}
            >
              <ArrowLeft size={18} /> 
            </button>
          </div>
        </div>

        {/* ORDER CARD */}
        <div className="bg-black/70 border border-white/20 rounded-xl p-6">
          <p>
            <strong>Order ID:</strong> {order._id}
          </p>

          <p>
            <strong>Status:</strong> {order.status}
          </p>

          <p>
            <strong>Total:</strong> ₹{order.totalPrice}
          </p>

          <p>
            <strong>Placed On:</strong>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>

          <p>
            <strong>Ordered From:</strong>{" "}
            {order.restaurantId?.name}
          </p>

          <hr className="my-4 border-white/20" />

          {/* ITEMS */}
          <h2 className="text-xl font-semibold mb-3">
            Items
          </h2>

          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between bg-black/40 p-3 rounded-lg"
              >
                <div>
                  <p className="font-semibold">
                    {item.name}
                  </p>
                  <p className="text-sm text-white/70">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="font-bold">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          {/* LIVE TRACKING
          {order.deliveryAgentId && (
            <>
              <hr className="my-4 border-white/20" />

              <h2 className="text-xl font-semibold mb-2">
                Live Delivery Tracking
              </h2>

              {agentLocation ? (
                <div className="bg-black/40 p-4 rounded-lg">
                  <p>
                    <strong>Agent Latitude:</strong>{" "}
                    {agentLocation.lat}
                  </p>
                  <p>
                    <strong>Agent Longitude:</strong>{" "}
                    {agentLocation.lng}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400">
                  Waiting for delivery agent
                  location...
                </p>
              )}
            </>
          )} */}
        </div>
      </div>
    </div>
  );
}
