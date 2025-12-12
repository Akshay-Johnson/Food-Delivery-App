import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";
import { Bike, UserCheck } from "lucide-react";

export default function AssignAgent() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAgents = async () => {
    try {
      const res = await api.get("/api/admins/agents");
      setAgents(res.data);
    } catch (error) {
      console.error("Failed to load agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const assignAgent = async (agentId) => {
    try {
      await api.put(`/api/restaurants/orders/assign/${orderId}`, {
        agentId,
      });

      alert("Agent assigned successfully");
      navigate("/restaurant/dashboard/orders");
    } catch (error) {
      console.error("Assignment failed:", error);
      alert("Failed to assign agent");
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  if (loading) return <p className="text-white">Loading agents...</p>;

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-6">
        Assign Agent to Order #{orderId}
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {agents
          .filter((a) => a.status === "available")
          .map((agent) => (
            <div
              key={agent._id}
              className="bg-white/10 p-5 rounded-xl border border-white/20"
            >
              <div className="flex items-center gap-4">
                <Bike className="text-yellow-400" size={40} />
                <div>
                  <h2 className="text-xl font-semibold">{agent.name}</h2>
                  <p className="text-gray-300">{agent.phone}</p>
                </div>
              </div>

              <button
                onClick={() => assignAgent(agent._id)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2"
              >
                <UserCheck size={18} /> Assign Agent
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
