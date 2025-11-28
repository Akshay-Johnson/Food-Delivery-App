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
        default: 'active',
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

}, {
    timestamps: true,
});

export default mongoose.model('Restaurant', restaurantSchema);