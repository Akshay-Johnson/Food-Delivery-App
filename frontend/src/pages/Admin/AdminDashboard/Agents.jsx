import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import Toast from "../../../components/toast/toast";

export default function AdminAgents() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  //  Pagination
  const [page, setPage] = useState(1);
  const agentsPerPage = 6;

  const load = async () => {
    const res = await api.get("/api/admins/agents");
    setList(res.data || []);
  };

  const toggleStatus = async (id, approvalStatus) => {
    try {
      const nextStatus = approvalStatus === "approved" ? "blocked" : "approved";

      await api.put(`/api/admins/agent/status/${id}`, {
        approvalStatus: nextStatus,
      });

      load();
    } catch (err) {
      console.error("Agent approval update failed", err.response?.data || err);

      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to update agent",
      });
    }
  };

  useEffect(() => {
    load();
  }, []);

  /*  SEARCH FILTER */
  const filteredAgents = list.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.approvalStatus?.toLowerCase().includes(q)
    );
  });

  /*  PAGINATION LOGIC */
  const totalPages = Math.ceil(filteredAgents.length / agentsPerPage);
  const startIndex = (page - 1) * agentsPerPage;
  const paginatedAgents = filteredAgents.slice(
    startIndex,
    startIndex + agentsPerPage
  );

  // reset page on search
  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Delivery Agents</h2>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by name, email, or status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-xl mb-6 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-400"
      />

      {/* CARDS */}
      {paginatedAgents.length === 0 ? (
        <p className="text-center text-gray-400 py-8">
          No matching agents found.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-xl h-xl ">
            {paginatedAgents.map((a) => (
              <div
                key={a._id}
                className="bg-black/60 backdrop-blur-lg border border-white/20 rounded-xl p-5 flex flex-col justify-between "
              >
                {/* INFO */}
                <div>
                  <img
                    src={a.image || "/assets/agent-avatar.png"}
                    alt={a.name}
                    className="w-full h-20 object-cover rounded-md mb-3"
                  />

                  <h3 className="text-lg font-semibold mb-1">{a.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{a.email}</p>

                  <span
                    className={`inline-block px-3 py-1 text-xs rounded-full capitalize ${
                      a.approvalStatus === "approved"
                        ? "bg-green-600/20 text-green-400"
                        : "bg-red-600/20 text-red-400"
                    }`}
                  >
                    {a.approvalStatus}
                  </span>
                </div>

                {/* ACTION */}
                <button
                  className={`mt-5 py-2 rounded-lg font-medium transition ${
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
            ))}
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
