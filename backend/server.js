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

/* ================= DEBUG LOGGER ================= */
app.use((req, res, next) => {
  console.log(
    `[REQ] ${req.method} ${req.originalUrl} | Origin: ${req.headers.origin}`
  );
  next();
});

/* ================= CORS ================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://dinex-frontend.vercel.app",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (
    origin &&
    (allowedOrigins.includes(origin) ||
      (origin.endsWith(".vercel.app") && origin.includes("dinex-frontend")))
  ) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    return res.sendStatus(204);
  }

  next();
});

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

/* ================= BODY PARSERS ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ================= ROUTES ================= */
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

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.send("Food Delivery App Backend is running");
});

/* ================= START ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("=================================");
  console.log("🚀 Server started successfully");
  console.log(`🌐 Listening on port: ${PORT}`);
  console.log("=================================");
});
