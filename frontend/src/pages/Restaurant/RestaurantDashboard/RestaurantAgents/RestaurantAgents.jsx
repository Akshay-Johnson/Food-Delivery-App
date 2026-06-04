import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Bike, Phone, Flag, FlagOff, Search, Mail, AlertCircle, ShieldAlert } from "lucide-react";
import Toast from "../../../../components/toast/toast";

export default function RestaurantAgents() {
  const [agents, setAgents] = useState([]);
  const [flaggedAgents, setFlaggedAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Search
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const agentsPerPage = 15;

  /* ================= LOAD DATA ================= */
  const loadAgents = async () => {
    try {
      const res = await api.get("/api/agents/available");
      setAgents(res.data || []);
    } catch {
      setToast({ type: "error", message: "Failed to load agents" });
    }
  };

  const loadFlaggedAgents = async () => {
    try {
      const res = await api.get("/api/agents/flagged");
      setFlaggedAgents(res.data || []);
    } catch {
      setToast({ type: "error", message: "Failed to load flagged agents" });
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([loadAgents(), loadFlaggedAgents()]);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
    const interval = setInterval(loadAll, 10000);
    return () => clearInterval(interval);
  }, []);

  /* ================= ACTIONS ================= */
  const flagAgent = async (agentId) => {
    const reason = window.prompt("Reason for flagging this agent? (optional)");
    try {
      await api.put(`/api/agents/${agentId}/flag`, { reason: reason || "" });

      setAgents((prev) =>
        prev.map((a) => (a._id === agentId ? { ...a, isFlagged: true } : a))
      );

      setToast({ type: "success", message: "Agent flagged successfully" });
      await loadFlaggedAgents();
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to flag agent",
      });
    }
  };

  const unflagAgent = async (agentId) => {
    try {
      await api.put(`/api/agents/${agentId}/unflag`);

      setAgents((prev) =>
        prev.map((a) => (a._id === agentId ? { ...a, isFlagged: false } : a))
      );

      setToast({ type: "success", message: "Agent unflagged successfully" });
      await loadFlaggedAgents();
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to unflag agent",
      });
    }
  };

  /* ================= FILTER + PAGINATION ================= */
  const filteredAgents = agents.filter((agent) => {
    const q = search.toLowerCase();
    return (
      agent.name?.toLowerCase().includes(q) ||
      agent.email?.toLowerCase().includes(q) ||
      agent.phone?.includes(q) ||
      agent.vehicleType?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredAgents.length / agentsPerPage);
  const paginatedAgents = filteredAgents.slice(
    (page - 1) * agentsPerPage,
    page * agentsPerPage
  );

  useEffect(() => setPage(1), [search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-400 font-medium">Loading dispatcher roster...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 text-white max-w-7xl mx-auto space-y-8">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Delivery Agents</h1>
          <p className="text-xs text-gray-400 mt-1">Monitor active delivery riders and flag troublesome accounts</p>
        </div>

        {/* SEARCH BOX */}
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search name, phone, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all duration-300 text-sm shadow-inner"
          />
        </div>
      </div>

      {/* ================= AVAILABLE AGENTS ================= */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Bike size={18} className="text-orange-400" />
          <span>Active Agents ({agents.length})</span>
        </h2>

        {paginatedAgents.length === 0 ? (
          <div className="bg-black/70 border border-white/20 rounded-2xl py-12 text-center">
            <AlertCircle className="mx-auto text-gray-500 mb-2" size={28} />
            <p className="text-gray-400 text-sm font-medium">No active delivery agents found at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {paginatedAgents.map((agent) => (
              <div
                key={agent._id}
                className="bg-black/70 border border-white/20 rounded-2xl p-4 flex flex-col justify-between hover:border-orange-500/30 transition duration-300 relative group shadow-lg"
              >
                {/* FLAG BUTTON */}
                <div className="absolute top-3 right-3 z-10">
                  {agent.isFlagged ? (
                    <span 
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500/25 border border-red-500/40 text-red-500"
                      title="Flagged"
                    >
                      <Flag size={12} fill="currentColor" />
                    </span>
                  ) : (
                    <button
                      onClick={() => flagAgent(agent._id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full border border-white/15 hover:border-red-500 hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all duration-200 cursor-pointer"
                      title="Flag Agent"
                    >
                      <Flag size={12} />
                    </button>
                  )}
                </div>

                {/* PROFILE HEADER */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={agent.image?.trim() ? agent.image : "/assets/agent.png"}
                      className="w-12 h-12 object-cover border border-white/10 rounded-xl bg-white/5"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/agent.png";
                      }}
                      alt={agent.name}
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-white truncate text-sm">{agent.name}</h3>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        <Mail size={10} />
                        {agent.email}
                      </p>
                    </div>
                  </div>

                  {/* DETAILS PANELS */}
                  <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-gray-300">
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 truncate">
                        <Phone size={12} className="text-gray-500" />
                        {agent.phone}
                      </p>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          agent.status === "available"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : agent.status === "offline"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>

                    <p className="flex items-center gap-1.5 text-gray-400 truncate">
                      <Bike size={12} className="text-gray-500" />
                      <span>{agent.vehicleType || "N/A"} • {agent.vehicleNumber || "N/A"}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAGINATION */}
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

      {/* ================= FLAGGED AGENTS ================= */}
      {flaggedAgents.length > 0 && (
        <div className="pt-6 border-t border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-red-400 flex items-center gap-2">
            <ShieldAlert size={18} />
            <span>My Flagged Agents ({flaggedAgents.length})</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {flaggedAgents.map((agent) => (
              <div
                key={agent._id}
                className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4 flex flex-col justify-between relative shadow-lg"
              >
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={() => unflagAgent(agent._id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 border border-white/10 text-gray-200 hover:text-white transition-all duration-200 cursor-pointer"
                    title="Unflag Agent"
                  >
                    <FlagOff size={12} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={agent.image?.trim() ? agent.image : "/assets/agent.png"}
                    className="w-12 h-12 object-cover border border-red-500/10 rounded-xl bg-white/5"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/agent.png";
                    }}
                    alt={agent.name}
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-white truncate text-sm">{agent.name}</h3>
                    <p className="text-xs text-red-400/80 truncate">{agent.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
