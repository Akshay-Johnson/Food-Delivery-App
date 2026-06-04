import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Home, Calendar, Utensils, DollarSign, ChevronRight, AlertCircle, ShoppingBag } from "lucide-react";
import Toast from "../../../components/toast/toast";

/* STATUS COLOR BADGE */
const statusBadge = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    case "accepted":
      return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    case "preparing":
      return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    case "ready":
      return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
    case "picked":
      return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
    case "delivered":
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    case "rejected":
      return "bg-red-500/10 text-red-400 border border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
  }
};

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
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
    <div className="relative min-h-screen text-white bg-zinc-950/40">
      {/* BACKGROUND */}
      <div className="fixed inset-0 bg-[url('/assets/restaurant/bg.webp')] bg-cover bg-center -z-20 pointer-events-none opacity-40 filter blur-[2px]" />
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950 -z-10 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Orders</h1>
            <p className="text-xs text-gray-400 mt-1">Review your purchase history and track active dispatches</p>
          </div>

          <div className="flex gap-2 self-start sm:self-auto shrink-0">
            <Link to="/customer/dashboard">
              <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition cursor-pointer" title="Dashboard">
                <Home size={16} />
              </button>
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="h-10 px-4 rounded-xl flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition text-xs font-bold cursor-pointer"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        </div>

        {/* LOADING & STATES */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-400 font-medium">Loading your order history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-black/70 border border-white/20 rounded-2xl py-16 text-center space-y-3">
            <div className="inline-flex p-4 rounded-full bg-white/5 text-gray-500">
              <ShoppingBag size={32} />
            </div>
            <p className="text-gray-400 text-base font-medium">You have not placed any orders yet.</p>
            <Link to="/customer/dashboard" className="inline-block">
              <button className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">
                Order Food Now
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* ORDERS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {orders.map((order) => {
                const itemsTotal = Number(order.totalPrice) || 0;
                const deliveryCharge = Number(order.deliveryCharge) || 0;
                const totalPayable = itemsTotal + deliveryCharge;

                return (
                  <div
                    key={order._id}
                    className="bg-black/70 border border-white/20 rounded-2xl p-4 flex flex-col justify-between hover:border-orange-500/30 transition duration-300 shadow-lg min-h-[300px]"
                  >
                    <div className="space-y-3">
                      {/* CARD HEADER: DISH NAMES & STATUS */}
                      <div className="flex justify-between items-start gap-2 border-b border-white/5 pb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-white truncate" title={order.items.map((i) => i.name).join(", ")}>
                            {order.items.map((i) => i.name).join(", ")}
                          </h3>
                          <span className="text-[10px] text-gray-500 font-semibold uppercase flex items-center gap-1 mt-0.5">
                            <Calendar size={10} />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 tracking-wider ${statusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      {/* MERCHANT NAME */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-300">
                        <Utensils size={12} className="text-orange-400 shrink-0" />
                        <span className="font-bold truncate">From: {order.restaurantId?.name || "Restaurant"}</span>
                      </div>

                      {/* BREAKDOWNS */}
                      <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-gray-400">
                        <div className="flex justify-between">
                          <span>Items Bill</span>
                          <span>₹{itemsTotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee</span>
                          <span>₹{deliveryCharge}</span>
                        </div>
                      </div>
                    </div>

                    {/* FOOTER TOTAL & CTAS */}
                    <div className="space-y-3 mt-4 pt-3 border-t border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Paid</span>
                        <span className="text-base font-black text-emerald-400">₹{totalPayable}</span>
                      </div>

                      <button
                        onClick={() => navigate(`/customer/orders/${order._id}`)}
                        className="w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        View Details
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION PANEL */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-8 border-t border-white/10 pt-6 pb-12">
                <button
                  disabled={page === 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition border border-white/5 text-xs font-bold cursor-pointer"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      disabled={loading}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition ${
                        page === i + 1
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg"
                          : "bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={page === totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition border border-white/5 text-xs font-bold cursor-pointer"
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
