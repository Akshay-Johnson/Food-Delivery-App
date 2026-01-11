import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/paymentModel.js";
import dotenv from "dotenv";

dotenv.config();

/* ================= INIT RAZORPAY ================= */
console.log("🔑 Razorpay Key Loaded:", !!process.env.RAZORPAY_KEY_ID);
console.log("🔑 Razorpay Secret Loaded:", !!process.env.RAZORPAY_KEY_SECRET);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= CREATE PAYMENT ORDER ================= */
export const createPaymentOrder = async (req, res) => {
  try {
    console.log("📥 Create Order Request Body:", req.body);

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      console.warn("⚠️ Invalid amount received:", amount);
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    console.log("🛠 Creating Razorpay order with:", options);

    const order = await razorpay.orders.create(options);

    console.log("✅ Razorpay order created:", {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });

    return res.status(200).json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    return res.status(500).json({
      message: "Error creating payment order",
      error: error.message,
    });
  }
};

/* ================= VERIFY PAYMENT ================= */
export const verifyPayment = async (req, res) => {
  try {
    console.log("📥 Verify Payment Body:", req.body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.warn("⚠️ Missing payment fields:", req.body);
      return res.status(400).json({ message: "Missing payment fields" });
    }

    /* ---- Generate expected signature ---- */
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    console.log("🔐 Expected Signature:", expectedSignature);
    console.log("🔐 Received Signature:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Signature mismatch");
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    console.log("✅ Signature verified");

    /* ---- SAVE PAYMENT (safe) ---- */
    const paymentData = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "captured",
    };

    try {
      console.log("💾 Saving payment:", paymentData);
      await Payment.create(paymentData);
      console.log("✅ Payment saved successfully");
    } catch (dbErr) {
      console.error("❌ Payment save failed:", dbErr.message);
      // Do NOT fail verification because DB save failed
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("❌ Verify Error:", error);
    return res.status(500).json({
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

/* ================= COD PAYMENT ================= */
export const codPayment = async (req, res) => {
  try {
    console.log("📥 COD Payment Body:", req.body);

    const { customerId, amount } = req.body;

    if (!customerId || !amount) {
      console.warn("⚠️ Missing COD fields:", { customerId, amount });
      return res.status(400).json({ message: "Missing fields" });
    }

    const paymentData = {
      customerId,
      amount,
      status: "pending",
      method: "COD",
    };

    console.log("💾 Creating COD payment:", paymentData);

    const payment = await Payment.create(paymentData);

    console.log("✅ COD payment created:", payment._id);

    return res.json({
      message: "COD selected, proceed to create order",
      paymentId: payment._id,
      status: payment.status,
    });
  } catch (error) {
    console.error("❌ COD initiation failed:", error);
    return res.status(500).json({
      message: "COD initiation failed",
      error: error.message,
    });
  }
};
