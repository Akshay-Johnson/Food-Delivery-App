import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/axiosInstance";
import Toast from "../../../../components/toast/toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Search
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const ordersPerPage = 6;

  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get("/api/restaurants/orders");
      setOrders(res.data.orders || []);
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
      setToast({ type: "error", message: "Failed to update order status" });
    }
  };

  /* ================= SEARCH FILTER ================= */
  const filteredOrders = orders.filter((order) => {
    const q = search.toLowerCase();

    return (
      order._id.toLowerCase().includes(q) ||
      order.status.toLowerCase().includes(q) ||
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

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) {
    return <p className="text-white p-6">Loading orders...</p>;
  }

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Restaurant Orders</h2>

      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by order ID, customer, phone or status"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-400"
      />

      {paginatedOrders.length === 0 ? (
        <p className="text-gray-400">No matching orders found.</p>
      ) : (
        <>
          {/* ORDERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedOrders.map((order) => (
              <div
                key={order._id}
                className="bg-black/70 p-5 rounded-xl border border-white/20"
              >
                {/* HEADER */}
                <div className="flex justify-between mb-2">
                  <p className="font-semibold">
                    Order ID:{" "}
                    <span className="text-blue-400">{order._id}</span>
                  </p>
                  <span className="text-sm text-gray-300">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* CUSTOMER */}
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

                {/* ITEMS */}
                <ul className="text-sm text-gray-300 mb-3 list-disc list-inside">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} × {item.qty}
                    </li>
                  ))}
                </ul>

                {/* FOOTER */}
                <div className="flex justify-between items-center">
                  <p className="font-bold text-green-400">
                    ₹{order.totalPrice}
                  </p>

                  <div className="flex items-center gap-3">
                    {/* ✅ STATUS DROPDOWN — ONLY BEFORE AGENT ASSIGN */}
                    {!order.deliveryAgentId && (
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order._id, e.target.value)
                        }
                        className="bg-black border border-white px-3 py-1 rounded"
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                      </select>
                    )}

                    {/* ASSIGN AGENT */}
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

                    {/* STATUS BADGES */}
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
