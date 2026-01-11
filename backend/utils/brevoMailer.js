import axios from "axios";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.EMAIL_FROM,
          name: "Food Delivery App",
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    console.log("📧 Email sent via Brevo");
  } catch (error) {
    console.error(
      "❌ Brevo email error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
