import { useState, useEffect } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import AddressForm from "./AddressForm";
import Toast from "../../../components/toast/toast";

export default function CustomerEditAddress() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadAddress();
  }, []);

  const loadAddress = async () => {
    try {
      const res = await api.get("/api/address");
      const address = res.data.find((a) => a._id === id);

      if (!address) {
        setToast({ message: "Address not found", type: "error" });
        navigate("/customer/address");
        return;
      }

      setForm(address);
    } catch (err) {
      setToast({ message: "Failed to load address", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/api/address/update/${id}`, form);

      setToast({ message: "Address updated successfully", type: "success" });
      navigate("/customer/address");
    } catch (err) {
      const errors = err.response?.data?.errors;

      if (errors && errors.length > 0) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!form) return null;

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
        title="Edit Address"
        form={form}
        setForm={setForm}
        onSubmit={submit}
        onBack={() => navigate(-1)}
        submitText="Update Address"
      />
    </>
  );
}
