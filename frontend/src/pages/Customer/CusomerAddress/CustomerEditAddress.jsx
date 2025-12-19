import { useState, useEffect } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import AddressForm from "./AddressForm";

export default function CustomerEditAddress() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    loadAddress();
  }, []);

  const loadAddress = async () => {
    const res = await api.get("/api/address");
    const address = res.data.find((a) => a._id === id);
    setForm(address);
  };

  if (!form) return null;

  const submit = async (e) => {
    e.preventDefault();
    await api.put(`/api/address/update/${id}`, form);
    navigate("/customer/address");
  };

  return (
    <AddressForm
      title="Edit Address"
      form={form}
      setForm={setForm}
      onSubmit={submit}
      onBack={() => navigate(-1)}
      submitText="Update Address"
    />
  );
}
