import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../../api/axiosInstance";
import { Bike, UserCheck } from "lucide-react";

export default function AssignAgent() {
  const { orderId } = useParams();

  const [agents, setAgents] = useState([]);
  const [assignedAgentId, setAssignedAgentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  // Load available agents
  const loadAgents = async () => {
    try {
      const res = await api.get("/api/agents/available");
      setAgents(res.data);
    } catch (error) {
      console.error("Failed to load agents:", error);
      alert("Unable to load delivery agents");
    }
  };

  // Load order to check if already assigned
  const loadOrder = async () => {
    try {
      const res = await api.get(`/api/restaurants/orders/${orderId}`);
      setAssignedAgentId(res.data?.assignedAgent?._id || null);
    } catch (error) {
      console.error("Failed to load order:", error);
    }
  };

  // Assign agent
  const assignAgent = async (agentId) => {
    if (assignedAgentId) return;

    try {
      setAssigning(true);

      await api.post(`/api/restaurants/orders/assign-agent/${orderId}`, {
        agentId,
      });

      setAssignedAgentId(agentId);
      alert("Agent assigned successfully");
    } catch (error) {
      console.error("Assignment failed:", error);
      alert(error.response?.data?.message || "Failed to assign agent");
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadAgents(), loadOrder()]);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return <p className="text-white">Loading agents...</p>;
  }

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-6">
        Assign Agent to Order #{orderId}
      </h1>

      {agents.length === 0 && (
        <p className="text-gray-400">No available agents</p>
      )}

      <div className="grid grid-cols-3 gap-6">
        {agents.map((agent) => {
          const isAssigned = assignedAgentId === agent._id;
          const isDisabled = assignedAgentId && !isAssigned;

          return (
            <div
              key={agent._id}
              className={`p-5 rounded-xl border border-white/20
                ${isAssigned ? "bg-green-900/30" : "bg-white/10"}
              `}
            >
              <div className="flex items-center gap-4">
                <Bike
                  className={isAssigned ? "text-green-400" : "text-yellow-400"}
                  size={40}
                />
                <div>
                  <h2 className="text-xl font-semibold">{agent.name}</h2>
                  <p className="text-gray-300">{agent.phone}</p>
                  <p className="text-sm text-gray-400">
                    {agent.vehicleType} • {agent.vehicleNumber}
                  </p>
                </div>
              </div>

              <button
                disabled={isAssigned || isDisabled || assigning}
                onClick={() => assignAgent(agent._id)}
                className={`mt-4 w-full px-4 py-2 rounded flex items-center justify-center gap-2 transition
                  ${
                    isAssigned
                      ? "bg-gray-600 cursor-not-allowed"
                      : isDisabled
                      ? "bg-gray-800 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }
                `}
              >
                <UserCheck size={18} />
                {isAssigned ? "Assigned" : "Assign Agent"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
