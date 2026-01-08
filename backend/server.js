import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

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

// Connect to the database
connectDB();

const app = express();

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://dinex-frontend.vercel.app"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

//middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://dinex-frontend.vercel.app"],
  })
);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes

//customer routes
app.use("/api/customers", customerRoutes);

//upload routes
app.use("/api/upload", uploadRoutes);

//serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

//address routes
app.use("/api/address", addressRoutes);

//cart routes
app.use("/api/cart", cartRoutes);

//restaurant routes
app.use("/api/restaurants", restaurantRoutes);

//restaurant order routes
app.use("/api/restaurants", restaurantOrderRoutes);

//menu routes
app.use("/api/menu", menuRoutes);

//order routes
app.use("/api/orders", orderRoutes);

//delivery agent routes
app.use("/api/agents", deliveryAgentRoutes);

//payment routes
app.use("/api/payments", paymentRoutes);

//admin routes
app.use("/api/admins", adminRoutes);

//uploads
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));

//search routes
app.use("/api/search", searchRoutes);

//post review customer
app.use("/api/reviews", reviewRoutes);

//contact routes
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("Food Delivery App Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
