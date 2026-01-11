import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import { initForegroundPush } from "./utils/foregroundPush";

// ================= CUSTOMER =================
import CustomerLogin from "./pages/Customer/CustomerLogin.jsx";
import CustomerRegister from "./pages/Customer/CustomerRegister.jsx";
import CustomerDashboard from "./pages/Customer/CustomerDashboard/CustomerDashboard.jsx";
import CustomerProfile from "./pages/Customer/CustomerProfile/CustomerProfile.jsx";
import CustomerProfileEdit from "./pages/Customer/CustomerProfile/CustomerProfileEdit.jsx";
import CustomerAddressList from "./pages/Customer/CusomerAddress/CustomerAddressList.jsx";
import CustomerAddAddress from "./pages/Customer/CusomerAddress/CustomerAddAddress.jsx";
import CustomerEditAddress from "./pages/Customer/CusomerAddress/CustomerEditAddress.jsx";
import RestaurantDetails from "./pages/Customer/RestaurantDetails/RestaurantDetails.jsx";
import CustomerOrders from "./pages/Customer/CustomerCart/CustomerOrders.jsx";
import CustomerOrderDetails from "./pages/Customer/CustomerCart/CustomerOrderDetails.jsx";
import CustomerCart from "./pages/Customer/CustomerCart/CustomerCart.jsx";
import CustomerCheckout from "./pages/Customer/CustomerCart/CustomerCheckout.jsx";
import CustomerPayment from "./pages/Customer/Payment/CustomerPayment.jsx";

// ================= ADMIN =================
import AdminLogin from "./pages/Admin/AdminLogin.jsx";
import AdminRegister from "./pages/Admin/AdminRegister.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard.jsx";
import Restaurants from "./pages/Admin/AdminDashboard/Restaurants.jsx";
import Customers from "./pages/Admin/AdminDashboard/Customers.jsx";
import AdminAgents from "./pages/Admin/AdminDashboard/Agents.jsx";
import AdminRestaurantOrders from "./pages/Admin/AdminDashboard/AdminRestauratOrders.jsx";
import AdminOrdersByRestaurant from "./pages/Admin/AdminDashboard/AdminOrdersByRestaurant.jsx";
import AdminReviews from "./pages/Admin/AdminDashboard/AdminReviews.jsx";

// ================= RESTAURANT =================
import RestaurantLogin from "./pages/Restaurant/RestaurantLogin.jsx";
import RestaurantRegister from "./pages/Restaurant/RestaurantRegister.jsx";
import RestaurantDashboard from "./pages/Restaurant/RestaurantDashboard/RestaurantDashboard.jsx";
import MenuManagement from "./pages/Restaurant/RestaurantDashboard/RestaurantMenu/MenuManagement.jsx";
import AddMenuItem from "./pages/Restaurant/RestaurantDashboard/RestaurantMenu/AddMenuItem.jsx";
import EditMenuItem from "./pages/Restaurant/RestaurantDashboard/RestaurantMenu/EditMenuItem.jsx";
import Orders from "./pages/Restaurant/RestaurantDashboard/RestaurantOrders/Orders.jsx";
import RestaurantProfile from "./pages/Restaurant/RestaurantDashboard/RestaurantProfile/RestaurantProfile.jsx";
import AssignAgent from "./pages/Restaurant/RestaurantDashboard/RestaurantOrders/AssignAgents.jsx";
import RestaurantAgents from "./pages/Restaurant/RestaurantDashboard/RestaurantAgents/RestaurantAgents.jsx";
import RestaurantReviews from "./pages/Restaurant/RestaurantDashboard/RestaurantReviews/RestaurantReviews.jsx";

// ================= AGENT =================
import AgentLogin from "./pages/DeliveryAgent/AgentLogin.jsx";
import AgentRegister from "./pages/DeliveryAgent/AgentRegister.jsx";
import AgentDashboard from "./pages/DeliveryAgent/AgentDashboard/AgentDashboard.jsx";
import AgentOrders from "./pages/DeliveryAgent/AgentDashboard/AgentOrders.jsx";
import AgentProfile from "./pages/DeliveryAgent/AgentDashboard/AgentProfile.jsx";

// ================= COMMON =================
import Home from "./pages/Home/Home.jsx";

// ================= ROUTE GUARD =================
import ProtectedCustomerRoute from "./routes/ProtectedCustomerRoute";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";
import ProtectedRestaurantRoute from "./routes/ProtectedRestaurantRoute";
import ProtectedAgentRoute from "./routes/ProtectedAgentRoute";

