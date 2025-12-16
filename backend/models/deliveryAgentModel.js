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
    password: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
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
    },
  },
  { timestamps: true }
);

const DeliveryAgent = mongoose.model("DeliveryAgent", deliveryAgentschema);

export default DeliveryAgent;
