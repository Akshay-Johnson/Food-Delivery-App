import Menu from "../models/menuModel.js";
import Order from "../models/orderModel.js";
import mongoose from "mongoose";

//add menu item
export const addMenuItem = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { name, description, price, category, image } = req.body;

    const item = await Menu.create({
      restaurantId,
      name,
      description,
      price,
      category,
      image,
    });

    res.status(201).json({
      message: "Menu item added successfully",
      item,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding menu item", error: error.message });
  }
};

//update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;

    let item = await Menu.findOne({ _id: id, restaurantId });
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    item.name = req.body.name || item.name;
    item.description = req.body.description || item.description;
    item.price = req.body.price || item.price;
    item.category = req.body.category || item.category;
    item.image = req.body.image || item.image;

    await item.save();

    res.status(200).json({
      message: "Menu item updated successfully",
      item,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating menu item", error: error.message });
  }
};

//delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;

    const item = await Menu.findOneAndDelete({ _id: id, restaurantId });

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting menu item", error: error.message });
  }
};

//get menu items for a restaurant
export const getMyMenu = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const menu = await Menu.find({ restaurantId });

    res.json(menu);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching menu items", error: error.message });
  }
};

//PUBLIC: get menu items of any restaurant
export const getMenuByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const menu = await Menu.find({
      restaurantId,
      isAvailable: true,
    });

    res.json(menu);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching menu items", error: error.message });
  }
};

//PUBLIC : get single menu item
export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Menu.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(item);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching menu item", error: error.message });
  }
};

//PUBLIC : get recommended dishes
export const getRecommendedDishes = async (req, res) => {
  try {
    const dishes = await Menu.find().limit(10);
    res.json(dishes);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching recommended dishes",
      error: error.message,
    });
  }
};

//update availability
export const updateAvailability = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { isAvailable } = req.body;

    const item = await Menu.findOne({
      _id: req.params.id,
      restaurantId,
    });

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    item.isAvailable = isAvailable;
    await item.save();

    res.json({
      message: "Availability updated",
      isAvailable: item.isAvailable,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUBLIC : get trending dishes (PER RESTAURANT)
export const getTrendingDishes = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }

    const restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);

    const trending = await Order.aggregate([
      // ✅ 1. FILTER BY RESTAURANT (FIX)
      {
        $match: {
          restaurantId: restaurantObjectId,
        },
      },

      // 2. Break order items
      { $unwind: "$items" },

      // 3. Group by menu item
      {
        $group: {
          _id: "$items.itemId",
          orderCount: { $sum: "$items.quantity" },
        },
      },

      // 4. Sort by popularity
      { $sort: { orderCount: -1 } },

      // 5. Limit
      { $limit: 12 },

      // 6. Join Menu
      {
        $lookup: {
          from: "menus",
          localField: "_id",
          foreignField: "_id",
          as: "dish",
        },
      },

      // 7. Flatten
      { $unwind: "$dish" },

      // 8. Only available dishes
      {
        $match: {
          "dish.isAvailable": true,
        },
      },

      // 9. Merge orderCount into dish
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$dish", { orderCount: "$orderCount" }],
          },
        },
      },
    ]);

    res.json(trending);
  } catch (error) {
    console.error("Trending dishes error:", error);
    res.status(500).json({ message: "Failed to fetch trending dishes" });
  }
};

// PUBLIC : GLOBAL trending dishes (Customer Dashboard)
export const getGlobalTrendingDishes = async (req, res) => {
  try {
    const trending = await Order.aggregate([
      {
        $match: {
          status: {
            $in: ["accepted", "preparing", "ready", "picked", "delivered"],
          },
        },
      },

      { $unwind: "$items" },

      {
        $group: {
          _id: "$items.itemId",
          orderCount: { $sum: "$items.quantity" },
        },
      },

      { $sort: { orderCount: -1 } },
      { $limit: 16 },

      {
        $lookup: {
          from: "menus",
          localField: "_id",
          foreignField: "_id",
          as: "dish",
        },
      },

      { $unwind: "$dish" },

      {
        $match: {
          "dish.isAvailable": true,
        },
      },

      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$dish", { orderCount: "$orderCount" }],
          },
        },
      },
    ]);

    res.json(trending);
  } catch (error) {
    console.error("Global trending error:", error);
    res.status(500).json({ message: "Failed to fetch trending dishes" });
  }
};

// PUBLIC: get ALL dishes (no limit)
export const getAllDishes = async (req, res) => {
  try {
    const dishes = await Menu.find({ isAvailable: true });
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch all dishes" });
  }
};
