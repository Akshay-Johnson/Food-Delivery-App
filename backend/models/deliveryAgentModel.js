import mongoose from "mongoose";

const deliveryAgentschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      default: "",
    },
    vehicleNumber: {
      type: String,
      default: "",
    },

    approvalStatus: {
      type: String,
      enum: ["approved", "blocked"],
      default: "approved",
    },

    status: {
      type: String,
      enum: ["available", "on-delivery"],
      default: "available",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    location: {
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },
    fcmToken: {
      type: String,
      default: "null",
    },
  },
  { timestamps: true }
);

const DeliveryAgent = mongoose.model("DeliveryAgent", deliveryAgentschema);

export default DeliveryAgent;
