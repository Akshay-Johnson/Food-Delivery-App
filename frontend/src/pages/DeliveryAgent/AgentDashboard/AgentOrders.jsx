import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import Toast from "../../../components/toast/toast";

export default function AgentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // 🔍 Search
  const [search, setSearch] = useState("");

  // 📄 Pagination
  const [page, setPage] = useState(1);
  const ordersPerPage = 8;

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
    } catch {
      setToast({
        type: "error",
        message: "Failed to update order status",
      });
    }
  };

  /* 🔍 SEARCH */
  const filteredOrders = orders.filter((order) => {
    const q = search.toLowerCase();
    return (
      order._id.toLowerCase().includes(q) ||
      order.status?.toLowerCase().includes(q) ||
      order.customerId?.name?.toLowerCase().includes(q) ||
      order.customerId?.phone?.includes(q)
    );
  });

  /* 📄 PAGINATION */
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ordersPerPage,
    page * ordersPerPage
  );

  useEffect(() => setPage(1), [search]);

  if (loading) {
    return <p className="text-white">Loading assigned orders...</p>;
  }

  return (
    <div className="text-white">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* HEADER */}
      <div className="flex items-center gap-6 mb-6">
        <h2 className="text-2xl font-bold">Assigned Orders</h2>

        <input
          type="text"
          placeholder="Search by order ID, customer, phone or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-sm px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
        />
      </div>

      {paginatedOrders.length === 0 ? (
        <p className="text-gray-400">No matching orders found</p>
      ) : (
        <>
          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedOrders.map((order) => {
              const earning =
                order.agentEarning ?? order.deliveryCharge ?? 0;

              const customerAddress =
                typeof order.address === "object"
                  ? `${order.address.addressLine1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`
                  : "Address not available";

              return (
                <div
                  key={order._id}
                  className="bg-black/70 border border-white/20 rounded-xl p-4 flex flex-col h-70"
                >
                  {/* ORDER ID */}
                  <p className="text-xs text-gray-400">Order ID</p>
                  <p className="text-blue-400 text-sm break-all mb-2">
                    {order._id}
                  </p>

                  {/* CUSTOMER */}
                  <p className="text-sm text-gray-300">
                    <span className="text-gray-400">Customer:</span>{" "}
                    {order.customerId?.name || "N/A"}
                  </p>

                  <p className="text-sm text-gray-300">
                    <span className="text-gray-400">Phone:</span>{" "}
                    {order.customerId?.phone || "N/A"}
                  </p>

                  {/* ✅ DELIVERY ADDRESS */}
                  <p className="text-sm text-gray-300 line-clamp-3 mt-1">
                    <span className="text-gray-400">Delivery Address:</span>{" "}
                    {customerAddress}
                  </p>

                  {/* AMOUNTS */}
                  <p className="text-sm text-green-400 font-semibold mt-2">
                    Order Amount: ₹{order.totalPrice}
                  </p>

                  <p className="text-sm text-yellow-400 font-medium">
                    Your Earning: ₹{earning}
                  </p>

                  {/* STATUS */}
                  <span
                    className={`mt-2 inline-block w-fit px-3 py-1 text-xs rounded-full capitalize ${
                      order.status === "delivered"
                        ? "bg-green-600/20 text-green-400"
                        : order.status === "picked"
                        ? "bg-yellow-600/20 text-yellow-400"
                        : "bg-blue-600/20 text-blue-400"
                    }`}
                  >
                    {order.status}
                  </span>

                  {/* ACTIONS */}
                  <div className="mt-auto">
                    {order.status === "ready" && (
                      <button
                        onClick={() =>
                          updateStatus(order._id, "picked")
                        }
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded w-full"
                      >
                        Pick Up
                      </button>
                    )}

                    {order.status === "picked" && (
                      <button
                        onClick={() =>
                          updateStatus(order._id, "delivered")
                        }
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded w-full"
                      >
                        Delivered
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
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
