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
  });

  const [chartData, setChartData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    saveFCMToken();
    if (isOverview) loadDashboardStats();
  }, [isOverview]);

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

  const loadDashboardStats = async () => {
    try {
      const [ordersRes, menuRes] = await Promise.all([
        api.get("/api/restaurants/orders"),
        api.get("/api/menu/my/menu"),
      ]);

      const orders = ordersRes.data.orders || [];
      const menuItems = menuRes.data || [];

      const revenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      setStats({
        orders: orders.length,
        revenue,
        menuItems: menuItems.length,
      });

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
    } catch (error) {
      console.error(
        "Failed to load dashboard stats:",
        error.response?.data || error.message
      );
    } finally {
      setLoadingStats(false);
    }
  };

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
      {/* BLUR OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-none"></div>

      <div className="relative z-10 flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="w-24 bg-black/70 backdrop-blur-lg border-r border-white/10 p-4 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-blue-500 mb-8">DX</h1>

          <nav className="space-y-3">
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
              label="Add Item"
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
          </nav>

          <button
            onClick={logout}
            className="relative group mt-auto bg-red-600/80 hover:bg-red-600 p-3 rounded-lg"
          >
            <LogOut size={18} />
            <Tooltip text="Logout" />
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          {isOverview ? (
            <>
              <h2 className="text-2xl font-bold mb-6">Restaurant Dashboard</h2>

              {loadingStats ? (
                <p className="text-gray-400">Loading stats…</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatCard
                    label="Total Orders"
                    value={stats.orders}
                    color="text-blue-400"
                  />
                  <StatCard
                    label="Revenue"
                    value={formatCurrency(stats.revenue)}
                    color="text-green-400"
                  />
                  <StatCard
                    label="Menu Items"
                    value={stats.menuItems}
                    color="text-yellow-400"
                  />
                </div>
              )}

              {!loadingStats && (
                <div className="bg-black/70 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Weekly Orders</h3>

                  <div className="h-72">
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

function SidebarLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `relative group flex items-center justify-center p-3 rounded-lg transition
        ${
          isActive
            ? "bg-blue-600/30 text-blue-400"
            : "hover:bg-white/10 text-gray-300"
        }`
      }
    >
      <Icon size={18} />
      <Tooltip text={label} />
    </NavLink>
  );
}

function Tooltip({ text }) {
  return (
    <span
      className="
        absolute left-14 top-1/2 -translate-y-1/2
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200
        bg-black text-white text-xs px-3 py-1 rounded
        whitespace-nowrap shadow-lg z-50
      "
    >
      {text}
    </span>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-black/70 backdrop-blur-lg border border-white/20 rounded-xl p-6">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}
