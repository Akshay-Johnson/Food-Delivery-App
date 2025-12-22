import Cart from "../models/cartModel.js";
import mongoose from "mongoose";

//calculate total price
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

//add item to cart
export const addToCart = async (req, res) => {
  try {
    console.log("==== ADD TO CART ====");
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    const customerId = req.user?.id;
    const { itemId, name, price, quantity = 1, restaurantId } = req.body;

    /* ================== HARD VALIDATION ================== */

    if (!customerId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (!itemId) {
      return res.status(400).json({ message: "itemId missing" });
    }

    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        message: "Invalid itemId",
        itemId,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        message: "Invalid restaurantId",
        restaurantId,
      });
    }

    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    let cart = await Cart.findOne({ customerId });

    if (!cart) {
      cart = await Cart.create({
        customerId,
        restaurantId,
        items: [
          {
            itemId,
            name,
            price: parsedPrice,
            quantity: parsedQuantity,
          },
        ],
        totalPrice: parsedPrice * parsedQuantity,
      });

      return res.status(201).json(cart);
    }

    if (cart.restaurantId.toString() !== restaurantId) {
      return res.status(400).json({
        message: "You can only order items from one restaurant at a time",
        cartRestaurantId: cart.restaurantId,
        incomingRestaurantId: restaurantId,
      });
    }

    const existingItem = cart.items.find((i) => i.itemId.toString() === itemId);

    if (existingItem) {
      existingItem.quantity += parsedQuantity;
    } else {
      cart.items.push({
        itemId,
        name,
        price: parsedPrice,
        quantity: parsedQuantity,
      });
    }

    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    return res.status(200).json(cart);
  } catch (error) {
    console.error("🔥 ADD TO CART CRASH:", error);

    return res.status(500).json({
      message: "Error adding to cart",
      error: error.message,
    });
  }
};

//update item quantity
export const updateCartItem = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { quantity } = req.body;
    const { itemId } = req.params;

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((i) => i.itemId.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;

    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart item", error: error.message });
  }
};

//remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { itemId } = req.params;

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((i) => i.itemId.toString() !== itemId);

    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    res.json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing cart item", error: error.message });
  }
};

//get cart by customer ID
export const getCart = async (req, res) => {
  try {
    const customerId = req.user.id;
    const cart = await Cart.findOne({ customerId });
    console.log("customer in request:", req.customer);

    if (!cart) {
      return res.status(404).json({ items: [], totalPrice: 0 });
    }
    res.json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
};

//clear cart
export const clearCart = async (req, res) => {
  try {
    const customerId = req.user.id;
    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};
