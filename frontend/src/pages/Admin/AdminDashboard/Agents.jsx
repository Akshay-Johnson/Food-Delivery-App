import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

export default function AdminAgents() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    const res = await api.get("/api/admins/agents");
    setList(res.data);
  };

  const toggleStatus = async (id, value) => {
    await api.put(`/api/admins/agent/status/${id}`, { status: value });
    load();
  };

  useEffect(() => {
    load();
  }, []);

  // 🔍 SEARCH FILTER
  const filteredAgents = list.filter((a) => {
    const q = search.toLowerCase();

    return (
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Delivery Agents</h2>

      {/* 🔍 SEARCH INPUT */}
      <input
        type="text"
        placeholder="Search by name, email, or status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded bg-black/40 border border-white/20 text-white placeholder-gray-400"
      />

      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredAgents.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center text-gray-400 py-4">
                No matching agents found.
              </td>
            </tr>
          ) : (
            filteredAgents.map((a) => (
              <tr key={a._id} className="border-b border-white/20">
                <td>{a.name}</td>
                <td>{a.email}</td>
                <td
                  className={
                    a.status === "approved"
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {a.status === "approved" ? "Approved" : "Blocked"}
                </td>
                <td>
                  <button
                    className="bg-blue-600 px-3 py-1 rounded"
                    onClick={() =>
                      toggleStatus(
                        a._id,
                        a.status === "approved" ? "blocked" : "approved"
                      )
                    }
                  >
                    {a.status === "approved" ? "Block" : "Activate"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
