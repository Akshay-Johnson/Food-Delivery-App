import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import Toast from "../../../components/toast/toast";
import { Flag, XCircle } from "lucide-react";

export default function AdminAgents() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [expandedAgentId, setExpandedAgentId] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const agentsPerPage = 10;

  const load = async () => {
    try {
      const res = await api.get("/api/admins/agents");
      setList(res.data || []);
    } catch (err) {
      console.error("Failed to load agents", err);
    }
  };

  const toggleStatus = async (id, approvalStatus) => {
    try {
      const nextStatus =
        approvalStatus === "approved" ? "blocked" : "approved";

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
      await api.put(
        `/api/admins/agents/${agentId}/unflag/${restaurantId}`
      );

      setToast({
        type: "success",
        message: "Flag removed successfully",
      });

      load();
    } catch {
      setToast({
        type: "error",
        message: "Failed to remove flag",
      });
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* 🔍 FILTER */
  const filteredAgents = list.filter((a) => {
    const q = search.toLowerCase();
    const statusText = a.isActive ? "active" : "blocked";
    return (
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.approvalStatus?.toLowerCase().includes(q) ||
      statusText.includes(q)
    );
  });

  /* 📄 PAGINATION */
  const totalPages = Math.ceil(filteredAgents.length / agentsPerPage);
  const paginatedAgents = filteredAgents.slice(
    (page - 1) * agentsPerPage,
    page * agentsPerPage
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="text-white">
      {/* HEADER */}
      <div className="flex items-center gap-6 mb-6">
        <h2 className="text-2xl font-bold">Delivery Agents</h2>

        <input
          type="text"
          placeholder="Search by name, email, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-sm px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
        />
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {paginatedAgents.length === 0 ? (
        <p className="text-center text-gray-400 py-8">
          No matching agents found.
        </p>
      ) : (
        <>
          {/* GRID — SAME AS OTHER ADMIN PAGES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {paginatedAgents.map((a) => {
              const flagCount = a.flaggedByRestaurants?.length || 0;

              return (
                <div
                  key={a._id}
                  className="bg-black/70 backdrop-blur-lg border border-white/20
                             rounded-xl p-4 flex flex-col h-70"
                >
                  {/* IMAGE */}
                  <img
                    src={a.image || "/assets/agent.png"}
                    alt={a.name}
                    className="w-full h-32 object-cover rounded-md"
                  />

                  {/* NAME + STATUS */}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold line-clamp-1">
                      {a.name}
                    </h3>

                    <span
                      className={`px-3 py-1 text-xs rounded-full capitalize whitespace-nowrap ${
                        a.approvalStatus === "approved"
                          ? "bg-green-600/20 text-green-400"
                          : "bg-red-600/20 text-red-400"
                      }`}
                    >
                      {a.approvalStatus}
                    </span>
                  </div>

                  {/* EMAIL */}
                  <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                    {a.email}
                  </p>

                  {/* FLAGS */}
                  {flagCount > 0 && (
                    <button
                      onClick={() =>
                        setExpandedAgentId(
                          expandedAgentId === a._id ? null : a._id
                        )
                      }
                      className="mt-2 flex items-center gap-1 text-xs text-red-400 hover:underline"
                    >
                      <Flag size={12} />
                      Flagged ({flagCount})
                    </button>
                  )}

                  {/* FLAG DETAILS */}
                  {expandedAgentId === a._id && (
                    <div className="mt-2 space-y-2 text-xs bg-black/40 border border-red-500/30 rounded-lg p-2 max-h-28 overflow-y-auto">
                      {a.flaggedByRestaurants.map((f, idx) => (
                        <div
                          key={idx}
                          className="border-b border-white/10 pb-1 last:border-b-0"
                        >
                          <p className="text-gray-300">
                            <span className="text-red-400">
                              Restaurant:
                            </span>{" "}
                            {f.restaurantId}
                          </p>

                          {f.reason && (
                            <p className="text-gray-400 italic">
                              “{f.reason}”
                            </p>
                          )}

                          <div className="flex justify-between items-center mt-1">
                            <p className="text-gray-500">
                              {new Date(f.flaggedAt).toLocaleDateString()}
                            </p>

                            <button
                              onClick={() =>
                                unflagAgent(a._id, f.restaurantId)
                              }
                              className="flex items-center gap-1 text-red-400 hover:text-red-300"
                            >
                              <XCircle size={12} />
                              Unflag
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ACTION BUTTON — FIXED BOTTOM */}
                  <button
                    className={`mt-auto w-full py-2 rounded-lg font-medium transition ${
                      a.approvalStatus === "approved"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    onClick={() =>
                      toggleStatus(a._id, a.approvalStatus)
                    }
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
        </>
      )}
    </div>
  );
}
