
import { BrowserRouter, Routes , Route } from 'react-router-dom'

import CustomerLogin from './pages/Customer/CustomerLogin.jsx'
import CustomerRegister from './pages/Customer/CustomerRegister.jsx'
import CustomerDashboard from './pages/Customer/CustomerDashboard/CustomerDashboard.jsx'
import CustomerProfile from './pages/Customer/CustomerProfile.jsx'
import CustomerProfileEdit from './pages/Customer/CustomerProfileEdit.jsx'
import CustomerAddressList from './pages/Customer/CusomerAddress/CustomerAddressList.jsx'
import CustomerAddAddress from './pages/Customer/CusomerAddress/CustomerAddAddress.jsx'
import CustomerEditAddress from './pages/Customer/CusomerAddress/CustomerEditAddress.jsx'

import AdminLogin from './pages/Admin/AdminLogin.jsx'
import AdminRegister from './pages/Admin/AdminRegister.jsx'

import RestaurantLogin from './pages/Restaurant/RestaurantLogin.jsx'
import RestaurantRegister from './pages/Restaurant/RestaurantRegister.jsx'
import RestaurantDetails from './pages/Customer/RestaurantDetails/RestaurantDetails.jsx'

import CustomerCart from './pages/Customer/CustomerCart/CustomerCart.jsx'
import CustomerCheckout from './pages/Customer/CustomerCart/CustomerCheckout.jsx'

import AgentLogin from './pages/DeliveryAgent/AgentLogin.jsx'
import AgentRegister from './pages/DeliveryAgent/AgentRegister.jsx'

import Home from './pages/Home/Home.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home Route */ }
        <Route path="/" element={<Home />} />

        {/* Customer Routes */ }
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegister />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/customer/profile/edit" element={<CustomerProfileEdit />} />
        <Route path="/customer/address" element={<CustomerAddressList />} />
        <Route path="/customer/address/add" element={<CustomerAddAddress />} />
        <Route path="/customer/address/edit/:id" element={<CustomerEditAddress />} />

        <Route path="/customer/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="/customer/cart" element={<CustomerCart />} />
        <Route path="/customer/checkout" element={<CustomerCheckout />} />




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



      </Routes>
    </BrowserRouter>
  )
}