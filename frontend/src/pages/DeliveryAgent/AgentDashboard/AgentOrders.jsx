import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

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
      alert("Action failed");
    }
  };

  if (loading) return <p className="text-white">Loading assigned orders...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Assigned Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-400">No assigned orders</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white/10 p-4 rounded-xl border border-white/20"
            >
              <h3 className="font-semibold">Order ID: {order._id}</h3>
              <p>Address: {order.address}</p>
              <p>Total: ₹{order.totalPrice}</p>
              <p>Status: {order.status}</p>

              <div className="flex gap-3 mt-3">
                {order.status === "ready" && (
                  <button
                    onClick={() => updateStatus(order._id, "pickup")}
                    className="bg-blue-600 px-3 py-1 rounded"
                  >
                    Picked Up
                  </button>
                )}

                {order.status === "picked" && (
                  <button
                    onClick={() => updateStatus(order._id, "deliver")}
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
