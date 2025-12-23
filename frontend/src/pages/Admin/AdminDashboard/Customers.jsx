import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import Toast from "../../../components/toast/toast";

export default function Customers() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const customersPerPage = 6;

  const load = async () => {
    const res = await api.get("/api/admins/customers");
    setList(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  // 🔒 BLOCK / UNBLOCK CUSTOMER
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

  /* FILTER */
  const filteredCustomers = list.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  });

  /* PAGINATION */
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * customersPerPage,
    page * customersPerPage
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Customers</h2>

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
        placeholder="Search by name, email, or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
      />

      {/* CARDS */}
      {paginatedCustomers.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No matching customers found.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCustomers.map((c) => (
              <div
                key={c._id}
                className="bg-black/60 backdrop-blur-lg border border-white/20 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <img
                    src={c.profileImage || "/assets/customer.png"}
                    alt={c.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />

                  <h3 className="text-lg font-semibold mb-1">{c.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{c.email}</p>
                  <p className="text-sm text-gray-300 mb-3">
                    <span className="text-gray-400">Phone:</span> {c.phone}
                  </p>

                  {/* STATUS */}
                  <span
                    className={`inline-block px-3 py-1 text-xs rounded-full ${
                      c.isActive
                        ? "bg-green-600/20 text-green-400"
                        : "bg-red-600/20 text-red-400"
                    }`}
                  >
                    {c.isActive ? "Active" : "Blocked"}
                  </span>
                </div>

                {/* ACTION */}
                <button
                  onClick={() => toggleStatus(c._id, c.isActive)}
                  className={`mt-5 py-2 rounded-lg font-medium transition ${
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
