import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { Home } from "lucide-react";

/* 🔁 REUSABLE BUTTON STYLES */
const headerBtnBase =
  "h-11 flex items-center justify-center bg-blue-600 rounded hover:bg-blue-700 transition";

const headerIconBtn = `${headerBtnBase} w-11`;
const headerTextBtn = `${headerBtnBase} px-5`;

const cardActionBtn =
  "h-10 flex items-center justify-center bg-blue-600 rounded hover:bg-blue-700 transition";

/* 🎨 STATUS COLOR */
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

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const limit = 10; // 2 rows × 5 columns
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [page]);

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

  return (
    <div className="relative min-h-screen text-white">
      {/* BACKGROUND */}
      <div className="fixed inset-0 bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center -z-10" />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md -z-10" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <h1 className="text-3xl font-bold">My Orders</h1>

          <div className="flex gap-2">
            <Link to="/customer/dashboard">
              <button className={headerIconBtn}>
                <Home size={18} />
              </button>
            </Link>

            <button
              onClick={() => navigate(-1)}
              className={headerTextBtn}
            >
              ← Back
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-300 py-20">
            Loading orders...
          </p>
        ) : orders.length === 0 ? (
          <p className="text-gray-300">
            You have not placed any orders yet.
          </p>
        ) : (
          <>
            {/* ORDERS GRID — 2 ROWS × 5 COLUMNS */}
            <div className="grid grid-cols-5 grid-rows-2 gap-6 pb-6">
              {orders.map((order) => {
                const itemsTotal = Number(order.totalPrice) || 0;
                const deliveryCharge =
                  Number(order.deliveryCharge) || 0;
                const totalPayable =
                  itemsTotal + deliveryCharge;

                return (
                  <div
                    key={order._id}
                    className="bg-black/70 border border-white/30
                               rounded-xl p-5 shadow-lg
                               flex flex-col h-68"
                  >
                    {/* TOP CONTENT */}
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold line-clamp-2">
                          {order.items
                            .map((i) => i.name)
                            .join(", ")}
                        </h3>

                        <span
                          className={`text-xs px-3 py-1 rounded-full ${statusColor(
                            order.status
                          )}`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-sm text-gray-300 mb-1">
                        {new Date(
                          order.createdAt
                        ).toLocaleString()}
                      </p>

                      <p className="text-sm text-gray-300 mb-2">
                        From:{" "}
                        {order.restaurantId?.name ||
                          "Restaurant"}
                      </p>

                      <p className="text-sm text-gray-300">
                        Items: ₹{itemsTotal}
                      </p>

                      <p className="text-sm text-gray-300">
                        Delivery: ₹{deliveryCharge}
                      </p>

                      <p className="font-bold mt-1 text-lg">
                        Total: ₹{totalPayable}
                      </p>
                    </div>

                    {/* ACTION BUTTON */}
                    <button
                      onClick={() =>
                        navigate(
                          `/customer/orders/${order._id}`
                        )
                      }
                      className={`${cardActionBtn} mt-auto`}
                    >
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pb-12">
                <button
                  disabled={page === 1 || loading}
                  onClick={() =>
                    setPage((p) => p - 1)
                  }
                  className={`${headerTextBtn} disabled:opacity-50`}
                >
                  Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    disabled={loading}
                    className={`h-11 px-4 rounded ${
                      page === i + 1
                        ? "bg-green-600"
                        : "bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={
                    page === totalPages || loading
                  }
                  onClick={() =>
                    setPage((p) => p + 1)
                  }
                  className={`${headerTextBtn} disabled:opacity-50`}
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
