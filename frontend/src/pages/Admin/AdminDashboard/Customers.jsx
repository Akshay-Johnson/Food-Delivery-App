import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import Toast from "../../../components/toast/toast";

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
    <div className="text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Customers</h2>
          {/* SEARCH — SAME POSITION */}
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-sm px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
          />
        </div>

        {/* COUNTS */}
        <div className="flex gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-green-600/20 text-green-400">
            Active: {activeCount}
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

      {paginatedCustomers.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No matching customers found.
        </p>
      ) : (
        <>
          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {paginatedCustomers.map((c) => (
              <div
                key={c._id}
                className="bg-black/70 backdrop-blur-lg border border-white/20
                           rounded-xl p-4 flex flex-col h-70"
              >
                {/* IMAGE */}
                <img
                  src={c.profileImage || "/assets/customer.png"}
                  alt={c.name}
                  className="w-full h-25 object-cover rounded-md"
                />

                {/* NAME + STATUS */}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold line-clamp-1">
                    {c.name}
                  </h3>

                  <span
                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                      c.isActive
                        ? "bg-green-600/20 text-green-400"
                        : "bg-red-600/20 text-red-400"
                    }`}
                  >
                    {c.isActive ? "Active" : "Blocked"}
                  </span>
                </div>

                {/* EMAIL */}
                <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                  {c.email}
                </p>

                {/* PHONE */}
                <p className="text-sm text-gray-300 mt-1">{c.phone}</p>

                {/* ACTION */}
                <button
                  onClick={() => toggleStatus(c._id, c.isActive)}
                  className={`mt-auto w-full py-2 rounded-lg font-medium transition ${
                    c.isActive
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {c.isActive ? "Block Customer" : "Unblock Customer"}
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
