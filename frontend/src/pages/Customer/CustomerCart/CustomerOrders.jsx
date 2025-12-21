import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    fetchOrders();
  }, [page]);

  /* ================= SMOOTH SCROLL (ONLY PAGE CHANGE) ================= */
  useEffect(() => {
    if (page > 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/orders/my-orders", {
        params: { page, limit },
      });

      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATUS COLOR ================= */
  const statusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-blue-500";
      case "preparing":
        return "bg-purple-500";
      case "ready":
        return "bg-orange-500";
      case "picked":
        return "bg-indigo-500";
      case "delivered":
        return "bg-green-600";
      case "rejected":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* FIXED BACKGROUND */}
      <div className="fixed inset-0 bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center -z-10"></div>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md -z-10"></div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-3xl mx-auto px-2">
        {/* TOP BAR */}
        <div className="mb-6 flex justify-end gap-2 pt-10">
          <Link to="/customer/dashboard">
            <button className="bg-blue-600 px-4 py-3 rounded hover:bg-blue-700">
              <Home size={18} />
            </button>
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {loading ? (
          <p className="text-center text-gray-300 py-20">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-300">You have not placed any orders yet.</p>
        ) : (
          <>
            {/* ORDERS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6 pb-6 ">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-black/70 border border-white rounded-xl p-5 shadow-lg flex flex-col h-full"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">
                      {order.items.map((item) => item.name).join(", ")}
                    </h3>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${statusColor(
                        order.status
                      )}`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mb-2">
                    Ordered on {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-300">
                    From: {order.restaurantId?.name}
                  </p>
                  <p className="font-bold mt-3">Total: ₹{order.totalPrice}</p>

                  <button
                    onClick={() => navigate(`/customer/orders/${order._id}`)}
                    className="mt-auto bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* PAGINATION (TRUE CENTER) */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pb-12">
                <button
                  disabled={page === 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded bg-blue-600 disabled:opacity-50"
                >
                  Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    disabled={loading}
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
                  disabled={page === totalPages || loading}
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
    </div>
  );
}
