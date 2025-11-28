import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true
        },

        rating: {
            type: Number,
            min:1,
            max:5,
            required: true
        },
        comment: {
            type: String,
            default: ''
        },
        indexes: [
            { customerId: 1, restaurantId: 1 },
            { unique: true }
        ]

    },
    { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
