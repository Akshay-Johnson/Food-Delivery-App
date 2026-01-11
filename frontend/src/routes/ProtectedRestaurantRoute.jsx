import { Navigate } from "react-router-dom";

export default function ProtectedRestaurantRoute({ children }) {
  const token = localStorage.getItem("restaurantToken");

  if (!token) {
    return <Navigate to="/restaurant/login" replace />;
  }

  return children;
}
