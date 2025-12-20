import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import {
  startLocationTracking,
  stopLocationTracking,
} from "../../../services/locationService";

export default function AgentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get("/api/agents/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, action) => {
    try {
      await api.put(`/api/agents/orders/${action}/${id}`);
      loadOrders();
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Action failed");
    }
  };

  const pickupOrder = async (order) => {
    await api.put(`/api/agents/orders/picked/${order._id}`);
    startLocationTracking(order.deliveryAgentId, order._id);
    loadOrders();
  };

  const deliverOrder = async (order) => {
  await api.put(`/api/agents/orders/delivered/${order._id}`);
  await stopLocationTracking(order.deliveryAgentId);
  loadOrders();
};


  if (loading) return <p className="text-white">Loading assigned orders...</p>;

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6">Assigned Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-400">No assigned orders</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-black/70 p-4 rounded-xl border border-white/20 w-sm"
            >
              <h3 className="font-semibold">Order ID: {order._id}</h3>
              <p>Customer: {order.customerId?.name || "N/A"}</p>
              <p>Phone: {order.customerId?.phone || "N/A"}</p>
              <p>Address: {order.restaurantId?.address || "N/A"}</p>
              <p>Total: ₹{order.totalPrice}</p>
              <p>Status: {order.status}</p>

              <div className="flex gap-3 mt-3">
                {order.status === "ready" && (
                  <button
                    onClick={() => updateStatus(order._id, "picked")}
                    className="bg-blue-600 px-3 py-1 rounded"
                  >
                    Pick Up
                  </button>
                )}

                {order.status === "picked" && (
                  <button
                    onClick={() => updateStatus(order._id, "delivered")}
                    className="bg-green-600 px-3 py-1 rounded"
                  >
                    Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
