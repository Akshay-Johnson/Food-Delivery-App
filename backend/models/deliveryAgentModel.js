import mongoose from 'mongoose';

const deliveryAgentschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'available' // Available, On Delivery, Unavailable
    },
    location: {
        lat: {
            type: Number,
            default: null
        },
        lng: {
            type: Number,
            default: null
        }
    },
    fcmToken: {
        type: String,
    }

}, { timestamps: true });

const DeliveryAgent = mongoose.model('DeliveryAgent', deliveryAgentschema);

export default DeliveryAgent;