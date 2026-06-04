import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
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
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "blocked"],
      default: "pending", 
    },

    categories: {
      type: [String],
      default: [],
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    description: {
      type: String,
    },
    cuisineType: {
      type: String,
    },
    openingTime: {
      type: String,
    },
    closingTime: {
      type: String,
    },
    location: {
      lat: { type: Number, default: 9.9312 },
      lng: { type: Number, default: 76.2673 },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Restaurant", restaurantSchema);
