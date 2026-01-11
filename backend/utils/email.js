import { sendEmail } from "./brevoMailer.js";

// ORDER PLACED EMAIL
export const sendOrderPlacedEmail = async ({
  to,
  customerName,
  orderId,
  totalAmount,
}) => {
  const subject = `Order Placed Successfully! #${orderId}`;
  const html = `
    <h1>Thank you for your order, ${customerName}!</h1>
    <p>Your order <b>#${orderId}</b> has been placed successfully.</p>
    <p>Total Amount: <b>₹${totalAmount}</b></p>
    <p>We will notify you once your order is out for delivery.</p>
  `;

  return sendEmail({ to, subject, html });
};

// ORDER STATUS UPDATE EMAIL
export const sendOrderStatusUpdateEmail = async ({
  to,
  customerName,
  orderId,
  status,
}) => {
  const subject = `Your Order #${orderId} is now ${status}`;
  const html = `
    <h1>Hi ${customerName},</h1>
    <p>Your order <b>#${orderId}</b> status has been updated to <b>${status}</b>.</p>
    <p>Thank you for choosing our Food Delivery App!</p>
  `;

  return sendEmail({ to, subject, html });
};
