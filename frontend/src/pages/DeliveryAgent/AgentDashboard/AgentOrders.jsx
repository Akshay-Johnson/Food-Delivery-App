import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import Toast from "../../../components/toast/toast";
import OrderTrackingMap from "../../../components/OrderTrackingMap";
import { 
  Package, 
  Bike, 
  MapPin, 
  Store, 
  DollarSign, 
  Search, 
  Navigation, 
  CheckCircle, 
  AlertCircle,
  Clock,
  User,
  ArrowRight,
  TrendingUp,
  Map,
  Compass
} from "lucide-react";

export default function AgentOrders() {
  const [orders, setOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("assigned"); // "assigned" | "available"
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTrackId, setActiveTrackId] = useState(null);

  // Search
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const ordersPerPage = 8;

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadOrders(), loadAvailableOrders()]);
      setLoading(false);
    };
    init();
  }, []);

  // Update geolocation loop
  useEffect(() => {
    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              await api.put("/api/agents/location", {
                lat: Number(latitude.toFixed(5)),
                lng: Number(longitude.toFixed(5)),
              });
            } catch (err) {
              console.error("Failed to update agent location:", err);
            }
          },
          (err) => console.warn("Geolocation permission error:", err),
          { enableHighAccuracy: true }
        );
      }
    };

    updateLocation();
    const interval = setInterval(updateLocation, 6000);

    return () => clearInterval(interval);
  }, [orders]);

  // Periodic polling
  useEffect(() => {
    let interval;
    if (activeTab === "available") {
      loadAvailableOrders();
      interval = setInterval(loadAvailableOrders, 5000);
    } else {
      loadOrders();
      interval = setInterval(loadOrders, 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      const res = await api.get("/api/agents/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Failed to load assigned orders:", error);
      setOrders([]);
    }
  };

  const loadAvailableOrders = async () => {
    try {
      const res = await api.get("/api/agents/orders/available-nearby");
      setAvailableOrders(res.data || []);
    } catch (error) {
      console.error("Failed to load available orders:", error);
      setAvailableOrders([]);
    }
  };

  const updateStatus = async (id, action) => {
    try {
      await api.put(`/api/agents/orders/${action}/${id}`);
      loadOrders();
      setToast({ type: "success", message: `Order status updated to ${action}!` });
    } catch {
      setToast({
        type: "error",
        message: "Failed to update order status",
      });
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      await api.put(`/api/agents/orders/accept/${orderId}`);
      setToast({ type: "success", message: "Order accepted successfully!" });
      setActiveTab("assigned");
      loadOrders();
      loadAvailableOrders();
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to accept order",
      });
    }
  };

  /* DYNAMIC STATS PANEL CALCULATIONS */
  const activeCount = orders.filter((o) => o.status !== "delivered").length;
  const availableCount = availableOrders.length;
  const totalEarnings = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (o.agentEarning ?? o.deliveryCharge ?? 0), 0);

  /* SEARCH & FILTERING */
  const activeOrdersList = activeTab === "assigned" ? orders : availableOrders;

  const filteredOrders = activeOrdersList.filter((order) => {
    const q = search.toLowerCase();
    const restName = order.restaurantId?.name || "";
    const custName = order.customerId?.name || "";
    return (
      order._id.toLowerCase().includes(q) ||
      order.status?.toLowerCase().includes(q) ||
      restName.toLowerCase().includes(q) ||
      custName.toLowerCase().includes(q)
    );
  });

  /* PAGINATION */
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ordersPerPage,
    page * ordersPerPage
  );

  useEffect(() => setPage(1), [search, activeTab]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-400 font-medium">Loading dispatcher records...</p>
      </div>
    );
  }

  return (
    <div className="text-white p-4 max-w-7xl mx-auto space-y-8">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Dispatcher Online</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            Agent Dispatch Console
          </h2>
        </div>

        {/* SEARCH BOX */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search active orders, stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all duration-300 shadow-inner text-sm"
          />
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* STAT 1: ACTIVE TASKS */}
        <div className="bg-black/70 border border-white/20 rounded-2xl p-5 flex items-center justify-between shadow-xl relative overflow-hidden group">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Deliveries</p>
            <p className="text-3xl font-black text-orange-500">{activeCount}</p>
          </div>
          <div className="bg-orange-500/10 p-3 rounded-xl text-orange-400">
            <Bike size={24} />
          </div>
        </div>

        {/* STAT 2: AVAILABLE JOBS */}
        <div className="bg-black/70 border border-white/20 rounded-2xl p-5 flex items-center justify-between shadow-xl relative overflow-hidden group">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Nearby</p>
            <p className="text-3xl font-black text-purple-500">{availableCount}</p>
          </div>
          <div className="bg-purple-500/10 p-3 rounded-xl text-purple-400">
            <Compass size={24} />
          </div>
        </div>

        {/* STAT 3: COMPLETED EARNINGS */}
        <div className="bg-black/70 border border-white/20 rounded-2xl p-5 flex items-center justify-between shadow-xl relative overflow-hidden group">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today's Payout</p>
            <p className="text-3xl font-black text-emerald-400">₹{totalEarnings}</p>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* TABS SWITCHER */}
      <div className="flex gap-4 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("assigned")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === "assigned"
              ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
              : "bg-white/5 hover:bg-white/10 text-gray-300"
          }`}
        >
          My Assigned Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("available")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === "available"
              ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
              : "bg-white/5 hover:bg-white/10 text-gray-300"
          }`}
        >
          Available Nearby Jobs ({availableOrders.length})
        </button>
      </div>

      {/* JOBS CONTAINER */}
      {paginatedOrders.length === 0 ? (
        <div className="bg-black/70 border border-white/20 rounded-2xl py-16 text-center space-y-3">
          <div className="inline-flex p-4 rounded-full bg-white/5 text-gray-500">
            <AlertCircle size={32} />
          </div>
          <p className="text-gray-400 text-base font-medium">No dispatcher records match your filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ORDERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedOrders.map((order) => {
              const earning = order.agentEarning ?? order.deliveryCharge ?? 0;
              const customerAddress =
                typeof order.address === "object"
                  ? `${order.address.addressLine1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`
                  : "Address not available";
              
              const isMapOpen = activeTrackId === order._id;

              return (
                <div
                  key={order._id}
                  className={`bg-black/70 border border-white/20 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
                    isMapOpen ? "md:col-span-2" : ""
                  }`}
                >
                  <div className={`flex flex-col ${isMapOpen ? "md:flex-row" : ""}`}>
                    
                    {/* LEFT COLUMN: DETAILS */}
                    <div className={`flex flex-col flex-1 ${isMapOpen ? "md:max-w-md border-r border-white/5" : ""}`}>
                      {/* CARD HEADER */}
                      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order ID</span>
                          <p className="text-xs font-mono font-bold text-orange-400 select-all">{order._id}</p>
                        </div>

                        {/* STATUS TAG */}
                        {activeTab === "assigned" && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                              order.status === "delivered"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : order.status === "picked"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {order.status}
                          </span>
                        )}

                        {order.distance !== undefined && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {order.distance.toFixed(1)} km away
                          </span>
                        )}
                      </div>

                      {/* INFO SECTION */}
                      <div className="p-5 space-y-4 flex-1">
                        {/* RESTAURANT INFO */}
                        <div className="flex gap-3">
                          <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                            <Store size={18} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Store / Pickup</h4>
                            <p className="text-sm font-bold text-white mt-0.5">{order.restaurantId?.name || "N/A"}</p>
                          </div>
                        </div>

                        {/* CUSTOMER INFO */}
                        <div className="flex gap-3">
                          <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Destination Address</h4>
                            {activeTab === "assigned" && (
                              <p className="text-xs font-bold text-gray-200 mt-0.5">
                                Customer: {order.customerId?.name || "N/A"}
                              </p>
                            )}
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">{customerAddress}</p>
                          </div>
                        </div>
                      </div>

                      {/* FINANCIAL PANEL */}
                      <div className="px-5 py-3.5 bg-black/40 border-t border-white/10 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order Bill</span>
                          <p className="text-base font-extrabold text-white mt-0.5">₹{order.totalPrice}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Your Pay</span>
                          <p className="text-lg font-black text-emerald-400 mt-0.5">₹{earning}</p>
                        </div>
                      </div>

                      {/* ACTIONS BOX */}
                      <div className="p-4 bg-white/5 border-t border-white/10 space-y-2.5">
                        <div className="flex gap-3">
                          {activeTab === "available" ? (
                            <button
                              onClick={() => acceptOrder(order._id)}
                              className="flex-1 bg-green-600 hover:bg-green-700 py-2.5 rounded-xl font-extrabold text-sm tracking-wide transition text-white"
                            >
                              Accept Job
                            </button>
                          ) : (
                            <>
                              {order.status === "ready" && (
                                <button
                                  onClick={() => updateStatus(order._id, "picked")}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl font-extrabold text-sm tracking-wide transition text-white"
                                >
                                  Pick Up Order
                                </button>
                              )}

                              {order.status === "picked" && (
                                <button
                                  onClick={() => updateStatus(order._id, "delivered")}
                                  className="flex-1 bg-green-600 hover:bg-green-700 py-2.5 rounded-xl font-extrabold text-sm tracking-wide transition text-white"
                                >
                                  Complete Delivery
                                </button>
                              )}
                            </>
                          )}

                          {order.status !== "delivered" && (
                            <button
                              onClick={() =>
                                setActiveTrackId((prev) =>
                                  prev === order._id ? null : order._id
                                )
                              }
                              className="px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Map size={14} />
                              {isMapOpen ? "Close Map" : "View Route"}
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
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Live Delivery Route</span>
                          </div>
                          <button
                            onClick={() => setActiveTrackId(null)}
                            className="text-xs text-gray-400 hover:text-white transition"
                          >
                            Close
                          </button>
                        </div>
                        
                        <div className="flex-1 overflow-hidden rounded-xl border border-white/10 relative min-h-[280px]">
                          {order.restaurantId?.location?.lat && order.address?.location?.lat ? (
                            <OrderTrackingMap
                              restaurantLoc={order.restaurantId.location}
                              customerLoc={order.address.location}
                              restaurantName={order.restaurantId.name || "Restaurant"}
                              customerName={order.address.fullName || "Customer"}
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
      )}
    </div>
  );
}
