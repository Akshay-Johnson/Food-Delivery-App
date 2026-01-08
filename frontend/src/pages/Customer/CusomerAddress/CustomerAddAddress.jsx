import { useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import AddressForm from "./AddressForm";
import Toast from "../../../components/toast/toast";

export default function CustomerAddAddress() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

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

    try {
      await api.post("/api/address/add", form);

      setToast({ message: "Address added successfully", type: "success" });
      navigate("/customer/address");
    } catch (err) {
      const errors = err.response?.data?.errors;

      if (errors && errors.length > 0) {
        // show validation errors clearly
        setToast({
          message: errors.join("\n"),
          type: "error",
        });
      } else {
        setToast({
          message: err.response?.data?.message || "Something went wrong",
          type: "error",
        });
      }
    }
  };

  return (
    <>
      {/* TOAST */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* FORM */}
      <AddressForm
        title="Add Address"
        form={form}
        setForm={setForm}
        onSubmit={submit}
        onBack={() => navigate(-1)}
        submitText="Save Address"
      />
    </>
  );
}
