import { useState } from "react"
import AuthLayout from "../../layouts/AuthLayout"
import RoleSwitcher from "../../components/RoleSwitcher"
import AuthInput from "../../components/AuthInput"
import api from "../../api/axiosInstance"
import { Link, useNavigate } from "react-router-dom"

export default function AgentRegister() {
    const [form , setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
    });

    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();

        try {
            await api.post('/api/agents/register', form); 
            alert("Agent Registered Successfully");
            navigate("/agent/login"); 
        } catch (error) {
            console.error("Registration Failed:", error);
            alert(error.response?.data?.message || "Registration Failed");
        }
    };

    return (
        <AuthLayout title="Delivery Agent Register">
            <form onSubmit={submit}>

                <AuthInput
                    label="Name"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <AuthInput
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <AuthInput
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />

                <AuthInput
                    label="Phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
            


                <div className="flex gap-3 mt-4">
                    <button className="w-1/2 bg-blue-600 text-white py-2 rounded-md">
                        Register
                    </button>

                    <Link
                        to="/agent/login"
                        className="w-1/2 text-center bg-blue-600 text-white py-2 rounded-md"
                    >
                        Back to Login ?
                    </Link>
                </div>

            </form>

            <RoleSwitcher />
        </AuthLayout>
    );
}
