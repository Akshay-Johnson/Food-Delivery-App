import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/axiosInstance";
import Toast from "../../../../components/toast/toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const ordersPerPage = 12;

  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get("/api/restaurants/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/api/restaurants/orders/${orderId}/${status}`);
      loadOrders();
    } catch {
      setToast({ type: "error", message: "Failed to update order status" });
    }
  };

  const filteredOrders = orders.filter((order) => {
    const q = search.toLowerCase();
    return (
      order._id.toLowerCase().includes(q) ||
      order.status.toLowerCase().includes(q) ||
      order.customerId?.name?.toLowerCase().includes(q) ||
      order.customerId?.phone?.includes(q)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ordersPerPage,
    page * ordersPerPage
  );

  useEffect(() => setPage(1), [search]);

  if (loading) return <p className="text-white p-6">Loading orders...</p>;

  return (
    <div className="p-6 text-white">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex gap-4 mb-4">
        <h2 className="text-2xl font-bold">Restaurant Orders</h2>
        <input
          type="text"
          placeholder="Search order, customer, phone or status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-sm px-4 py-2 rounded-2xl bg-black/40 border border-white/20"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedOrders.map((order) => {
          const hasAgent = Boolean(order.deliveryAgentId);

          return (
            <div
              key={order._id}
              className="bg-black/70 border border-white/20 rounded-xl p-4 flex flex-col"
            >
              {/* HEADER */}
              <p className="text-xs text-gray-400">Order ID</p>
              <p className="text-blue-400 text-sm break-all">{order._id}</p>

              {/* CUSTOMER */}
              <p className="text-sm mt-2">
                <span className="text-gray-400">Customer:</span>{" "}
                {order.customerId?.name || "N/A"}
              </p>

              {/* ITEMS */}
              <ul className="text-sm list-disc list-inside mt-2 line-clamp-3">
                {order.items.map((i, idx) => (
                  <li key={idx}>
                    {i.name} × {i.quantity}
                  </li>
                ))}
              </ul>

              {/* FOOTER */}
              <div className="mt-auto flex justify-between items-center pt-3">
                <p className="font-bold text-green-400">
                  ₹{order.totalPrice}
                </p>

                <div className="flex gap-2 items-center">
                  {/* STATUS DROPDOWN (before agent assignment) */}
                  {!hasAgent && (
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(order._id, e.target.value)
                      }
                      className="bg-black border border-white px-2 py-1 rounded text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                    </select>
                  )}

                  {/* ASSIGN BUTTON */}
                  {order.status === "ready" && !hasAgent && (
                    <button
                      onClick={() =>
                        navigate(
                          `/restaurant/dashboard/assign-agent/${order._id}`
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                    >
                      Assign
                    </button>
                  )}

                  {/* STATUS BADGES */}
                  {hasAgent && order.status === "ready" && (
                    <span className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded">
                      Waiting for Pickup
                    </span>
                  )}

                  {hasAgent && order.status === "picked" && (
                    <span className="px-2 py-1 text-xs bg-yellow-600/20 text-yellow-400 rounded">
                      On Delivery
                    </span>
                  )}

                  {hasAgent && order.status === "delivered" && (
                    <span className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded">
                      Delivered
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 bg-blue-600 rounded disabled:opacity-50"
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
            className="px-3 py-1 bg-blue-600 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
