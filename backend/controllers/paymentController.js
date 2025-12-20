import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/paymentModel.js';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

//create payment order
export const createPaymentOrder = async (req, res) => {
    try {
    const { amount } = req.body;
    
    const options = { 
        amount: amount * 100, 
        currency: "INR",
        receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.json({
        id : order.id,
        currency : order.currency,
        amount : order.amount
    });
   } catch (error) {
    res.status(500).json({ message: 'Error creating payment order', error: error.message });
   }
};

//verify payment
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // 1. Generate the expected signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        // 2. Compare signatures
        if (expectedSignature === razorpay_signature) {
            // 3. Save to database (This is likely where it's crashing)
            await Payment.create({
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                status: "captured",
            });

            return res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Verify Error:", error); // LOOK AT YOUR BACKEND TERMINAL FOR THIS LOG
        res.status(500).json({ message: "Error verifying payment", error: error.message });
    }
};

//cod payment
export const codPayment = async (req, res) => {
    try {
        const { customerId, amount } = req.body;

        const payment = await Payment.create({
            customerId,
            amount,
            status: 'pending',
        });

        res.json({
            message: 'COD selected, proceed to create order',
            paymentId: payment._id,
            status: payment.status
        });
    }
    catch (error) {
        res.status(500).json({ message: 'COD initiation failed', error });
    }
};