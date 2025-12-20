import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { useAuth } from "../../../context/AuthContext";

import {
  LayoutDashboard,
  Users,
  Building2,
  Truck,
  ScrollText,
  LogOut,
  MessageSquare,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, loading } = useAuth();

  const isOverview = location.pathname === "/admin/dashboard";

  /* =======================
     STATE
  ======================= */
  const [stats, setStats] = useState({
    restaurants: 0,
    customers: 0,
    agents: 0,
    orders: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  /* =======================
     LOAD DASHBOARD DATA
  ======================= */
  const loadDashboardStats = async () => {
    try {
      const [r, c, a, o] = await Promise.all([
        api.get("/api/admins/restaurants"),
        api.get("/api/admins/customers"),
        api.get("/api/admins/agents"),
        api.get("/api/admins/orders"),
      ]);

      const restaurants = Array.isArray(r.data)
        ? r.data
        : r.data.restaurants || [];

      const customers = Array.isArray(c.data) ? c.data : c.data.customers || [];

      const agents = Array.isArray(a.data) ? a.data : a.data.agents || [];

      const orders = Array.isArray(o.data) ? o.data : o.data.orders || [];

      setStats({
        restaurants: restaurants.length,
        customers: customers.length,
        agents: agents.length,
        orders: orders.length,
      });

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const grouped = {};

      orders.forEach((order) => {
        const day = days[new Date(order.createdAt).getDay()];
        grouped[day] = (grouped[day] || 0) + 1;
      });

      setChartData(
        days.map((day) => ({
          day,
          orders: grouped[day] || 0,
        }))
      );
    } catch (err) {
      console.error("Failed to load admin dashboard stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  /* =======================
     EFFECT (AUTH SAFE)
  ======================= */
  useEffect(() => {
    if (!loading && role === "admin" && isOverview) {
      loadDashboardStats();
    }
  }, [loading, role, isOverview]);

  /* =======================
     LOGOUT
  ======================= */
  const logout = () => {
    localStorage.clear();
    navigate("/admin/login", { replace: true });
  };

  /* =======================
     SIDEBAR LINK STYLE
  ======================= */
  const navItem = ({ isActive }) =>
    `group relative flex items-center justify-center rounded-lg transition px-4 py-2
     ${
       isActive
         ? "bg-blue-600/20 text-white"
         : "hover:bg-white/10 text-white flex items-center justify-center"
     }`;

  /* =======================
     UI
  ======================= */
  return (
   <div className="relative flex min-h-screen text-white bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center">

        {/* BLUR OVERLAY */}
     <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-0"></div>


      {/* SIDEBAR */}
      <aside className="relative z-20 w-24 overflow-visible bg-black/70 backdrop-blur-lg border-r border-white/10 p-4 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-blue-500 mb-8">DX</h1>

        <nav className="space-y-3">
          <NavLink to="/admin/dashboard" end className={navItem}>
            <LayoutDashboard size={20} />
            <SidebarTooltip text="Dashboard" />
          </NavLink>

          <NavLink to="/admin/dashboard/restaurants" className={navItem}>
            <Building2 size={18} />
            <SidebarTooltip text="Restaurants" />
          </NavLink>

          <NavLink to="/admin/dashboard/customers" className={navItem}>
            <Users size={18} />
            <SidebarTooltip text="Customers" />
          </NavLink>

          <NavLink to="/admin/dashboard/agents" className={navItem}>
            <Truck size={18} />
            <SidebarTooltip text="Delivery Agents" />
          </NavLink>

          <NavLink to="/admin/dashboard/orders" className={navItem}>
            <ScrollText size={18} />
            <SidebarTooltip text="Orders" />
          </NavLink>

          <NavLink to="/admin/dashboard/reviews" className={navItem}>
            <MessageSquare size={18} />
            <SidebarTooltip text="Reviews" />
          </NavLink>
        </nav>

        {/* LOGOUT */}
        <button
          onClick={logout}
          title="Logout"
          className="mt-auto p-3 rounded-lg hover:bg-red-800 transition bg-red-600 "
        >
          <LogOut size={20} />
        </button>
      </aside>

    
      {/* MAIN */}
      <main className="relative z-10 flex-1 p-6 overflow-y-auto">
        {isOverview ? (
          <>
            <h2 className="text-2xl font-bold mb-6">
              Admin Dashboard Overview
            </h2>

            {loadingStats ? (
              <p className="text-gray-400">Loading stats…</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    label="Restaurants"
                    value={stats.restaurants}
                    color="text-blue-400"
                  />
                  <StatCard
                    label="Customers"
                    value={stats.customers}
                    color="text-green-400"
                  />
                  <StatCard
                    label="Delivery Agents"
                    value={stats.agents}
                    color="text-yellow-400"
                  />
                  <StatCard
                    label="Orders"
                    value={stats.orders}
                    color="text-purple-400"
                  />
                </div>

                <div className="bg-black/70 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Weekly Orders (Platform)
                  </h3>

                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="day" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip />
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
            )}
          </>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

/* =======================
   TOOLTIP
======================= */
function SidebarTooltip({ text }) {
  return (
    <span
      className="absolute left-24 top-1/2 -translate-y-1/2 whitespace-nowrap
                 rounded-md bg-black px-3 py-1 text-sm
                 opacity-0 group-hover:opacity-100 transition-opacity duration-200
                 border border-white/20 z-50 pointer-events-none"
    >
      {text}
    </span>
  );
}

/* =======================
   STAT CARD
======================= */
function StatCard({ label, value, color }) {
  return (
    <div className="bg-black/70 backdrop-blur-lg border border-white/20 rounded-xl p-6">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}
