import {
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
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

  const token = localStorage.getItem("adminToken");

  /* ================= HARD SECURITY GUARD ================= */
  if (!token || token === "undefined" || token === "null") {
    return <Navigate to="/admin/login" replace />;
  }

  if (!loading && role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

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

      const revenue = orders.reduce(
        (sum, o) => sum + (o.totalPrice || 0),
        0
      );

      setStats({
        restaurants: restaurants.length,
        customers: customers.length,
        agents: agents.length,
        orders: orders.length,
        revenue,
      });

      setTopRestaurants(
        [...restaurants]
          .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
          .slice(0, 8)
      );

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
      console.error("Admin dashboard error", err);
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
    localStorage.removeItem("adminToken");
    localStorage.removeItem("role");
    window.location.href = "/admin/login";
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
        {/* ================= SIDEBAR / BOTTOM NAV ================= */}
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
              to="/admin/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
            />
            <SidebarLink
              to="/admin/dashboard/restaurants"
              icon={Building2}
              label="Restaurants"
            />
            <SidebarLink
              to="/admin/dashboard/customers"
              icon={Users}
              label="Customers"
            />
            <SidebarLink
              to="/admin/dashboard/agents"
              icon={Truck}
              label="Agents"
            />
            <SidebarLink
              to="/admin/dashboard/orders"
              icon={ScrollText}
              label="Orders"
            />

            {/* MOBILE LOGOUT */}
            <button
              onClick={logout}
              className="flex md:hidden flex-col items-center gap-1 p-2 rounded-lg text-red-400 hover:bg-red-600/20"
            >
              <LogOut size={18} />
              <span className="text-[10px]">Logout</span>
            </button>
          </nav>

          {/* DESKTOP LOGOUT */}
          <button
            onClick={logout}
            className="hidden md:flex relative group mt-auto bg-red-600/80 hover:bg-red-600 p-3 rounded-lg"
          >
            <LogOut size={18} />
            <TooltipLabel text="Logout" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <StatCard label="Restaurants" value={stats.restaurants} icon={Building2} color="text-yellow-400" />
                  <StatCard label="Customers" value={stats.customers} icon={Users} color="text-blue-400" />
                  <StatCard label="Agents" value={stats.agents} icon={Truck} color="text-purple-400" />
                  <StatCard label="Orders" value={stats.orders} icon={ScrollText} color="text-green-400" />
                  <StatCard label="Revenue" value={formatCurrency(stats.revenue)} icon={BarChart3} color="text-pink-400" />
                </div>

                {/* TOP RESTAURANTS */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Top Restaurants
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {topRestaurants.map((r, index) => (
                      <div
                        key={r._id}
                        className="bg-black/70 border border-white/20 rounded-xl p-4 flex items-center gap-4"
                      >
                        <span className="text-xl font-bold text-blue-400">
                          #{index + 1}
                        </span>

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
                          className="w-14 h-14 rounded-md object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* CHART */}
                <div className="bg-black/70 border border-white/20 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Weekly Orders (Platform)
                  </h3>

                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="orders"
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
      <TooltipLabel text={label} />
    </NavLink>
  );
}

function TooltipLabel({ text }) {
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
    <div className="bg-black/70 border border-white/20 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className={`text-xl md:text-2xl font-bold mt-1 ${color}`}>
          {value}
        </p>
      </div>

      <Icon size={26} className={color} />
    </div>
  );
}
