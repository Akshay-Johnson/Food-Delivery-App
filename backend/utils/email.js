import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//generic send email
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `Food Delivery App <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent: " + info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error.message);
    throw error;
  }
};

//specific: order placed email
export const sendOrderPlacedEmail = async ({
  to,
  customerName,
  orderId,
  totalAmount,
}) => {
  const subject = `Order Placed Successfully! #${orderId} `;
  const html = `
        </h1>Thank you for your order, ${customerName}!</h1>
        <p>Yout order <b> #${orderId} </b> has been placed successfully.</p>
        <p>Total Amount: <b> $${totalAmount} </b></p>
        <p>We will notify you once your order is out for delivery.</p>
        <br/>
        <p>Thank you for choosing our Food Delivery App!</p>
    `;
  return sendEmail(to, subject, "", html);
};

//specific: order status update email
export const sendOrderStatusUpdateEmail = async ({
  to,
  customerName,
  orderId,
  status,
}) => {
  const subject = `Your Order #${orderId} is now ${status}`;
  const html = `
        <h1>Hi ${customerName}, </h1>
        <p></p>Your order <b> #${orderId} </b> status has been updated to <b> ${status} </b>.</p>
        <p>Thank you for choosing our Food Delivery App!</p>
    `;
  return sendEmail(to, subject, "", html);
};
