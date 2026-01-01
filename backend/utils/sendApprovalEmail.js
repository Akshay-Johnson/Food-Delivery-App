import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// ✅ Restaurant Approval Email
export const sendRestaurantApprovalEmail = async (email, name) => {
  await transporter.sendMail({
    from: `"DineX Admin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🎉 Your Restaurant Has Been Approved!",
    html: `
      <h2>Hello ${name},</h2>
      <p>Your restaurant has been <strong>approved</strong> by our admin team.</p>
      <p>You can now log in and start receiving orders.</p>
      <br />
      <a href="http://localhost:5173/restaurant/login"
         style="padding:10px 16px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;">
         Login to Dashboard
      </a>
      <p style="margin-top:20px;">– Team DineX</p>
    `,
  });
};

// ✅ Delivery Agent Approval Email
export const sendAgentApprovalEmail = async (email, name) => {
  await transporter.sendMail({
    from: `"DineX Admin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🎉 Delivery Agent Approved!",
    html: `
      <h2>Hello ${name},</h2>
      <p>Your delivery agent account has been <b>approved</b>.</p>
      <p>You can now log in and start accepting deliveries.</p>
      <a href="http://localhost:5173/agent/login"
         style="padding:10px 16px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;">
         Login Now
      </a>
      <p style="margin-top:20px;">– Team DineX</p>
    `,
  });
};
