import mongoose from "mongoose";    

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true, 
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone : {
        type: String,
        required: true,
    },
    address : {
        type: String,
        required: true,
    },
    image : {
        type: String,
    },
    status: {
        type: String,
        default: 'approved',
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


}, {
    timestamps: true,
});

export default mongoose.model('Restaurant', restaurantSchema);