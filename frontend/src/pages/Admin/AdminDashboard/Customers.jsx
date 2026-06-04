import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import Toast from "../../../components/toast/toast";
import { Search, Mail, Phone, Ban, CheckCircle, AlertCircle } from "lucide-react";

export default function Customers() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const customersPerPage = 10;

  /* ================= LOAD ================= */
  const load = async () => {
    const res = await api.get("/api/admins/customers");
    setList(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= BLOCK / UNBLOCK ================= */
  const toggleStatus = async (id, isActive) => {
    try {
      await api.put(`/api/admins/customer/status/${id}`, {
        isActive: !isActive,
      });

      setToast({
        type: "success",
        message: isActive
          ? "Customer blocked successfully"
          : "Customer unblocked successfully",
      });

      load();
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.response?.data?.message || "Failed to update customer status",
      });
    }
  };

  /* ================= FILTER ================= */
  const filteredCustomers = list.filter((c) => {
    const q = search.toLowerCase();
    const statusText = c.isActive ? "active" : "blocked";

    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      statusText.includes(q)
    );
  });

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * customersPerPage,
    page * customersPerPage
  );

  useEffect(() => setPage(1), [search]);

  /* ================= STATUS COUNTS ================= */
  const activeCount = list.filter((c) => c.isActive).length;
  const blockedCount = list.filter((c) => !c.isActive).length;

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
          <h2 className="text-3xl font-extrabold text-white">Customers</h2>
          <p className="text-xs text-gray-400 mt-1">Manage active shoppers and toggle account restrictions</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {/* SEARCH BOX */}
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all duration-300 text-sm shadow-inner"
            />
          </div>

          {/* COUNTS */}
          <div className="flex gap-2 text-xs font-bold shrink-0">
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active: {activeCount}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              Blocked: {blockedCount}
            </span>
          </div>
        </div>
      </div>

      {paginatedCustomers.length === 0 ? (
        <div className="bg-black/70 border border-white/20 rounded-2xl py-16 text-center space-y-3">
          <div className="inline-flex p-4 rounded-full bg-white/5 text-gray-500">
            <AlertCircle size={32} />
          </div>
          <p className="text-gray-400 text-base font-medium">No customers found matching your search.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {paginatedCustomers.map((c) => (
              <div
                key={c._id}
                className="bg-black/70 border border-white/20 rounded-2xl p-4 flex flex-col justify-between hover:border-orange-500/30 transition duration-300 shadow-lg min-h-[300px]"
              >
                <div className="space-y-3">
                  {/* IMAGE */}
                  <img
                    src={c.profileImage || "/assets/customer.png"}
                    alt={c.name}
                    className="w-full h-28 object-cover border border-white/10 rounded-xl bg-white/5"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/customer.png";
                    }}
                  />

                  {/* NAME + STATUS */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <h3 className="font-bold text-white truncate text-sm">{c.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        c.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {c.isActive ? "Active" : "Blocked"}
                    </span>
                  </div>

                  {/* DETAILS */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-gray-400">
                    <p className="truncate flex items-center gap-1.5">
                      <Mail size={12} className="text-gray-500" />
                      {c.email}
                    </p>
                    <p className="truncate flex items-center gap-1.5">
                      <Phone size={12} className="text-gray-500" />
                      {c.phone || "No phone number"}
                    </p>
                  </div>
                </div>

                {/* ACTION */}
                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={() => toggleStatus(c._id, c.isActive)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 text-white ${
                      c.isActive
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {c.isActive ? (
                      <>
                        <Ban size={12} />
                        Block Account
                      </>
                    ) : (
                      <>
                        <CheckCircle size={12} />
                        Activate Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
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
    </div>
  );
}
