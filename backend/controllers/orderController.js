import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import Customer from "../models/customerModel.js";
import DeliveryAgent from "../models/deliveryAgentModel.js";
import {
  sendOrderPlacedEmail,
  sendOrderStatusUpdateEmail,
} from "../utils/email.js";
import { sendPushNotification } from "../utils/sendpush.js";

/////////////////////////////////////////// Customer Controllers ////////////////////////////

// create new order
export const createOrder = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { addressId, paymentMethod = "COD", paymentId } = req.body;

    const cart = await Cart.findOne({ customerId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const restaurantId = cart.restaurantId;

    // Prevent duplicate order spam
    const existingPendingOrder = await Order.findOne({
      customerId,
      restaurantId,
      status: "pending",
      createdAt: { $gt: new Date(Date.now() - 5000) },
    });

    if (existingPendingOrder) {
      return res.status(400).json({
        message: "Order already created recently. Please wait...",
        orderId: existingPendingOrder._id,
      });
    }

    /* =======================
       🔢 PRICE CALCULATION
    ======================= */
    const DELIVERY_CHARGE = 40;

    const itemsTotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalPayable = itemsTotal + DELIVERY_CHARGE;

    /* =======================
       📦 CREATE ORDER
    ======================= */
    const order = await Order.create({
      customerId,
      restaurantId,
      items: cart.items,

      totalPrice: itemsTotal, // items total only
      deliveryCharge: DELIVERY_CHARGE,
      agentEarning: DELIVERY_CHARGE, // agent revenue

      address: addressId,

      paymentMethod,
      paymentId: paymentMethod === "ONLINE" ? paymentId : null,
      paymentStatus: paymentMethod === "ONLINE" ? "paid" : "pending",

      status: "pending",
    });

    /* =======================
       🧹 CLEAR CART
    ======================= */
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    /* =======================
       📧 NOTIFICATIONS
    ======================= */
    const customer = await Customer.findById(customerId);

    await sendOrderPlacedEmail({
      to: customer.email,
      customerName: customer.name,
      orderId: order._id,
      totalAmount: totalPayable,
    });

    if (customer.fcmToken) {
      await sendPushNotification({
        token: customer.fcmToken,
        title: "Order Placed",
        body: `Your order has been placed. Total ₹${totalPayable}`,
        data: {
          orderId: order._id.toString(),
          status: "pending",
        },
      });
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: "Error creating order", error });
  }
};

//get orders for a customer
export const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // total count
    const totalOrders = await Order.countDocuments({ customerId });

    // paginated data
    const orders = await Order.find({ customerId })
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

//get single order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "restaurantId",
      "name"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error });
  }
};

//track order status
export const trackOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select(
      "status deliveryAgentId updatedAt"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Error tracking order status", error });
  }
};

////////////////////////////////////////// Restaurant Owner Controllers ////////////////////////////

//get all orders for restaurant (for restaurant owners)
export const getRestaurantOrders = async (req, res) => {
  try {
    const restaurantId = req.user.id;

    const orders = await Order.find({ restaurantId })
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching restaurant orders", error });
  }
};

// get single order for restaurant owner
export const getRestaurantOrderById = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      restaurantId,
    }).populate("deliveryAgentId", "name phone vehicleType vehicleNumber");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error });
  }
};

//accept order (for restaurant owners)
export const acceptOrder = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, restaurantId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "accepted";
    await order.save();

    //send order accepted email
    const customer = await Customer.findById(order.customerId);
    await sendOrderStatusUpdateEmail({
      to: customer.email,
      customerName: customer.name,
      orderId: order._id,
      status: order.status,
    });

    //send push notification
    if (customer.fcmToken) {
      await sendPushNotification({
        token: customer.fcmToken,
        title: "Order Accepted",
        body: `Your order ${order._id} has been accepted by the restaurant.`,
        data: {
          orderId: order._id.toString(),
          status: "accepted",
          restaurantId: restaurantId.toString(),
        },
      });
    }

    res.status(200).json({
      message: "Order accepted",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error accepting order",
      error,
    });
  }
};

//reject order (for restaurant owners)
export const rejectOrder = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, restaurantId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "rejected";
    await order.save();

    //send order accepted email
    const customer = await Customer.findById(order.customerId);

    await sendPushNotification({
      token: customer.fcmToken,
      title: "Order Rejected",
      body: `Your order ${order._id} has been rejected by the restaurant.`,
      data: {
        orderId: order._id.toString(),
        status: "rejected",
      },
    });

    await sendOrderStatusUpdateEmail({
      to: customer.email,
      customerName: customer.name,
      orderId: order._id,
      status: order.status,
    });

    res.status(200).json({ message: "Order rejected", order });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting order", error });
  }
};

