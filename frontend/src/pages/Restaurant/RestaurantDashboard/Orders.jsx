import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get("/api/restaurants/orders"); // ✅ correct backend route
      setOrders(res.data.orders);
    } catch (error) {
      console.error(
        "Failed to load orders:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/api/orders/${orderId}`, { status });
      loadOrders();
    } catch (error) {
      console.error(
        "Status update failed:",
        error.response?.data || error.message
      );
      alert("Failed to update order status");
    }
  };

  if (loading) {
    return <p className="text-white p-6">Loading orders...</p>;
  }

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Restaurant Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-400">No orders received yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white/10 p-5 rounded-xl border border-white/20"
            >
              <div className="flex justify-between mb-2">
                <p className="font-semibold">
                  Order ID: <span className="text-blue-400">{order._id}</span>
                </p>
                <span className="text-sm text-gray-300">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="text-sm mb-2">
                Customer:{" "}
                <span className="font-semibold">{order.customer?.name}</span>
              </p>

              <ul className="text-sm text-gray-300 mb-3 list-disc list-inside">
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} × {item.qty}
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center">
                <p className="font-bold text-green-400">
                  ₹{order.totalAmount}
                </p>

                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(order._id, e.target.value)
                  }
                  className="bg-black/40 border border-white/20 px-3 py-1 rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
