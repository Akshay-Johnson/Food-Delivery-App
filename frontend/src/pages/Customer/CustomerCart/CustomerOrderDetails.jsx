import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";
import { listenToAgentLocation } from "../../../services/liveTracking";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

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
    return <p className="p-6 text-white">Loading order...</p>;
  }

  if (!order) {
    return <p className="p-6 text-red-500">Order not found</p>;
  }

  return (
    <div className="relative min-h-screen bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center text-white">
      {/* BLUR OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-none"></div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-3xl mx-auto p-6">
        <div className="mb-6 flex justify-end gap-2">
          <Link to="/customer/dashboard">
            <button className="bg-blue-600 px-4 py-3 rounded hover:bg-blue-700">
              <Home size={18} />
            </button>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-4">Order Details</h1>

        <div className="bg-black/70 border border-white rounded-xl p-6">
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
            <strong>Ordered From:</strong> {order.restaurantId?.name}
          </p>

          <hr className="my-4 border-white/20" />

          <h2 className="text-xl font-semibold mb-3">Items</h2>

          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between bg-black/40 p-3 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-white/70">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
          {order.deliveryAgentId && (
            <>
              <hr className="my-4 border-white/20" />

              <h2 className="text-xl font-semibold mb-2">
                Live Delivery Tracking
              </h2>

              {agentLocation ? (
                <div className="bg-black/40 p-4 rounded-lg">
                  <p>
                    <strong>Agent Latitude:</strong> {agentLocation.lat}
                  </p>
                  <p>
                    <strong>Agent Longitude:</strong> {agentLocation.lng}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400">
                  Waiting for delivery agent location...
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
