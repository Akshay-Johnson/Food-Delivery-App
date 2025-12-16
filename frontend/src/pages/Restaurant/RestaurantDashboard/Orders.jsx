import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 NEW
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get("/api/restaurants/orders");
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
      await api.put(`/api/restaurants/orders/${orderId}/${status}`);
      loadOrders();
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Failed to update order status");
    }
  };

  // 🔍 FILTER LOGIC
  const filteredOrders = orders.filter((order) => {
    const q = search.toLowerCase();

    return (
      order._id.toLowerCase().includes(q) ||
      order.status.toLowerCase().includes(q) ||
      order.customerId?.name?.toLowerCase().includes(q) ||
      order.customerId?.phone?.includes(q)
    );
  });

  if (loading) {
    return <p className="text-white p-6">Loading orders...</p>;
  }

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Restaurant Orders</h2>

      {/* 🔍 SEARCH INPUT */}
      <input
        type="text"
        placeholder="Search by order ID, customer, phone or status"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded bg-black/40 border border-white/20 text-white placeholder-gray-400"
      />

      {filteredOrders.length === 0 ? (
        <p className="text-gray-400">No matching orders found.</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
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
                <span className="font-semibold">
                  {order.customerId?.name || "N/A"}
                </span>
                {order.customerId?.phone && (
                  <span className="text-gray-400">
                    {" "}
                    ({order.customerId.phone})
                  </span>
                )}
                {order.customerId?.email && (
                  <span className="text-gray-400">
                    {" "}
                    – {order.customerId.email}
                  </span>
                )}
              </p>

              <ul className="text-sm text-gray-300 mb-3 list-disc list-inside">
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} × {item.qty}
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center">
                <p className="font-bold text-green-400">₹{order.totalPrice}</p>

                <div className="flex items-center gap-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="bg-black border border-white px-3 py-1 rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
  
                  </select>
                  {order.status === "ready" && !order.deliveryAgentId && (
                    <button
                      onClick={() =>
                        navigate(
                          `/restaurant/dashboard/assign-agent/${order._id}`
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm"
                    >
                      Assign Agent
                    </button>
                  )}
                  {/* STATUS BADGE */}
                  {order.deliveryAgentId && (
                    <>
                      {order.status === "ready" && (
                        <span className="px-3 py-1 text-sm bg-blue-700/30 text-blue-400 rounded">
                          Assigned
                        </span>
                      )}

                      {order.status === "picked" && (
                        <span className="px-3 py-1 text-sm bg-yellow-700/30 text-yellow-400 rounded">
                          Picked Up
                        </span>
                      )}

                        {order.status === "cancelled" && (
                        <span className="px-3 py-1 text-sm bg-yellow-700/30 text-yellow-400 rounded">
                          Cancelled
                        </span>
                      )}


                      {order.status === "delivered" && (
                        <span className="px-4 py-1 text-sm font-semibold bg-emerald-700/30 text-emerald-400 rounded">
                          Delivered
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
