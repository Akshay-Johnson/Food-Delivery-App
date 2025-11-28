import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    addressLine1: {
        type: String,
        required: true,
    },
    addressLine2: {
        type: String,
        required: false,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true, 
    },
    landmark: {
        type: String,
        required: false,
    },
    type: {
        type: String,
        enum: ['Home', 'Work', 'Other','home', 'work', 'other'],
        default: 'Home',
    },
}, { timestamps: true });

const Address = mongoose.model('Address', addressSchema);

export default Address;