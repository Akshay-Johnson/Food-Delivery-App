import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    totalPrice: {
      type: Number, // items total
      required: true,
    },

    deliveryCharge: {
      type: Number,
      default: 0,
    },

    agentEarning: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    paymentId: {
      type: String,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "preparing",
        "ready",
        "picked",
        "delivered",
      ],
      default: "pending",
    },

    deliveryAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAgent",
      default: null,
    },

    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },  
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
