import { useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import AddressForm from "./AddressForm";

export default function CustomerAddAddress() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    type: "Home",
  });

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/api/address/add", form);
    navigate("/customer/address");
  };

  return (
    <AddressForm
      title="Add Address"
      form={form}
      setForm={setForm}
      onSubmit={submit}
      onBack={() => navigate(-1)}
      submitText="Save Address"
    />
  );
}
