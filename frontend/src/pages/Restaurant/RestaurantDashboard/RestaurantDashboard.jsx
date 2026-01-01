import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../../src/api/axiosInstance.js";
import { messaging } from "../../../firebase.js";
import { getToken } from "firebase/messaging";

import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  User,
  LogOut,
  UtensilsCrossed,
  Bike,
  MessageSquare,
  IndianRupee,
  BarChart3,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const isOverview = location.pathname === "/restaurant/dashboard";

  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    menuItems: 0,
    todayOrders: 0,
    avgOrderValue: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [topDishes, setTopDishes] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    saveFCMToken();
    if (isOverview) loadDashboardStats();
  }, [isOverview]);

  /* ================= SAVE FCM TOKEN ================= */
  const saveFCMToken = async () => {
    try {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (token) {
        await api.post("/api/restaurants/save-fcm-token", {
          fcmToken: token,
        });
      }
    } catch (err) {
      console.error("FCM token error:", err);
    }
  };

  /* ================= LOAD DASHBOARD DATA ================= */
  const loadDashboardStats = async () => {
    try {
      const [ordersRes, menuRes] = await Promise.all([
        api.get("/api/restaurants/orders"),
        api.get("/api/menu/my/menu"),
      ]);

      const orders = ordersRes.data.orders || [];
      const menuItems = menuRes.data || [];

      const revenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      const todayOrders = orders.filter((o) => {
        const today = new Date();
        const d = new Date(o.createdAt);
        return d.toDateString() === today.toDateString();
      }).length;

      const avgOrderValue =
        orders.length > 0 ? Math.round(revenue / orders.length) : 0;

      setStats({
        orders: orders.length,
        revenue,
        menuItems: menuItems.length,
        todayOrders,
        avgOrderValue,
      });

      /* ---------- WEEKLY CHART ---------- */
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const grouped = {};

      orders.forEach((o) => {
        const day = days[new Date(o.createdAt).getDay()];
        grouped[day] = (grouped[day] || 0) + 1;
      });

      setChartData(
        days.map((d) => ({
          day: d,
          orders: grouped[d] || 0,
        }))
      );

      /* ---------- TOP 5 DISHES ---------- */
      const dishMap = {};

      orders.forEach((order) => {
        order.items.forEach((item) => {
          if (!dishMap[item.name]) {
            dishMap[item.name] = {
              name: item.name,
              count: 0,
              image: item.image,
              price: item.price,
            };
          }
          dishMap[item.name].count += item.quantity;
        });
      });

      const topFive = Object.values(dishMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopDishes(topFive);
    } catch (error) {
      console.error(
        "Failed to load dashboard stats:",
        error.response?.data || error.message
      );
    } finally {
      setLoadingStats(false);
    }
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.clear();
    navigate("/restaurant/login");
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="relative min-h-screen text-white bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      <div className="relative z-10 flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="w-24 bg-black/70 backdrop-blur-lg border-r border-white/10 p-4 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-blue-500 mb-8">DX</h1>

          <nav className="space-y-3">
            <SidebarLink to="/restaurant/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink to="/restaurant/dashboard/menu" icon={UtensilsCrossed} label="Menu" />
            <SidebarLink to="/restaurant/dashboard/menu/add" icon={PlusCircle} label="Add Item" />
            <SidebarLink to="/restaurant/dashboard/orders" icon={ClipboardList} label="Orders" />
            <SidebarLink to="/restaurant/dashboard/agents" icon={Bike} label="Agents" />
            <SidebarLink to="/restaurant/dashboard/profile" icon={User} label="Profile" />
            <SidebarLink to="/restaurant/dashboard/reviews" icon={MessageSquare} label="Reviews" />
          </nav>

          <button
            onClick={logout}
            className="relative group mt-auto bg-red-600/80 hover:bg-red-600 p-3 rounded-lg"
          >
            <LogOut size={18} />
            <Tooltip text="Logout" />
          </button>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6 overflow-y-auto">
          {isOverview ? (
            <>
              {loadingStats ? (
                <p className="text-gray-400">Loading stats…</p>
              ) : (
                <>
                  {/* STATS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatCard label="Total Orders" value={stats.orders} icon={ClipboardList} color="text-blue-400" />
                    <StatCard label="Revenue" value={formatCurrency(stats.revenue)} icon={IndianRupee} color="text-green-400" />
                    <StatCard label="Menu Items" value={stats.menuItems} icon={UtensilsCrossed} color="text-yellow-400" />
                    <StatCard label="Today's Orders" value={stats.todayOrders} icon={Bike} color="text-purple-400" />
                    <StatCard label="Avg Order Value" value={formatCurrency(stats.avgOrderValue)} icon={BarChart3} color="text-pink-400" />
                  </div>

                  {/* TOP DISHES */}
                  {topDishes.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">🔥 Top Trending Dishes</h3>

                     <div className="grid grid-flow-col auto-cols-[240px] gap-6 overflow-x-auto  ">

                        {topDishes.map((dish, index) => (
                          <div
                            key={dish.name}
                            className="bg-black/70 border border-white/20 rounded-xl p-4 flex items-center gap-4"
                          >
                            <div className="text-3xl font-bold text-blue-400 ">
                              #{index + 1}
                            </div>

                            <div className="flex-1 ">
                              <p className="font-semibold truncate">{dish.name}</p>
                              <p className="text-sm text-green-400">
                                🍽 {dish.count} orders
                              </p>
                     
                            </div>

                            <img
                              src={dish.image || "/assets/restaurant.png"}
                              alt={dish.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CHART */}
                  <div className="bg-black/70 border border-white/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Weekly Orders</h3>

                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <XAxis dataKey="day" stroke="#aaa" />
                          <YAxis stroke="#aaa" />
                          <ChartTooltip />
                          <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function SidebarLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `relative group flex items-center justify-center p-3 rounded-lg transition
        ${isActive ? "bg-blue-600/30 text-blue-400" : "hover:bg-white/10 text-gray-300"}`
      }
    >
      <Icon size={18} />
      <Tooltip text={label} />
    </NavLink>
  );
}

function Tooltip({ text }) {
  return (
    <span className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition bg-black text-white text-xs px-3 py-1 rounded whitespace-nowrap z-50">
      {text}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-black/70 border border-white/20 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      </div>

      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/10">
        <Icon size={26} className={color} />
      </div>
    </div>
  );
}
