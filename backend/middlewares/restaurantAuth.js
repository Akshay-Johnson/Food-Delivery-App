import jwt from "jsonwebtoken";
import Restaurant from "../models/restaurantModel.js";

export const restaurantAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id, role: "restaurant" };

    //fetch restaurant
    const restaurant = await Restaurant.findById(decoded.id);
    if (!restaurant) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (restaurant.status === "blocked") {
      return res
        .status(403)
        .json({ message: "Restaurant is blocked by Admin" });
    }

    req.restaurant = restaurant;

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default restaurantAuth;
