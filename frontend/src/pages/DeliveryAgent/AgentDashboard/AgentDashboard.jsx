import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import Toast from "../../../components/toast/toast";

import { LayoutDashboard, ClipboardList, User, LogOut } from "lucide-react";

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
  const [toast, setToast] = useState(null);

  const isOverview = location.pathname === "/agent/dashboard";

  /* ================= DASHBOARD STATE ================= */
  const [stats, setStats] = useState({
    assignedOrders: 0,
    completedOrders: 0,
    revenue: 0,
    status: "offline",
  });

  const [chartData, setChartData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const isOnline = stats.status === "available";

  /* ================= TOGGLE STATUS ================= */
  const toggleOnlineStatus = async () => {
    try {
      setUpdatingStatus(true);
      const res = await api.put("/api/agents/status");

      setStats((prev) => ({
        ...prev,
        status: res.data.status,
      }));
    } catch {
      setToast({ type: "error", message: "Failed to update status" });
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* ================= LOAD DATA ================= */
  const loadDashboardStats = async () => {
    try {
      setLoadingStats(true);

      const dashboardRes = await api.get("/api/agents/dashboard");
      const ordersRes = await api.get("/api/agents/orders");

      const orders = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : ordersRes.data.orders || [];

      const assignedOrders = orders.filter((o) =>
        ["ready", "picked"].includes(o.status)
      );

      const completedOrders = orders.filter((o) => o.status === "delivered");

      const revenue = completedOrders.reduce(
        (sum, o) => sum + (o.deliveryCharge || 0),
        0
      );

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const grouped = {};

      completedOrders.forEach((o) => {
        const day = days[new Date(o.updatedAt).getDay()];
        grouped[day] = (grouped[day] || 0) + 1;
      });

      setChartData(
        days.map((d) => ({
          day: d,
          deliveries: grouped[d] || 0,
        }))
      );

      setStats({
        assignedOrders: assignedOrders.length,
        completedOrders: completedOrders.length,
        revenue,
        status: dashboardRes.data.status,
      });
    } catch (err) {
      console.error("Agent dashboard error", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isOverview) loadDashboardStats();
  }, [isOverview]);

  const logout = () => {
    localStorage.clear();
    navigate("/agent/login");
  };

  return (
    <div className="relative min-h-screen text-white bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      <div className="relative z-10 flex min-h-screen">
        {/* ================= SIDEBAR ================= */}
        <aside
          className="
            fixed md:static bottom-0 left-0 right-0 md:right-auto z-40
            bg-black/80 backdrop-blur-lg
            border-t md:border-t-0 md:border-r border-white/10
            md:w-24 flex md:flex-col justify-around md:justify-start
            p-2 md:p-4
          "
        >
          <h1 className="hidden md:block text-2xl font-bold text-blue-500 mb-8 text-center">
            DX
          </h1>

          <nav className="flex md:flex-col gap-2 md:space-y-3">
            <SidebarLink
              to="/agent/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
            />
            <SidebarLink
              to="/agent/dashboard/orders"
              icon={ClipboardList}
              label="Orders"
            />
            <SidebarLink
              to="/agent/dashboard/profile"
              icon={User}
              label="Profile"
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
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}

          {isOverview ? (
            <>
              <h2 className="text-xl md:text-2xl font-bold mb-6">
                Delivery Agent Dashboard
              </h2>

              {loadingStats ? (
                <p className="text-gray-400">Loading stats…</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard
                    label="Assigned Orders"
                    value={stats.assignedOrders}
                    color="text-blue-400"
                  />
                  <StatCard
                    label="Completed Orders"
                    value={stats.completedOrders}
                    color="text-green-400"
                  />
                  <StatCard
                    label="Revenue Earned"
                    value={`₹${stats.revenue}`}
                    color="text-yellow-400"
                  />

                  {/* STATUS */}
                  <div className="bg-black/70 border border-white/20 rounded-xl p-4 md:p-6">
                    <p className="text-gray-400 text-sm">Status</p>
                    <p className="text-2xl md:text-3xl font-bold mt-2">
                      {stats.status === "available"
                        ? "Online"
                        : stats.status === "offline"
                        ? "Offline"
                        : "On Delivery"}
                    </p>

                    <button
                      onClick={toggleOnlineStatus}
                      disabled={
                        updatingStatus || stats.status === "on-delivery"
                      }
                      className={`mt-4 w-full py-2 rounded-lg text-sm font-medium ${
                        isOnline
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      } disabled:opacity-50`}
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
                <div className="bg-black/70 border border-white/20 rounded-xl p-4 md:p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Weekly Deliveries
                  </h3>

                  <div className="h-64 md:h-72">
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

function StatCard({ label, value, color }) {
  return (
    <div className="bg-black/70 border border-white/20 rounded-xl p-4 md:p-6">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

function Tooltip({ text }) {
  return (
    <span
      className="
        hidden md:block absolute left-16 top-1/2 -translate-y-1/2
        whitespace-nowrap rounded-md bg-black px-3 py-1 text-xs
        opacity-0 group-hover:opacity-100 transition
        border border-white/20 z-50
      "
    >
      {text}
    </span>
  );
}
