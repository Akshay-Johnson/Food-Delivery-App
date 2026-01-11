import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/paymentModel.js";
import dotenv from "dotenv";

dotenv.config();

/* ================= INIT RAZORPAY ================= */
console.log("🔑 Razorpay Key ID exists:", !!process.env.RAZORPAY_KEY_ID);
console.log("🔐 Razorpay Secret exists:", !!process.env.RAZORPAY_KEY_SECRET);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= CREATE PAYMENT ORDER ================= */
export const createPaymentOrder = async (req, res) => {
  console.log("➡️  [PAYMENT] createPaymentOrder called");
  console.log("📦 Request body:", req.body);

  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      console.error("❌ Invalid amount:", amount);
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    console.log("🧾 Razorpay order options:", options);

    const order = await razorpay.orders.create(options);

    console.log("✅ Razorpay order created:", order.id);

    return res.status(200).json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID, // public key for frontend
    });
  } catch (error) {
    console.error("🔥 CREATE ORDER FAILED");
    console.error("Message:", error.message);
    console.error("Full error:", error);

    return res.status(500).json({
      message: "Error creating payment order",
      error: error.message,
    });
  }
};

/* ================= VERIFY PAYMENT ================= */
export const verifyPayment = async (req, res) => {
  console.log("➡️  [PAYMENT] verifyPayment called");
  console.log("📦 Request body:", req.body);

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("❌ Missing payment fields");
      return res.status(400).json({ message: "Missing payment fields" });
    }

    console.log("🔍 Verifying signature...");
    console.log("Order ID:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Signature mismatch");
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    console.log("✅ Signature verified");

    /* SAVE PAYMENT (NON-BLOCKING) */
    try {
      const paymentDoc = await Payment.create({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "captured",
        method: "ONLINE",
      });

      console.log("💾 Payment saved:", paymentDoc._id);
    } catch (dbErr) {
      console.error("⚠️ Payment save failed (non-fatal):", dbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("🔥 VERIFY PAYMENT FAILED");
    console.error("Message:", error.message);
    console.error("Full error:", error);

    return res.status(500).json({
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

/* ================= COD PAYMENT ================= */
export const codPayment = async (req, res) => {
  console.log("➡️  [PAYMENT] codPayment called");
  console.log("📦 Request body:", req.body);

  try {
    const { customerId, amount } = req.body;

    if (!customerId || !amount) {
      console.error("❌ Missing fields:", { customerId, amount });
      return res.status(400).json({ message: "Missing fields" });
    }

    const payment = await Payment.create({
      customerId,
      amount,
      status: "pending",
      method: "COD",
    });

    console.log("💾 COD payment created:", payment._id);

    return res.json({
      message: "COD selected, proceed to create order",
      paymentId: payment._id,
      status: payment.status,
    });
  } catch (error) {
    console.error("🔥 COD PAYMENT FAILED");
    console.error("Message:", error.message);
    console.error("Full error:", error);

    return res.status(500).json({
      message: "COD initiation failed",
      error: error.message,
    });
  }
};
