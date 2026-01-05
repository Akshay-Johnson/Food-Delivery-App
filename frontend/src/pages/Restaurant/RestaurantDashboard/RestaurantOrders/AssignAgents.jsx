import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../api/axiosInstance";
import { Bike, UserCheck } from "lucide-react";
import Toast from "../../../../components/toast/toast";

export default function AssignAgent() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [assignedAgentId, setAssignedAgentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [toast, setToast] = useState(null);

  /* PAGINATION */
  const [page, setPage] = useState(1);
  const agentsPerPage = 15;

  /* ================= LOAD AGENTS ================= */
  const loadAgents = async () => {
    try {
      const res = await api.get("/api/agents/available");
      setAgents(res.data || []);
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to load agents" });
    }
  };

  /* ================= LOAD ORDER ================= */
  const loadOrder = async () => {
    try {
      const res = await api.get(`/api/restaurants/orders/${orderId}`);
      setAssignedAgentId(res.data?.assignedAgent?._id || null);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= ASSIGN AGENT ================= */
  const assignAgent = async (agentId) => {
    if (assignedAgentId) return;

    try {
      setAssigning(true);

      await api.post(`/api/restaurants/orders/assign-agent/${orderId}`, {
        agentId,
      });

      setAssignedAgentId(agentId);
      setToast({ type: "success", message: "Agent assigned successfully" });

      setTimeout(() => {
        navigate("/restaurant/dashboard/orders");
      }, 1000);
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Assignment failed",
      });
    } finally {
      setAssigning(false);
    }
  };

  /* ================= INIT ================= */
  useEffect(() => {
    const init = async () => {
      await Promise.all([loadAgents(), loadOrder()]);
      setLoading(false);
    };
    init();
  }, []);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(agents.length / agentsPerPage);
  const paginatedAgents = agents.slice(
    (page - 1) * agentsPerPage,
    page * agentsPerPage
  );

  if (loading) {
    return <p className="text-white p-6">Loading agents...</p>;
  }

  return (
    <div className="p-4 sm:p-6 text-white">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Assign Agent</h1>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* AGENTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {paginatedAgents.map((agent) => {
          const isAssigned = assignedAgentId === agent._id;
          const isAvailable = agent.status === "available" && !assignedAgentId;

          const statusColor =
            agent.status === "available"
              ? "bg-green-600/20 text-green-400"
              : agent.status === "on-delivery"
              ? "bg-blue-600/20 text-blue-400"
              : "bg-red-600/20 text-red-400";

          return (
            <div
              key={agent._id}
              className={`bg-black/70 border border-white/20 rounded-xl p-4
                          flex flex-col gap-3 shadow-lg
                          ${isAssigned ? "ring-2 ring-green-500/40" : ""}`}
            >
              {/* HEADER */}
              <div className="flex items-center gap-3">
                <Bike
                  size={32}
                  className={
                    agent.status === "available"
                      ? "text-green-400"
                      : agent.status === "on-delivery"
                      ? "text-blue-400"
                      : "text-red-400"
                  }
                />

                <div className="min-w-0">
                  <h2 className="font-semibold truncate">{agent.name}</h2>
                  <p className="text-sm text-gray-400 truncate">
                    {agent.phone}
                  </p>
                </div>
              </div>

              {/* VEHICLE */}
              <p className="text-sm text-gray-300 truncate">
                {agent.vehicleType} • {agent.vehicleNumber}
              </p>

              {/* STATUS */}
              <span
                className={`text-xs px-3 py-1 rounded-full w-fit capitalize ${statusColor}`}
              >
                {agent.status}
              </span>

              {/* ACTION */}
              {isAvailable && (
                <button
                  onClick={() => assignAgent(agent._id)}
                  disabled={assigning}
                  className="mt-auto w-full py-2 rounded-lg
                             flex items-center justify-center gap-2
                             bg-green-600 hover:bg-green-700
                             disabled:opacity-60 transition"
                >
                  <UserCheck size={18} />
                  Assign Agent
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-blue-600 rounded disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded ${
                page === i + 1
                  ? "bg-blue-600"
                  : "bg-white/20 hover:bg-white/30"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-blue-600 rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
