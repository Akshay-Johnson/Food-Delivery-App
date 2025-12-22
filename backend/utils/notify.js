import admin from "../config/firebase.js";

export const sendPushToUser = async ({ fcmToken, title, body, data = {} }) => {
  if (!fcmToken) return;

  const message = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
    data,
  };

  try {
    await admin.messaging().send(message);
    console.log("Push notification sent successfully :", title);
  } catch (error) {
    console.error("Error sending push notification :", error);
  }
};
