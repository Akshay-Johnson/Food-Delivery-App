import { Navigate } from "react-router-dom";

export default function ProtectedAgentRoute({ children }) {
  const token = localStorage.getItem("agentToken");

  if (!token) {
    return <Navigate to="/agent/login" replace />;
  }

  return children;
}
