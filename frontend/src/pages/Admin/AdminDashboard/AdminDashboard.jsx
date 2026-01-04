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
  BarChart3,
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

  const [stats, setStats] = useState({
    restaurants: 0,
    customers: 0,
    agents: 0,
    orders: 0,
    revenue: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  /* ================= LOAD DASHBOARD DATA ================= */
  const loadDashboardStats = async () => {
    try {
      const [r, c, a, o] = await Promise.all([
        api.get("/api/admins/restaurants"),
        api.get("/api/admins/customers"),
        api.get("/api/admins/agents"),
        api.get("/api/admins/orders"),
      ]);

      const restaurants = r.data || [];
      const customers = c.data || [];
      const agents = a.data || [];
      const orders = o.data || [];

      const revenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      setStats({
        restaurants: restaurants.length,
        customers: customers.length,
        agents: agents.length,
        orders: orders.length,
        revenue,
      });

      /* 🔝 TOP 5 RESTAURANTS */
      const top5 = [...restaurants]
        .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
        .slice(0, 8);

      setTopRestaurants(top5);

      /* 📊 WEEKLY ORDER CHART */
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
    } catch (err) {
      console.error("Failed to load admin dashboard stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (!loading && role === "admin" && isOverview) {
      loadDashboardStats();
    }
  }, [loading, role, isOverview]);

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.clear();
    navigate("/admin/login", { replace: true });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const navItem = ({ isActive }) =>
    `group relative flex items-center justify-center rounded-lg transition px-4 py-2
     ${
       isActive ? "bg-blue-600/20 text-white" : "hover:bg-white/10 text-white"
     }`;

  return (
    <div className="relative flex min-h-screen text-white bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-0"></div>

      {/* SIDEBAR */}
      <aside className="relative z-20 w-24 bg-black/70 backdrop-blur-lg border-r border-white/10 p-4 flex flex-col items-center">
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
            <SidebarTooltip text="Agents" />
          </NavLink>

          <NavLink to="/admin/dashboard/orders" className={navItem}>
            <ScrollText size={18} />
            <SidebarTooltip text="Orders" />
          </NavLink>
        </nav>

        <button
          onClick={logout}
          className="mt-auto p-3 rounded-lg hover:bg-red-800 transition bg-red-600"
        >
          <LogOut size={20} />
        </button>
      </aside>

      {/* MAIN */}
      <main className="relative z-10 flex-1 p-6 overflow-y-auto">
        {isOverview ? (
          <>
            {loadingStats ? (
              <p className="text-gray-400">Loading stats…</p>
            ) : (
              <>
                {/* STATS (MATCH RESTAURANT DASHBOARD) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <StatCard
                    label="Restaurants"
                    value={stats.restaurants}
                    icon={Building2}
                    color="text-yellow-400"
                  />
                  <StatCard
                    label="Customers"
                    value={stats.customers}
                    icon={Users}
                    color="text-blue-400"
                  />
                  <StatCard
                    label="Agents"
                    value={stats.agents}
                    icon={Truck}
                    color="text-purple-400"
                  />
                  <StatCard
                    label="Orders"
                    value={stats.orders}
                    icon={ScrollText}
                    color="text-green-400"
                  />
                  <StatCard
                    label="Revenue"
                    value={formatCurrency(stats.revenue)}
                    icon={BarChart3}
                    color="text-pink-400"
                  />
                </div>

                {/* TOP RESTAURANTS */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">
                    🔥 Top Restaurants
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {topRestaurants.map((r, index) => (
                      <div
                        key={r._id}
                        className="bg-black/70 border border-white/20 rounded-xl p-4 flex items-center gap-4"
                      >
                        <div className="text-3xl font-bold text-blue-400">
                          #{index + 1}
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold truncate">{r.name}</p>
                          <p className="text-sm text-yellow-400">
                            ⭐ {r.averageRating?.toFixed(1) || "0.0"}
                          </p>
                          <p className="text-sm text-blue-400">
                            🧾 {r.orderCount || 0} orders
                          </p>
                        </div>

                        <img
                          src={r.image || "/assets/restaurant.png"}
                          alt={r.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* CHART */}
                <div className="bg-black/70 border border-white/20 rounded-xl p-6">
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

/* ================= COMPONENTS ================= */

function SidebarTooltip({ text }) {
  return (
    <span className="absolute left-24 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black px-3 py-1 text-sm opacity-0 group-hover:opacity-100 transition border border-white/20">
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
