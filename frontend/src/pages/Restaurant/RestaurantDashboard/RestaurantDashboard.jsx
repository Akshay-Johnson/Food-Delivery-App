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
        await api.post("/api/restaurants/save-fcm-token", { fcmToken: token });
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

      const menuImageMap = {};
      menuItems.forEach((m) => {
        menuImageMap[m.name] = m.image;
      });

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
        })),
      );

      /* ---------- TOP DISHES ---------- */
      /* ---------- TOP DISHES (FILTERED BY MENU) ---------- */
      const dishMap = {};

      orders.forEach((order) => {
        order.items.forEach((item) => {
          // 🚫 Ignore dishes not in current menu
          if (!menuImageMap[item.name]) return;

          if (!dishMap[item.name]) {
            dishMap[item.name] = {
              name: item.name,
              count: 0,
              image: menuImageMap[item.name],
            };
          }

          dishMap[item.name].count += item.quantity;
        });
      });

      setTopDishes(
        Object.values(dishMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 8),
      );
    } catch (error) {
      console.error("Dashboard error:", error);
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
        {/* ================= SIDEBAR ================= */}
        <aside
          className="
            fixed md:static bottom-0 left-0 right-0 md:right-auto z-40
            bg-black/80 backdrop-blur-lg border-t md:border-t-0 md:border-r border-white/10
            md:w-24 flex md:flex-col justify-around md:justify-start
            p-2 md:p-4
          "
        >
          <h1 className="hidden md:block text-2xl font-bold text-blue-500 mb-8 text-center">
            DX
          </h1>

          <nav className="flex md:flex-col gap-2 md:space-y-3">
            <SidebarLink
              to="/restaurant/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
            />
            <SidebarLink
              to="/restaurant/dashboard/menu"
              icon={UtensilsCrossed}
              label="Menu"
            />
            <SidebarLink
              to="/restaurant/dashboard/menu/add"
              icon={PlusCircle}
              label="Add"
            />
            <SidebarLink
              to="/restaurant/dashboard/orders"
              icon={ClipboardList}
              label="Orders"
            />
            <SidebarLink
              to="/restaurant/dashboard/agents"
              icon={Bike}
              label="Agents"
            />
            <SidebarLink
              to="/restaurant/dashboard/profile"
              icon={User}
              label="Profile"
            />
            <SidebarLink
              to="/restaurant/dashboard/reviews"
              icon={MessageSquare}
              label="Reviews"
            />
            <button
              onClick={logout}
              className="
    flex md:hidden flex-col items-center justify-center gap-1
    p-2 rounded-lg transition
    hover:bg-red-600/20 text-red-400
  "
            >
              <LogOut size={18} />
              <span className="text-[10px]">Logout</span>
            </button>
          </nav>

          <button
            onClick={logout}
            className="hidden md:flex relative group mt-auto bg-red-600/80 hover:bg-red-600 p-3 rounded-lg"
          >
            <LogOut size={18} />
            <Tooltip text="Logout" />
          </button>
        </aside>

        {/* ================= MAIN ================= */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
          {isOverview ? (
            loadingStats ? (
              <p className="text-gray-400">Loading stats…</p>
            ) : (
              <>
                {/* STATS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                  <StatCard
                    label="Orders"
                    value={stats.orders}
                    icon={ClipboardList}
                    color="text-blue-400"
                  />
                  <StatCard
                    label="Revenue"
                    value={formatCurrency(stats.revenue)}
                    icon={IndianRupee}
                    color="text-green-400"
                  />
                  <StatCard
                    label="Menu Items"
                    value={stats.menuItems}
                    icon={UtensilsCrossed}
                    color="text-yellow-400"
                  />
                  <StatCard
                    label="Today"
                    value={stats.todayOrders}
                    icon={Bike}
                    color="text-purple-400"
                  />
                  <StatCard
                    label="Avg Order"
                    value={formatCurrency(stats.avgOrderValue)}
                    icon={BarChart3}
                    color="text-pink-400"
                  />
                </div>

                {/* TOP DISHES */}
                {topDishes.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">
                      🔥 Top Trending Dishes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {topDishes.map((dish, i) => (
                        <div
                          key={dish.name}
                          className="bg-black/70 border border-white/20 rounded-xl p-4 flex items-center gap-3"
                        >
                          <span className="text-xl font-bold text-blue-400">
                            #{i + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold truncate">
                              {dish.name}
                            </p>
                            <p className="text-sm text-green-400">
                              {dish.count} orders
                            </p>
                          </div>
                          <img
                            src={dish.image || "/assets/dishimage.jpg"}
                            className="w-14 h-14 rounded-md object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CHART */}
                <div className="bg-black/70 border border-white/20 rounded-xl p-5">
                  <h3 className="text-lg font-semibold mb-4">Weekly Orders</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="day" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <ChartTooltip />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#3b82f6"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )
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
        `flex flex-col md:flex-row items-center justify-center gap-1
         p-2 md:p-3 rounded-lg transition
         ${
           isActive
             ? "bg-blue-600/30 text-blue-400"
             : "hover:bg-white/10 text-gray-300"
         }`
      }
    >
      <Icon size={18} />
      <span className="text-[10px] md:hidden">{label}</span>
      <Tooltip text={label} />
    </NavLink>
  );
}

function Tooltip({ text }) {
  return (
    <span
      className="hidden md:block absolute left-14 top-1/2 -translate-y-1/2
      opacity-0 group-hover:opacity-100 transition
      bg-black text-white text-xs px-3 py-1 rounded whitespace-nowrap"
    >
      {text}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-black/70 border border-white/20 rounded-xl p-4 flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className={`text-xl md:text-2xl font-bold mt-1 ${color}`}>{value}</p>
      </div>
      <Icon size={24} className={color} />
    </div>
  );
}
