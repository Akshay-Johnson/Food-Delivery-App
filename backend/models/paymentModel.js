import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    orderId: String,
    paymentId: String,
    signature: String,
    amount: Number,
    currency: String,
    status: {
        type: String,
        default: 'pending', // pending, completed, failed
        enum : ['created', 'authorized', 'captured', 'failed']
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }
}, { timestamps: true });
    
export default mongoose.model('Payment', paymentSchema);
        