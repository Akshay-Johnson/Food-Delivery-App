
import { BrowserRouter, Routes } from 'react-router-dom'

import CustomerLogin from './pages/Customer/CustomerLogin.jsx'
import CustomerRegister from './pages/Customer/CustomerRegister.jsx'
import CustomerDashboard from './pages/Customer/CustomerDashboard.jsx'

import AdminLogin from './pages/Admin/AdminLogin.jsx'
import AdminRegister from './pages/Admin/AdminRegister.jsx'

import RestaurantLogin from './pages/Restaurant/RestaurantLogin.jsx'
import RestaurantRegister from './pages/Restaurant/RestaurantRegister.jsx'

import AgentLogin from './pages/DeliveryAgent/AgentLogin.jsx'
import AgentRegister from './pages/DeliveryAgent/AgentRegister.jsx'

import { Route } from 'react-router-dom'
import Home from './pages/Home/Home.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Customer Routes */ }
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegister />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />

        {/* Admin Routes */ }
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Restaurant Routes */ }
        <Route path="/restaurant/login" element={<RestaurantLogin />} />
        <Route path="/restaurant/register" element={<RestaurantRegister />} />

        {/* Agent Routes */ }
        <Route path="/agent/login" element={<AgentLogin />} />
        <Route path="/agent/register" element={<AgentRegister />} />

        {/* Default Route */ }
        <Route path="*" element={<CustomerLogin />} />

        {/* Home Route */ }
        <Route path="/" element={<Home />} />

      </Routes>
    </BrowserRouter>
  )
}