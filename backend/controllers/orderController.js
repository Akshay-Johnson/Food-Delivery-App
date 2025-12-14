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

//create new order
export const createOrder = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { addressId } = req.body;

    const cart = await Cart.findOne({ customerId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

      const restaurantId = cart.restaurantId;

    const existingPendingOrder = await Order.findOne({
      customerId,
      restaurantId,
      status: "pending",
      createdAt: { $gt: new Date(Date.now() - 5000) }, // last 5 seconds
    });

    if (existingPendingOrder) {
      return res.status(400).json({
        message: "Order already created recently. Please wait...",
        orderId: existingPendingOrder._id,
      });
    }

    const order = await Order.create({
      customerId,
      restaurantId : cart.restaurantId,
      items: cart.items,
      totalPrice: cart.totalPrice,
      address: addressId,
      status: "pending",
    });

    //clear cart after order
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    //send order placed email
    const customer = await Customer.findById(customerId);

    await sendOrderPlacedEmail({
      to: customer.email,
      customerName: customer.name,
      orderId: order._id,
      totalAmount: order.totalPrice,
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: "error creating order", error });
  }
};

//get orders for a customer
export const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user.id;

    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

//get single order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('restaurantId', 'name');

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

    const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching restaurant orders", error });
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

    console.log("ASSIGN AGENT HIT");
    console.log("Order ID:", orderId);
    console.log("Agent ID:", agentId);

    if (!agentId) {
      return res.status(400).json({ message: "agentId is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const agent = await DeliveryAgent.findById(agentId);

    if (!agent) {
      return res.status(404).json({ message: "Delivery agent not found" });
    }

    // Assign agent
    order.deliveryAgent = agentId;
    order.status = "ready";

    await order.save();

    res.status(200).json({
      message: "Agent assigned successfully",
      order,
    });

  } catch (error) {
    console.error("ASSIGN AGENT ERROR:", error);
    res.status(500).json({
      message: "Failed to assign agent",
      error: error.message,
      stack: error.stack,
    });
  }
};


////////////////////////////////// Delivery Agent Controllers ////////////////////////////

//get assigned orders for delivery agent
export const getAssignedOrders = async (req, res) => {
  try {
    const agentId = req.user.id;

    const orders = await Order.find({ deliveryAgentId: agentId }).sort({
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

