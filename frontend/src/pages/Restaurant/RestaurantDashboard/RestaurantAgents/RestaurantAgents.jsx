import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Bike, Phone, Flag, FlagOff, Check } from "lucide-react";
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
    const interval = setInterval(loadAll, 10000); // auto-refresh
    return () => clearInterval(interval);
  }, []);

  /* ================= ACTIONS ================= */
  const flagAgent = async (agentId) => {
    const reason = window.prompt("Reason for flagging this agent? (optional)");
    try {
      await api.put(`/api/agents/${agentId}/flag`, { reason: reason || "" });

      // Update UI immediately
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

      // Update UI
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

  if (loading) return <p className="text-white">Loading agents...</p>;

  return (
    <div className="text-white">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex justify-between gap-4">
        <h1 className="text-3xl font-bold">Delivery Agents</h1>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search by name, phone, vehicle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
        />
      </div>
      </div>

      {/* ================= AVAILABLE AGENTS ================= */}
      {paginatedAgents.length === 0 ? (
        <p className="text-gray-400 mb-10">No available agents found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {paginatedAgents.map((agent) => (
            <div
              key={agent._id}
              className="bg-black/70 border border-white/20 rounded-xl p-4 flex flex-col w-64 h-41 relative"
            >
              {/* FLAG + STATUS TOP-RIGHT */}
              <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                {agent.isFlagged ? (
                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-red-700 text-sm">
                    <Flag size={14} />
                    Flagged
                  </span>
                ) : (
                  <button
                    onClick={() => flagAgent(agent._id)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
                  >
                    <Flag size={14} />
                    Flag
                  </button>
                )}
              </div>

              {/* HEADER */}
              <div className="flex items-center gap-2">
                <img
                  src={agent.image?.trim() ? agent.image : "/assets/agent.png"}
                  className="w-16 h-16 object-cover border border-white/20"
                />
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold truncate">
                    {agent.name}
                  </h2>
                  <p className="text-sm text-gray-300 truncate">
                    {agent.email}
                  </p>
                </div>
              </div>

              {/* DETAILS */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <p className="flex items-center gap-2">
                    <Phone size={16} />
                    {agent.phone}
                  </p>

                  {/* Available / Status */}
                  <span
                    className={`flex justify-between items-center w-auto px-3 py-1 rounded text-sm ${
                      agent.status === "available"
                        ? "bg-green-600"
                        : agent.status === "offline"
                        ? "bg-red-600"
                        : "bg-blue-600"
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
                <p className="flex items-center gap-2">
                  <Bike size={16} />
                  {agent.vehicleType} - {agent.vehicleNumber}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10 mb-12">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded bg-blue-600 disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-green-600"
                  : "bg-white/20 hover:bg-white/30"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded bg-blue-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* ================= FLAGGED AGENTS ================= */}
      {flaggedAgents.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-red-400">
            Flagged Agents
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {flaggedAgents.map((agent) => (
              <div
                key={agent._id}
                className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 h-32 flex flex-col relative"
              >
                {/* UNFLAG TOP-RIGHT */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => unflagAgent(agent._id)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-gray-600 hover:bg-gray-700 text-sm"
                  >
                    <FlagOff size={14} />
                    Unflag
                  </button>
                </div>
                <img
                  src={agent.image?.trim() ? agent.image : "/assets/agent.png"}
                  className="w-16 h-16 object-cover border border-white/20 "
                />

                <h2 className="text-lg font-semibold">{agent.name}</h2>
                <p className="text-sm text-gray-300 truncate">{agent.email}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
