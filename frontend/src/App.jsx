import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useEffect } from "react";

import { initForegroundPush } from "./utils/foregroundPush";

//login and register for customer
import CustomerLogin from "./pages/Customer/CustomerLogin.jsx";
import CustomerRegister from "./pages/Customer/CustomerRegister.jsx";

//dashboard and others
import CustomerDashboard from "./pages/Customer/CustomerDashboard/CustomerDashboard.jsx";
import CustomerProfile from "./pages/Customer/CustomerProfile/CustomerProfile.jsx";
import CustomerProfileEdit from "./pages/Customer/CustomerProfile/CustomerProfileEdit.jsx";
import CustomerAddressList from "./pages/Customer/CusomerAddress/CustomerAddressList.jsx";
import CustomerAddAddress from "./pages/Customer/CusomerAddress/CustomerAddAddress.jsx";
import CustomerEditAddress from "./pages/Customer/CusomerAddress/CustomerEditAddress.jsx";
import RestaurantDetails from "./pages/Customer/RestaurantDetails/RestaurantDetails.jsx";
import CustomerOrders from "./pages/Customer/CustomerCart/CustomerOrders.jsx";
import CustomerOrderDetails from "./pages/Customer/CustomerCart/CustomerOrderDetails";

import AdminLogin from "./pages/Admin/AdminLogin.jsx";
import AdminRegister from "./pages/Admin/AdminRegister.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard.jsx";
import Restaurants from "./pages/Admin/AdminDashboard/Restaurants.jsx";
import Customers from "./pages/Admin/AdminDashboard/Customers.jsx";
import AdminAgents from "./pages/Admin/AdminDashboard/Agents.jsx";
import AdminOrders from "./pages/Admin/AdminDashboard/Orders.jsx";

//login and register for restaurant
import RestaurantLogin from "./pages/Restaurant/RestaurantLogin.jsx";
import RestaurantRegister from "./pages/Restaurant/RestaurantRegister.jsx";

//dashboard and others for restaurant
import RestaurantDashboard from "./pages/Restaurant/RestaurantDashboard/RestaurantDashboard.jsx";
import MenuManagement from "./pages/Restaurant/RestaurantDashboard/RestaurantMenu/MenuManagement.jsx";
import AddMenuItem from "./pages/Restaurant/RestaurantDashboard/RestaurantMenu/AddMenuItem.jsx";
import EditMenuItem from "./pages/Restaurant/RestaurantDashboard/RestaurantMenu/EditMenuItem.jsx";
import Orders from "./pages/Restaurant/RestaurantDashboard/RestaurantOrders/Orders.jsx";
import RestaurantProfile from "./pages/Restaurant/RestaurantDashboard/RestaurantProfile/RestaurantProfile.jsx";
import AssignAgent from "./pages/Restaurant/RestaurantDashboard/RestaurantOrders/AssignAgents.jsx";
import RestaurantAgents from "./pages/Restaurant/RestaurantDashboard/RestaurantAgents/RestaurantAgents.jsx";
import RestaurantReviews from "./pages/Restaurant/RestaurantDashboard/RestaurantReviews/RestaurantReviews.jsx";

import CustomerCart from "./pages/Customer/CustomerCart/CustomerCart.jsx";
import CustomerCheckout from "./pages/Customer/CustomerCart/CustomerCheckout.jsx";
import CustomerPayment from "./pages/Customer/Payment/CustomerPayment.jsx";

import AgentLogin from "./pages/DeliveryAgent/AgentLogin.jsx";
import AgentRegister from "./pages/DeliveryAgent/AgentRegister.jsx";

import AgentDashboard from "./pages/DeliveryAgent/AgentDashboard/AgentDashboard.jsx";
import AgentOrders from "./pages/DeliveryAgent/AgentDashboard/AgentOrders.jsx";
import AgentProfile from "./pages/DeliveryAgent/AgentDashboard/AgentProfile.jsx";
import AdminReviews from "./pages/Admin/AdminDashboard/AdminReviews.jsx";

import Home from "./pages/Home/Home.jsx";

export default function App() {
  useEffect(() => {
    initForegroundPush();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Home Route */}
        <Route path="/" element={<Home />} />

        {/* Customer Routes */}
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegister />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route
          path="/customer/profile/edit"
          element={<CustomerProfileEdit />}
        />
        <Route path="/customer/address" element={<CustomerAddressList />} />
        <Route path="/customer/address/add" element={<CustomerAddAddress />} />
        <Route
          path="/customer/address/edit/:id"
          element={<CustomerEditAddress />}
        />

        <Route
          path="/customer/restaurant/:id"
          element={<RestaurantDetails />}
        />
        <Route path="/customer/cart" element={<CustomerCart />} />
        <Route path="/customer/checkout" element={<CustomerCheckout />} />
        <Route path="/customer/payment" element={<CustomerPayment />} />
        <Route path="/customer/orders" element={<CustomerOrders />} />
        <Route
          path="/customer/orders/:orderId"
          element={<CustomerOrderDetails />}
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />}>
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="customers" element={<Customers />} />
          <Route path="agents" element={<AdminAgents />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews/:restaurantId" element={<AdminReviews />} />
        </Route>

        {/* Restaurant Routes */}
        <Route path="/restaurant/login" element={<RestaurantLogin />} />
        <Route path="/restaurant/register" element={<RestaurantRegister />} />

        <Route path="/restaurant/dashboard" element={<RestaurantDashboard />}>
          <Route path="menu" element={<MenuManagement />} />
          <Route path="menu/add" element={<AddMenuItem />} />
          <Route path="menu/edit/:id" element={<EditMenuItem />} />
          <Route path="orders" element={<Orders />} />
          <Route path="assign-agent/:orderId" element={<AssignAgent />} />
          <Route path="profile" element={<RestaurantProfile />} />
          <Route path="agents" element={<RestaurantAgents />} />
          <Route path="reviews" element={<RestaurantReviews />} />
        </Route>

        {/* Agent Routes */}
        <Route path="/agent/login" element={<AgentLogin />} />
        <Route path="/agent/register" element={<AgentRegister />} />

        <Route path="/agent/dashboard" element={<AgentDashboard />}>
          {/* Nested Routes for Agent Dashboard */}
          <Route path="orders" element={<AgentOrders />} />
          <Route path="profile" element={<AgentProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
