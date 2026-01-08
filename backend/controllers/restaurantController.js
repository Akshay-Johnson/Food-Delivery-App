import Restaurant from "../models/restaurantModel.js";
import Menu from "../models/menuModel.js";
import { emailExistsAnywhere } from "../utils/checkEmailExists.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import EmailOtp from "../models/emailOtp.js";
import { generateOtp, sendEmailOtp } from "../utils/emailOtp.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// send email otp
export const sendRestaurantEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (await emailExistsAnywhere(email)) {
      return res.status(400).json({
        message: "Email already registered with another role",
      });
    }

    const otp = generateOtp();

    await EmailOtp.deleteMany({ email });

    await EmailOtp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmailOtp(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Register a new restaurant
export const registerRestaurant = async (req, res) => {
  const { name, email, password, phone, address, otp } = req.body;

  try {
    const otpRecord = await EmailOtp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (await emailExistsAnywhere(email)) {
      return res.status(400).json({
        message: "Email already registered with another role",
      });
    }

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
      isEmailVerified: true,
      status: "pending", // ✅ IMPORTANT
    });

    res.status(201).json({
      message:
        "Registration successful. Wait for admin approval.",
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        email: restaurant.email,
        status: restaurant.status,
      },
    });
  } catch (error) {
    console.error("Restaurant register error:", error);
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

    // 🚫 BLOCK LOGIN IF NOT APPROVED
    if (restaurant.status === "pending") {
      return res.status(403).json({
        message:
          "Your restaurant account is pending admin approval. Please wait.",
      });
    }

    if (restaurant.status === "blocked") {
      return res
        .status(403)
        .json({ message: "Restaurant is blocked by admin" });
    }

    const token = generateToken(restaurant._id);

    res.status(200).json({
      message: "Login successful",
      token,
      restaurant,
    });
  } catch (error) {
    console.error("Restaurant login error:", error);
    res.status(500).json({ message: "Error logging in" });
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

    const filter = { status: "approved" };

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
    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      status: "approved", // ✅ IMPORTANT
    }).select("-password");

    if (!restaurant) {
      return res
        .status(404)
        .json({ message: "Restaurant not found or not approved yet" });
    }

    // Fetch menu items for the restaurant
    const menuItems = await Menu.find({
      restaurant: restaurant._id,
    });

    res.status(200).json({
      restaurant,
      menuItems,
    });
  } catch (error) {
    console.error("Get restaurant by ID error:", error);
    res.status(500).json({ message: "Error fetching restaurant" });
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
      status: "approved", // ✅ IMPORTANT
      $or: [
        { name: { $regex: searchText, $options: "i" } },
        { categories: { $regex: searchText, $options: "i" } },
      ],
    }).select("-password");

    res.status(200).json(restaurants);
  } catch (error) {
    console.error("Search restaurants error:", error);
    res.status(500).json({
      message: "Error searching restaurants",
    });
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

//save FCM token
export const saveFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token required" });
    }

    // use restaurant from middleware
    req.restaurant.fcmToken = fcmToken;
    await req.restaurant.save();

    res.json({ message: "FCM token saved successfully" });
  } catch (error) {
    console.error("Save FCM token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//get restaurant reviews for owner
export const getRestaurantReviewsForOwner = async (req, res) => {
  const reviews = await Review.find({
    restaurantId: req.restaurant._id,
    isHidden: false,
  }).populate("customerId", "name");

  res.json(reviews);
};
