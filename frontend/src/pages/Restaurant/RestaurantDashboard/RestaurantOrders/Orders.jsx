import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/axiosInstance";
import Toast from "../../../../components/toast/toast";
import OrderTrackingMap from "../../../../components/OrderTrackingMap";
import { 
  Package, 
  MapPin, 
  User, 
  DollarSign, 
  Search, 
  Navigation, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Map,
  ClipboardList
} from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [restaurantLoc, setRestaurantLoc] = useState(null);
  const [activeTrackId, setActiveTrackId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
    loadRestaurantProfile();
  }, []);

  const loadRestaurantProfile = async () => {
    try {
      const res = await api.get("/api/restaurants/profile");
      setRestaurantLoc(res.data.location);
    } catch (err) {
      console.error("Failed to load restaurant profile location:", err);
    }
  };

  useEffect(() => {
    if (!activeTrackId) return;
    const interval = setInterval(() => {
      loadOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTrackId]);

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
      setToast({ type: "success", message: `Order status updated to ${status}!` });
    } catch {
      setToast({ type: "error", message: "Failed to update order status" });
    }
  };

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const ordersPerPage = 12;

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-400 font-medium">Loading restaurant orders...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 text-white max-w-7xl mx-auto space-y-8">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Restaurant Orders</h2>
          <p className="text-xs text-gray-400 mt-1">Manage food preparation state and track delivery dispatches</p>
        </div>

        {/* SEARCH BOX */}
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search order, customer, phone or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all duration-300 shadow-inner text-sm"
          />
        </div>
      </div>

      {/* ORDERS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedOrders.map((order) => {
          const hasAgent = Boolean(order.deliveryAgentId);
          const isMapOpen = activeTrackId === order._id;

          return (
            <div
              key={order._id}
              className={`bg-black/70 border border-white/20 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
                isMapOpen ? "md:col-span-2" : ""
              }`}
            >
              <div className={`flex flex-col ${isMapOpen ? "md:flex-row" : ""}`}>
                
                {/* LEFT DETAILS COLUMN */}
                <div className={`flex flex-col flex-1 ${isMapOpen ? "md:max-w-md border-r border-white/5" : ""}`}>
                  {/* CARD HEADER */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order ID</span>
                      <p className="text-xs font-mono font-bold text-orange-400 select-all">{order._id}</p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                        order.status === "delivered"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : order.status === "ready"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : order.status === "preparing"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* INFO SECTION */}
                  <div className="p-5 space-y-4 flex-1">
                    {/* CUSTOMER INFO */}
                    <div className="flex gap-3">
                      <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Customer Details</h4>
                        <p className="text-sm font-bold text-white mt-0.5">{order.customerId?.name || "N/A"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.customerId?.phone || "No phone"}</p>
                      </div>
                    </div>

                    {/* ITEMS LIST */}
                    <div className="flex gap-3">
                      <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                        <ClipboardList size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Items Ordered</h4>
                        <ul className="text-sm space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                          {order.items.map((i, idx) => (
                            <li key={idx} className="flex justify-between items-center text-gray-300">
                              <span className="font-medium text-white">{i.name}</span>
                              <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">×{i.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* FINANCIAL PANEL */}
                  <div className="px-5 py-3.5 bg-black/40 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order Total</span>
                    <p className="text-lg font-black text-emerald-400">₹{order.totalPrice}</p>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="p-4 bg-white/5 border-t border-white/10 space-y-2.5">
                    <div className="flex gap-3">
                      {/* STATUS DROPDOWN OR ASSIGNED STATE */}
                      {!hasAgent ? (
                        <div className="flex-1 flex gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order._id, e.target.value)}
                            className="flex-1 bg-black border border-white/20 px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                          </select>

                          {order.status === "ready" && (
                            <span className="px-3 py-2 text-xs bg-purple-600/20 text-purple-400 border border-purple-500/25 rounded-xl font-bold flex items-center justify-center animate-pulse">
                              Broadcasting...
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center py-2 px-3 bg-white/5 rounded-xl border border-white/5">
                          {order.status === "ready" && (
                            <span className="text-xs font-bold text-blue-400">Waiting for Pickup</span>
                          )}
                          {order.status === "picked" && (
                            <span className="text-xs font-bold text-amber-400">Agent Dispatched</span>
                          )}
                          {order.status === "delivered" && (
                            <span className="text-xs font-bold text-emerald-400">Completed & Delivered</span>
                          )}
                        </div>
                      )}

                      {/* TRACK AGENT BUTTON */}
                      {hasAgent && order.status !== "delivered" && (
                        <button
                          onClick={() => setActiveTrackId((prev) => (prev === order._id ? null : order._id))}
                          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Map size={14} />
                          {isMapOpen ? "Close Map" : "Track Agent"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: EXPANDED MAP ELEMENT */}
                {isMapOpen && (
                  <div className="flex-1 p-5 bg-black/20 flex flex-col justify-center min-h-[320px] md:min-h-0">
                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Map size={16} className="text-purple-400" />
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Live Delivery Track</span>
                      </div>
                      <button
                        onClick={() => setActiveTrackId(null)}
                        className="text-xs text-gray-400 hover:text-white transition"
                      >
                        Close
                      </button>
                    </div>

                    <div className="flex-1 overflow-hidden rounded-xl border border-white/10 relative min-h-[280px]">
                      {restaurantLoc?.lat && order.address?.location?.lat ? (
                        <OrderTrackingMap
                          restaurantLoc={restaurantLoc}
                          customerLoc={order.address.location}
                          agentLoc={order.deliveryAgentId?.location}
                          restaurantName="My Restaurant"
                          customerName={order.customerId?.name || "Customer"}
                          agentName={order.deliveryAgentId?.name || "Agent"}
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-950/20 text-red-400 p-4 text-center">
                          <AlertCircle size={24} />
                          <span className="text-xs font-semibold">Missing route coordinates. Map unavailable.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION PANEL */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-8 border-t border-white/10 pt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition border border-white/5 text-xs font-bold"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
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
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition border border-white/5 text-xs font-bold"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