//mark as preparing (for restaurant owners)
export const markPreparing = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, restaurantId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "preparing";
    await order.save();

    //send order accepted email
    const customer = await Customer.findById(order.customerId);

    //push notification
    await sendPushNotification({
      token: customer.fcmToken,
      title: "Order Preparing",
      body: `Your order ${order._id} is being prepared by the restaurant.`,
      data: {
        orderId: order._id.toString(),
        status: "preparing",
      },
    });

    await sendOrderStatusUpdateEmail({
      to: customer.email,
      customerName: customer.name,
      orderId: order._id,
      status: order.status,
    });

    res.status(200).json({ message: "Order is being prepared", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error });
  }
};

//mark as ready for pickup (for restaurant owners)
export const markReady = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, restaurantId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.status = "ready";
    await order.save();

    //send order accepted email
    const customer = await Customer.findById(order.customerId);

    //push notification
    await sendPushNotification({
      token: customer.fcmToken,
      title: "Order Ready for Pickup",
      body: `Your order ${order._id} is ready for pickup at the restaurant.`,
      data: {
        orderId: order._id.toString(),
        status: "ready",
      },
    });

    await sendOrderStatusUpdateEmail({
      to: customer.email,
      customerName: customer.name,
      orderId: order._id,
      status: order.status,
    });

    res.status(200).json({ message: "Order is ready for pickup", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error });
  }
};

//assign order to delivery agent (for restaurant owners)
export const assignOrderToAgent = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { agentId } = req.body;

    const restaurantId = req.user._id || req.user.id;

    console.log("ASSIGN AGENT");
    console.log("Restaurant:", restaurantId);
    console.log("Order:", orderId);
    console.log("Agent:", agentId);

    if (!agentId) {
      return res.status(400).json({ message: "agentId is required" });
    }

    const order = await Order.findOne({ _id: orderId, restaurantId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const agent = await DeliveryAgent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (agent.status !== "available") {
      return res.status(400).json({ message: "Agent not available" });
    }

    order.deliveryAgentId = agentId;
    if (order.status !== "ready") order.status = "ready";
    await order.save();

    agent.status = "on-delivery";
    await agent.save();

    // 🔔 Push notification (SAFE)
    if (agent.fcmToken && agent.fcmToken.length > 50) {
      try {
        await sendPushNotification({
          token: agent.fcmToken,
          title: "New Delivery Assigned 🚚",
          body: `Order ${order._id} assigned to you`,
          data: { orderId: order._id.toString() },
        });
      } catch (err) {
        console.error("FCM failed:", err.message);
      }
    }

    res.json({ message: "Agent assigned successfully", order });
  } catch (error) {
    console.error("ASSIGN AGENT ERROR:", error);
    res.status(500).json({
      message: "Failed to assign agent",
      error: error.message,
    });
  }
};

////////////////////////////////// Delivery Agent Controllers ////////////////////////////

//get assigned orders for delivery agent
export const getAssignedOrders = async (req, res) => {
  try {
    const agentId = req.user.id;

    const orders = await Order.find({ deliveryAgentId: agentId })
      .populate("customerId", "name phone")
      .populate("restaurantId", "name address")
      .populate("address")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching assigned orders", error });
  }
};

//

//mark order as picked up (for delivery agents)
export const markOrderPickedUp = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, deliveryAgentId: agentId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "picked";
    await order.save();

    const customer = await Customer.findById(order.customerId);

    //push notification
    await sendPushNotification({
      token: customer.fcmToken,
      title: "Order Picked Up",
      body: `Your order ${order._id} has been picked up by the delivery agent.`,
      data: {
        orderId: order._id.toString(),
        status: "picked",
      },
    });

    res.status(200).json({ message: "Order picked up", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error });
  }
};

//mark order as delivered (for delivery agents)
export const markOrderDelivered = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, deliveryAgentId: agentId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "delivered";
    await order.save();

    await DeliveryAgent.findByIdAndUpdate(agentId, {
      status: "available",
    });

    const customer = await Customer.findById(order.customerId);

    //push notification
    await sendPushNotification({
      token: customer.fcmToken,
      title: "Order Delivered",
      body: `Your order ${order._id} has been delivered by the delivery agent.`,
      data: {
        orderId: order._id.toString(),
        status: "delivered",
      },
    });

    res.status(200).json({ message: "Order delivered successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error });
  }
};
