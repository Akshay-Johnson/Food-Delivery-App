import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import Toast from "../../../components/toast/toast";
import { Flag, XCircle } from "lucide-react";

export default function AdminAgents() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Modal
  const [activeAgent, setActiveAgent] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const agentsPerPage = 10;

  /* ================= LOAD AGENTS ================= */
  const load = async () => {
    try {
      const res = await api.get("/api/admins/agents");
      setList(res.data || []);
    } catch (err) {
      console.error("Failed to load agents", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= ACTIONS ================= */
  const toggleStatus = async (id, approvalStatus) => {
    try {
      const nextStatus = approvalStatus === "approved" ? "blocked" : "approved";

      await api.put(`/api/admins/agent/status/${id}`, {
        approvalStatus: nextStatus,
      });

      load();
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to update agent",
      });
    }
  };

  const unflagAgent = async (agentId, restaurantId) => {
    try {
      await api.put(`/api/admins/agents/${agentId}/unflag/${restaurantId}`);

      setToast({
        type: "success",
        message: "Flag removed successfully",
      });

      load();
      setActiveAgent(null);
    } catch {
      setToast({
        type: "error",
        message: "Failed to remove flag",
      });
    }
  };

  /* ================= FILTER + PAGINATION ================= */
  const filteredAgents = list.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.approvalStatus?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredAgents.length / agentsPerPage);
  const paginatedAgents = filteredAgents.slice(
    (page - 1) * agentsPerPage,
    page * agentsPerPage
  );

  useEffect(() => setPage(1), [search]);

  /* ================= STATUS COUNTS ================= */
  const approvedCount = list.filter(
    (a) => a.approvalStatus === "approved"
  ).length;

  const pendingCount = list.filter(
    (a) => a.approvalStatus === "pending"
  ).length;

  const blockedCount = list.filter(
    (a) => a.approvalStatus === "blocked"
  ).length;

  return (
    <div className="text-white relative">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Delivery Agents</h2>
          {/* SEARCH — SAME POSITION AS YOUR FIRST CODE */}
          <input
            type="text"
            placeholder="Search by name, email, or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-sm px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
          />
        </div>

        {/* COUNTS */}
        <div className="flex gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-green-600/20 text-green-400">
            Approved: {approvedCount}
          </span>
          <span className="px-3 py-1 rounded-full bg-yellow-600/20 text-yellow-400">
            Pending: {pendingCount}
          </span>
          <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400">
            Blocked: {blockedCount}
          </span>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {paginatedAgents.map((a) => {
          const flagCount = a.flaggedByRestaurants?.length || 0;

          return (
            <div
              key={a._id}
              className="bg-black/70 border border-white/20 rounded-xl p-4 flex flex-col h-70"
            >
              <img
                src={a.image || "/assets/agent.png"}
                alt={a.name}
                className="w-full h-32 object-cover rounded-md"
              />

              <div className="mt-2 flex justify-between items-center">
                <h3 className="text-lg font-semibold truncate">{a.name}</h3>

                <span
                  className={`px-3 py-1 text-xs rounded-full capitalize ${
                    a.approvalStatus === "approved"
                      ? "bg-green-600/20 text-green-400"
                      : a.approvalStatus === "pending"
                      ? "bg-yellow-600/20 text-yellow-400"
                      : "bg-red-600/20 text-red-400"
                  }`}
                >
                  {a.approvalStatus}
                </span>
              </div>

              <p className="text-sm text-gray-400 truncate">{a.email}</p>

              {flagCount > 0 && (
                <button
                  onClick={() => setActiveAgent(a)}
                  className="mt-2 flex items-center gap-1 text-xs text-red-400 hover:underline"
                >
                  <Flag size={12} />
                  View Flags ({flagCount})
                </button>
              )}

              <button
                className={`mt-auto w-full py-2 rounded-lg font-medium transition ${
                  a.approvalStatus === "approved"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                onClick={() => toggleStatus(a._id, a.approvalStatus)}
              >
                {a.approvalStatus === "approved"
                  ? "Block Agent"
                  : "Approve Agent"}
              </button>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
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

      {/* FLAG REASON MODAL */}
      {activeAgent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black border border-white/20 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4 text-red-400">
              Flag Reasons – {activeAgent.name}
            </h3>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {activeAgent.flaggedByRestaurants.map((f, idx) => (
                <div
                  key={idx}
                  className="border border-red-500/30 rounded-lg p-3"
                >
                  <p className="text-sm">
                    <span className="text-red-400">Restaurant:</span>{" "}
                    {f.restaurantId?.name || "Unknown"}
                  </p>

                  {f.reason && (
                    <p className="text-gray-300 italic mt-1">“{f.reason}”</p>
                  )}

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(f.flaggedAt).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() =>
                        unflagAgent(activeAgent._id, f.restaurantId?._id)
                      }
                      className="flex items-center gap-1 text-red-400 hover:text-red-300"
                    >
                      <XCircle size={14} />
                      Unflag
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveAgent(null)}
              className="mt-6 w-full py-2 rounded bg-gray-700 hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
