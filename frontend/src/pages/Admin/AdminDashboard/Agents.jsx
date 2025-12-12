import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

export default function AdminAgents() {
  const [list, setList] = useState([]);

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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Delivery Agents</h2>

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
          {list.map((a) => (
            <tr key={a._id} className="border-b border-white/20">
              <td>{a.name}</td>
              <td>{a.email}</td>
              <td>{a.status === "approved" ? "Approved" : "Blocked"}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
