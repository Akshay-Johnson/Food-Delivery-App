import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

import {
  LayoutDashboard,
  ClipboardList,
  User,
  LogOut,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";

export default function AgentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const isOverview = location.pathname === "/agent/dashboard";

  /* =======================
     DASHBOARD STATE
  ======================= */
  const [stats, setStats] = useState({
    assignedOrders: 0,
    completedOrders: 0,
    status: "available", // RAW backend value
  });

  const [chartData, setChartData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const isOnline = stats.status === "available";

  /* =======================
     TOGGLE STATUS
  ======================= */
  const toggleOnlineStatus = async () => {
    try {
      setUpdatingStatus(true);

      const nextStatus = isOnline ? "on-delivery" : "available";

      await api.put("/api/agents/profile", {
        status: nextStatus,
      });

      await loadDashboardStats();
    } catch (err) {
      console.error("Status update failed", err);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* =======================
     LOAD DASHBOARD DATA
  ======================= */
  const loadDashboardStats = async () => {
    try {
      setLoadingStats(true);

      const dashboardRes = await api.get("/api/agents/dashboard");

      setStats({
        assignedOrders: dashboardRes.data.assignedOrders,
        completedOrders: dashboardRes.data.completedOrders,
        status: dashboardRes.data.status,
      });

const ordersRes = await api.get("/api/agents/orders");

// Normalize response safely
const orders = Array.isArray(ordersRes.data)
  ? ordersRes.data
  : ordersRes.data.orders || [];

const completed = orders.filter(
  (o) => o.status === "delivered"
);


      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const grouped = {};

      completed.forEach((o) => {
        const day = days[new Date(o.updatedAt).getDay()];
        grouped[day] = (grouped[day] || 0) + 1;
      });

      setChartData(
        days.map((d) => ({
          day: d,
          deliveries: grouped[d] || 0,
        }))
      );
    } catch (err) {
      console.error("Failed to load agent dashboard", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isOverview) loadDashboardStats();
  }, [isOverview]);

  /* =======================
     LOGOUT
  ======================= */
  const logout = () => {
    localStorage.clear();
    navigate("/agent/login");
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="relative min-h-screen text-white bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-none"></div>

      <div className="relative z-10 flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="w-24 bg-black/70 backdrop-blur-lg border-r border-white/10 p-4 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-blue-500 mb-8">DX</h1>

          <nav className="space-y-3">
            <SidebarLink to="/agent/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink to="/agent/dashboard/orders" icon={ClipboardList} label="Orders" />
            <SidebarLink to="/agent/dashboard/profile" icon={User} label="Profile" />
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
              <h2 className="text-2xl font-bold mb-6">
                Delivery Agent Dashboard
              </h2>

              {loadingStats ? (
                <p className="text-gray-400">Loading stats…</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatCard label="Assigned Orders" value={stats.assignedOrders} color="text-blue-400" />
                  <StatCard label="Completed Orders" value={stats.completedOrders} color="text-green-400" />

                  <div className="bg-black/70 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                    <p className="text-gray-400 text-sm">Status</p>

                    <p
                      className={`text-3xl font-bold mt-2 ${
                        isOnline ? "text-green-400" : "text-yellow-400"
                      }`}
                    >
                      {isOnline ? "Online" : "Busy"}
                    </p>

                    <button
                      onClick={toggleOnlineStatus}
                      disabled={updatingStatus}
                      className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition ${
                        isOnline
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {updatingStatus
                        ? "Updating..."
                        : isOnline
                        ? "Go Offline"
                        : "Go Online"}
                    </button>
                  </div>
                </div>
              )}

              {!loadingStats && (
                <div className="bg-black/70 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Weekly Deliveries
                  </h3>

                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="day" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <ChartTooltip />
                        <Line
                          type="monotone"
                          dataKey="deliveries"
                          stroke="#22c55e"
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

/* =======================
   REUSABLE COMPONENTS
======================= */

function SidebarLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `relative group flex items-center justify-center p-3 rounded-lg transition ${
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

function StatCard({ label, value, color }) {
  return (
    <div className="bg-black/70 backdrop-blur-lg border border-white/20 rounded-xl p-6">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

function Tooltip({ text }) {
  return (
    <span className="absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black px-3 py-1 text-xs opacity-0 group-hover:opacity-100 transition border border-white/20 z-50">
      {text}
    </span>
  );
}
