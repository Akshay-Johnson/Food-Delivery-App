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

    isActive: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      default: "available",
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
