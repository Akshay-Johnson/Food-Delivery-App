import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import Toast from "../../../components/toast/toast";
import { Flag, XCircle, Search, Mail, ShieldAlert, Award, Compass, AlertTriangle, UserCheck, Ban, Phone, Bike } from "lucide-react";

export default function AdminAgents() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_API_URL;

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
      setToast({ type: "success", message: `Agent marked as ${nextStatus}!` });
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
  const approvedCount = list.filter((a) => a.approvalStatus === "approved").length;
  const pendingCount = list.filter((a) => a.approvalStatus === "pending").length;
  const blockedCount = list.filter((a) => a.approvalStatus === "blocked").length;

  return (
    <div className="text-white max-w-7xl mx-auto space-y-8">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Delivery Agents</h2>
          <p className="text-xs text-gray-400 mt-1">Approve, block and monitor driver flag records</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {/* SEARCH */}
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all duration-300 text-sm shadow-inner"
            />
          </div>

          {/* COUNTS */}
          <div className="flex gap-2 text-xs font-bold shrink-0">
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Approved: {approvedCount}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Pending: {pendingCount}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              Blocked: {blockedCount}
            </span>
          </div>
        </div>
      </div>

      {/* GRID */}
      {paginatedAgents.length === 0 ? (
        <div className="bg-black/70 border border-white/20 rounded-2xl py-16 text-center space-y-3">
          <div className="inline-flex p-4 rounded-full bg-white/5 text-gray-500">
            <AlertTriangle size={32} />
          </div>
          <p className="text-gray-400 text-base font-medium">No agents found matching your query.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {paginatedAgents.map((a) => {
              const flagCount = a.flaggedByRestaurants?.length || 0;

              return (
                <div
                  key={a._id}
                  className="bg-black/70 border border-white/20 rounded-2xl p-4 flex flex-col justify-between hover:border-orange-500/30 transition duration-300 relative group shadow-lg min-h-[350px]"
                >
                  {/* FLAG IN CORNER */}
                  {flagCount > 0 && (
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={() => setActiveAgent(a)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500/25 border border-red-500/40 text-red-400 cursor-pointer transition hover:bg-red-500/40"
                        title={`View ${flagCount} Flagged Reasons`}
                      >
                        <Flag size={12} fill="currentColor" />
                      </button>
                    </div>
                  )}

                  {/* USER INFO */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={a.image && a.image.startsWith("http") ? a.image : "/assets/agent.png"}
                        className="w-12 h-12 object-cover border border-white/10 rounded-xl bg-white/5"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/assets/agent.png";
                        }}
                        alt={a.name}
                      />
                      <div className="min-w-0 pr-6">
                        <h3 className="font-bold text-white truncate text-sm">{a.name}</h3>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <Mail size={10} />
                          {a.email}
                        </p>
                      </div>
                    </div>

                    {/* PHONE & VEHICLE DETAILS */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-gray-400">
                      <p className="truncate flex items-center gap-1.5">
                        <Phone size={12} className="text-gray-500" />
                        {a.phone || "No phone number"}
                      </p>
                      <p className="truncate flex items-center gap-1.5">
                        <Bike size={12} className="text-gray-500" />
                        <span>{a.vehicleType || "N/A"} • {a.vehicleNumber || "N/A"}</span>
                      </p>
                    </div>

                    {/* APPROVAL STATUS & ACTIVITY STATUS */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Approval</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          a.approvalStatus === "approved"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : a.approvalStatus === "pending"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {a.approvalStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Activity</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          a.status === "available"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : a.status === "offline"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {a.status || "offline"}
                      </span>
                    </div>

                    {flagCount > 0 && (
                      <button
                        onClick={() => setActiveAgent(a)}
                        className="w-full py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border border-red-500/10 transition"
                      >
                        <ShieldAlert size={12} />
                        Flags Recorded ({flagCount})
                      </button>
                    )}
                  </div>

                  {/* BLOCK / APPROVE BUTTON */}
                  <div className="pt-4 mt-auto border-t border-white/5">
                    <button
                      className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 text-white ${
                        a.approvalStatus === "approved"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                      onClick={() => toggleStatus(a._id, a.approvalStatus)}
                    >
                      {a.approvalStatus === "approved" ? (
                        <>
                          <Ban size={12} />
                          Block Agent
                        </>
                      ) : (
                        <>
                          <UserCheck size={12} />
                          Approve Agent
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION PANEL */}
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
        </div>
      )}

      {/* FLAG REASON MODAL */}
      {activeAgent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <ShieldAlert className="text-red-500" size={20} />
              <h3 className="text-xl font-bold text-white">
                Flag Reports — {activeAgent.name}
              </h3>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activeAgent.flaggedByRestaurants.map((f, idx) => (
                <div
                  key={idx}
                  className="bg-red-500/5 border border-red-500/20 rounded-xl p-3.5 space-y-1.5"
                >
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Reported by: <span className="text-white normal-case font-bold">{f.restaurantId?.name || "Unknown"}</span>
                  </p>

                  {f.reason && (
                    <p className="text-gray-300 italic text-sm">“{f.reason}”</p>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                      {new Date(f.flaggedAt).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => unflagAgent(activeAgent._id, f.restaurantId?._id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition cursor-pointer"
                    >
                      <XCircle size={14} />
                      Unflag Account
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveAgent(null)}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold border border-white/10 transition text-white"
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
