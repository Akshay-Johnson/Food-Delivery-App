import Restaurant from "../models/restaurantModel.js";
import Menu from "../models/menuModel.js";

// search all
export const searchAll = async (req, res) => {
  try {
    const query = req.query.q || "";

    if (!query.trim()) {
      return res.json({ restaurants: [], dishes: [] });
    }

    const regex = new RegExp(query, "i");

    const restaurants = await Restaurant.find({
      name: { $regex: regex },
    });

    const dishes = await Menu.find({
      name: { $regex: regex },
      isAvailable: true, // 👈 ADD THIS
    });

    res.json({ restaurants, dishes });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

