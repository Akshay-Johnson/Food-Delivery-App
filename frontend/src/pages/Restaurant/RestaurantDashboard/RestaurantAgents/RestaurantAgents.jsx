import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Bike, Phone, Flag, FlagOff } from "lucide-react";

export default function RestaurantAgents() {
  const [agents, setAgents] = useState([]);
  const [flaggedAgents, setFlaggedAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const agentsPerPage = 6;

  /* ================= LOAD DATA ================= */

  const loadAgents = async () => {
    const res = await api.get("/api/agents/available");
    setAgents(res.data || []);
  };

  const loadFlaggedAgents = async () => {
    const res = await api.get("/api/agents/flagged");
    setFlaggedAgents(res.data || []);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([loadAgents(), loadFlaggedAgents()]);
      } catch (err) {
        console.error("Failed to load agents", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();

    const interval = setInterval(loadAll, 10000);
    return () => clearInterval(interval);
  }, []);

  /* ================= ACTIONS ================= */

  // 🚩 FLAG AGENT
  const flagAgent = async (agentId) => {
    const reason = window.prompt(
      "Reason for flagging this agent? (optional)"
    );

    try {
      await api.put(`/api/agents/${agentId}/flag`, {
        reason: reason || "",
      });

      await Promise.all([loadAgents(), loadFlaggedAgents()]);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to flag agent");
    }
  };

  // 🔁 UNFLAG AGENT
  const unflagAgent = async (agentId) => {
    try {
      await api.put(`/api/agents/${agentId}/unflag`);
      await Promise.all([loadAgents(), loadFlaggedAgents()]);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to unflag agent");
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

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) return <p className="text-white">Loading agents...</p>;

  /* ================= UI ================= */

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-4">Delivery Agents</h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by name, phone, vehicle..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
      />

      {/* ================= AVAILABLE AGENTS ================= */}
      <h2 className="text-xl font-semibold mb-4">Available Agents</h2>

      {paginatedAgents.length === 0 ? (
        <p className="text-gray-400 mb-10">No available agents found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedAgents.map((agent) => (
            <div
              key={agent._id}
              className="bg-black/70 p-4 rounded-xl border border-white/20"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    agent.image?.trim()
                      ? agent.image
                      : "/assets/agent.png"
                  }
                  className="w-12 h-12 rounded-full object-cover border border-white/20"
                />

                <div>
                  <h2 className="text-lg font-semibold">{agent.name}</h2>
                  <p className="text-sm text-gray-300">{agent.email}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Phone size={16} />
                  {agent.phone}
                </p>

                <p className="flex items-center gap-2">
                  <Bike size={16} />
                  {agent.vehicleType} - {agent.vehicleNumber}
                </p>

                <span className="px-3 py-1 rounded inline-block mt-2 bg-green-600">
                  {agent.status}
                </span>

                <button
                  onClick={() => flagAgent(agent._id)}
                  className="mt-4 flex items-center gap-2 px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
                >
                  <Flag size={14} />
                  Flag Agent
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 mb-12">
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
          <h2 className="text-xl font-semibold mb-4 pt-10 text-red-400">
            Flagged Agents
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flaggedAgents.map((agent) => (
              <div
                key={agent._id}
                className="bg-red-900/30 p-4 rounded-xl border border-red-500/30"
              >
                
                <h2 className="text-lg font-semibold">{agent.name}</h2>
                <p className="text-sm text-gray-300">{agent.email}</p>

                <button
                  onClick={() => unflagAgent(agent._id)}
                  className="mt-4 flex items-center gap-2 px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-sm"
                >
                  <FlagOff size={14} />
                  Unflag Agent
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
