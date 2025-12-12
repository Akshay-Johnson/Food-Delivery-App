import Restaurant from "../models/restaurantModel.js";
import Menu from "../models/menuModel.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register a new restaurant
export const registerRestaurant = async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  try {
    const exists = await Restaurant.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Restaurant already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const restaurant = await Restaurant.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
    });

    const token = generateToken(restaurant._id);

    res.status(201).json({
      message: "Restaurant registered successfully",
      token,
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login restaurant
export const loginRestaurant = async (req, res) => {
  const { email, password } = req.body;
  try {
    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, restaurant.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (restaurant.status === "blocked") {
      return res
        .status(403)
        .json({ message: "Restaurant is blocked by Admin" });
    }

    const token = generateToken(restaurant._id);

    res.status(200).json({
      message: "Login successful",
      token,
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ message: "error logging in" });
  }
};

// Get restaurant profile
export const getRestaurantProfile = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id).select(
      "-password"
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update restaurant profile
export const updateRestaurantProfile = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.name = req.body.name || restaurant.name;
    restaurant.phone = req.body.phone || restaurant.phone;
    restaurant.address = req.body.address || restaurant.address;
    restaurant.password = req.body.password
      ? await bcrypt.hash(req.body.password, 10)
      : restaurant.password;
    restaurant.image = req.body.image || restaurant.image;
    restaurant.description = req.body.description || restaurant.description;
    restaurant.cuisineType = req.body.cuisineType || restaurant.cuisineType;
    restaurant.openingTime = req.body.openingTime || restaurant.openingTime;
    restaurant.closingTime = req.body.closingTime || restaurant.closingTime;

    await restaurant.save();

    res.json({
      message: "Profile updated successfully",
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ message: "error updating profile" });
  }
};

//Public - Get all restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const { category, search, minRating } = req.query;

    const filter = {};

    if (category) {
      filter.categories = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (minRating) {
      filter.averageRating = { $gte: Number(minRating) };
    }

    const restaurants = await Restaurant.find(filter).select("-password");
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "error fetching restaurants", error });
  }
};

//Public - Get restaurant by ID
export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).select(
      "-password"
    );
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    //fetch menu items for the restaurant
    const menuItems = await Menu.find({ restaurant: restaurant._id });

    res.status(200).json({
      restaurant,
      menuItems,
    });
  } catch (error) {
    res.status(500).json({ message: "error fetching restaurant", error });
  }
};

//add categories to restaurant
export const addCategory = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    if (!restaurant.categories.includes(category)) {
      restaurant.categories.push(category);
      await restaurant.save();
    }

    res.json({
      message: "Category added successfully",
      categories: restaurant.categories,
    });
  } catch (error) {
    res.status(500).json({ message: "error adding category", error });
  }
};

//remove category from restaurant
export const removeCategory = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    restaurant.categories = restaurant.categories.filter((c) => c !== category);

    await restaurant.save();

    res.json({
      message: "Category removed successfully",
      categories: restaurant.categories,
    });
  } catch (error) {
    res.status(500).json({ message: "error removing category", error });
  }
};

//get categories of restaurant
export const getCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id).select("categories");

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json({
      categories: restaurant.categories,
    });
  } catch (error) {
    res.status(500).json({ message: "error fetching categories", error });
  }
};

//Public - Search restaurants
export const searchRestaurants = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchText = query.trim();

    const restaurants = await Restaurant.find({
      $or: [
        { name: { $regex: searchText, $options: "i" } },
        { categories: { $regex: searchText, $options: "i" } },
      ],
    }).select("-password");

    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "error searching restaurants", error });
  }
};

//get restaurant details
export const getRestaurantDetails = async (req, res) => {
  try {
    const restaurantId = req.params.id;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    //fetch menu items for the restaurant
    const dishes = await Menu.find({ restaurantId });

    res.json({
      restaurant,
      dishes,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "error fetching restaurant details", error });
  }
};
