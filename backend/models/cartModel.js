import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: null,
    },

    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: String,
        quantity: { type: Number, default: 1 },
        price: Number,
      },
    ],
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", CartSchema);

export default Cart;