export default function App() {
  useEffect(() => {
    initForegroundPush();
  }, []);

  console.log("API URL =", import.meta.env.VITE_API_URL);

  return (
    <BrowserRouter>
      <Routes>
        {/* ================= HOME ================= */}
        <Route path="/" element={<Home />} />

        {/* ================= CUSTOMER AUTH ================= */}
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegister />} />

        {/* ================= PROTECTED CUSTOMER ROUTES ================= */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedCustomerRoute>
              <CustomerDashboard />
            </ProtectedCustomerRoute>
          }
        />

        <Route
          path="/customer/profile"
          element={
            <ProtectedCustomerRoute>
              <CustomerProfile />
            </ProtectedCustomerRoute>
          }
        />

        <Route
          path="/customer/profile/edit"
          element={
            <ProtectedCustomerRoute>
              <CustomerProfileEdit />
            </ProtectedCustomerRoute>
          }
        />

        <Route
          path="/customer/address"
          element={
            <ProtectedCustomerRoute>
              <CustomerAddressList />
            </ProtectedCustomerRoute>
          }
        />

        <Route
          path="/customer/address/add"
          element={
            <ProtectedCustomerRoute>
              <CustomerAddAddress />
            </ProtectedCustomerRoute>
          }
        />

        <Route
          path="/customer/address/edit/:id"
          element={
            <ProtectedCustomerRoute>
              <CustomerEditAddress />
            </ProtectedCustomerRoute>
          }
        />

        <Route
          path="/customer/restaurant/:id"
          element={
            <ProtectedCustomerRoute>
              <RestaurantDetails />
            </ProtectedCustomerRoute>
          }
        />

        <Route
          path="/customer/cart"
          element={
            <ProtectedCustomerRoute>
              <CustomerCart />
            </ProtectedCustomerRoute>
          }
        />

        <Route
          path="/customer/checkout"
          element={
            <ProtectedCustomerRoute>
              <CustomerCheckout />
            </ProtectedCustomerRoute>
          }
        />

        <Route
          path="/customer/payment"
          element={
            <ProtectedCustomerRoute>
              <CustomerPayment />
            </ProtectedCustomerRoute>
          }
        />

        <Route
          path="/customer/orders"
          element={
            <ProtectedCustomerRoute>
              <CustomerOrders />
            </ProtectedCustomerRoute>
          }
        />

        <Route
          path="/customer/orders/:orderId"
          element={
            <ProtectedCustomerRoute>
              <CustomerOrderDetails />
            </ProtectedCustomerRoute>
          }
        />

        {/* ================= ADMIN ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        >
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="customers" element={<Customers />} />
          <Route path="agents" element={<AdminAgents />} />
          <Route path="orders" element={<AdminRestaurantOrders />} />
          <Route
            path="orders/restaurant/:restaurantId"
            element={<AdminOrdersByRestaurant />}
          />
          <Route path="reviews/:restaurantId" element={<AdminReviews />} />
        </Route>

        {/* ================= RESTAURANT ================= */}
        <Route path="/restaurant/login" element={<RestaurantLogin />} />
        <Route path="/restaurant/register" element={<RestaurantRegister />} />

        <Route
          path="/restaurant/dashboard"
          element={
            <ProtectedRestaurantRoute>
              <RestaurantDashboard />
            </ProtectedRestaurantRoute>
          }
        >
          <Route path="menu" element={<MenuManagement />} />
          <Route path="menu/add" element={<AddMenuItem />} />
          <Route path="menu/edit/:id" element={<EditMenuItem />} />
          <Route path="orders" element={<Orders />} />
          <Route path="assign-agent/:orderId" element={<AssignAgent />} />
          <Route path="profile" element={<RestaurantProfile />} />
          <Route path="agents" element={<RestaurantAgents />} />
          <Route path="reviews" element={<RestaurantReviews />} />
        </Route>

        {/* ================= AGENT ================= */}
        <Route path="/agent/login" element={<AgentLogin />} />
        <Route path="/agent/register" element={<AgentRegister />} />

        <Route
          path="/agent/dashboard"
          element={
            <ProtectedAgentRoute>
              <AgentDashboard />
            </ProtectedAgentRoute>
          }
        >
          <Route path="orders" element={<AgentOrders />} />
          <Route path="profile" element={<AgentProfile />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
