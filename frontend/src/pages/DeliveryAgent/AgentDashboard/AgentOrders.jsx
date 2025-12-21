import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import {
  startLocationTracking,
  stopLocationTracking,
} from "../../../services/locationService";
import Toast from "../../../components/toast/toast";

export default function AgentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // 🔍 Search
  const [search, setSearch] = useState("");

  // 📄 Pagination
  const [page, setPage] = useState(1);
  const ordersPerPage = 6;

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
      setToast({
        type: "error",
        message: "Failed to update order status",
      });
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

  /* ================= SEARCH FILTER ================= */
  const filteredOrders = orders.filter((order) => {
    const q = search.toLowerCase();

    return (
      order._id.toLowerCase().includes(q) ||
      order.status?.toLowerCase().includes(q) ||
      order.customerId?.name?.toLowerCase().includes(q) ||
      order.customerId?.phone?.includes(q)
    );
  });

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (page - 1) * ordersPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + ordersPerPage
  );

  // reset page on search
  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) return <p className="text-white">Loading assigned orders...</p>;

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6">Assigned Orders</h2>

      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* 🔍 SEARCH BAR */}
      <input
        type="text"
        placeholder="Search by order ID, customer, phone or status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-400"
      />

      {paginatedOrders.length === 0 ? (
        <p className="text-gray-400">No matching orders found</p>
      ) : (
        <>
          {/* ORDERS GRID */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
            {paginatedOrders.map((order) => (
              <div
                key={order._id}
                className="bg-black/70 p-4 rounded-xl border border-white/20"
              >
                <h3 className="font-semibold mb-1">
                  Order ID: {order._id}
                </h3>
                <p>Customer: {order.customerId?.name || "N/A"}</p>
                <p>Phone: {order.customerId?.phone || "N/A"}</p>
                <p>Address: {order.restaurantId?.address || "N/A"}</p>
                <p>Total: ₹{order.totalPrice}</p>
                <p>Status: {order.status}</p>

                <div className="flex gap-3 mt-3">
                  {order.status === "ready" && (
                    <button
                      onClick={() => updateStatus(order._id, "picked")}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                    >
                      Pick Up
                    </button>
                  )}

                  {order.status === "picked" && (
                    <button
                      onClick={() => updateStatus(order._id, "delivered")}
                      className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                    >
                      Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded bg-blue-600 disabled:opacity-50"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    page === i + 1
                      ? "bg-green-600"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded bg-blue-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
