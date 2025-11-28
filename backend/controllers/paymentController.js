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
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");
        
        if (expectedSign === razorpay_signature) {

            await Payment.create({
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                status: 'success',
            });

            return res.json({ message: 'Payment verified successfully' });
        }

        res.status(400).json({ message: 'Invalid signature ' });

    } catch (error) {
        res.status(500).json({ message: 'payment verification failed', error });
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