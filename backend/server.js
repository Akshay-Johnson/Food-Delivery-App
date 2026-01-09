import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import cors from "cors";

import customerRoutes from "./routes/customerRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import restaurantOrderRoutes from "./routes/restaurantOrderRoutes.js";
import deliveryAgentRoutes from "./routes/deliveryAgentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

connectDB();

const app = express();

/* ======================================================
   🔍 GLOBAL REQUEST DEBUG
====================================================== */
app.use((req, res, next) => {
  console.log(
    `[REQ] ${req.method} ${req.originalUrl} | Origin: ${req.headers.origin || "N/A"}`
  );
  next();
});

/* ======================================================
   🌐 CORS CONFIG (FINAL + DEBUG)
====================================================== */

const allowedOrigins = [
  "http://localhost:5173",
  "https://dinex-app.netlify.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow tools like Postman / server-to-server
    if (!origin) {
      console.log("[CORS] No origin → allowed");
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log("[CORS] Allowed origin:", origin);
      return callback(null, true);
    }

    console.log("[CORS] ❌ Blocked origin:", origin);
    return callback(new Error("Blocked by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/* ---- Apply CORS FIRST ---- */
app.use(cors(corsOptions));

/* ---- Handle preflight properly ---- */
app.options("*", cors(corsOptions));

/* ======================================================
   📦 BODY PARSERS
====================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ======================================================
   🛣 ROUTES
====================================================== */
app.use("/api/customers", customerRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/address", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/restaurants", restaurantOrderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/agents", deliveryAgentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);

/* ======================================================
   ❤️ HEALTH
====================================================== */
app.get("/", (req, res) => {
  res.send("Food Delivery App Backend is running");
});

/* ======================================================
   🚀 START
====================================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("=================================");
  console.log("🚀 Server started successfully");
  console.log(`🌐 Listening on port: ${PORT}`);
  console.log("=================================");
});
