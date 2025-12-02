import admin from "../config/firebase.js";

export const sendPushNotification = async ({ token, title, body, data = {} }) => {
  try {
    const message = {
      token,
      notification: { title, body },
      data
    };

    const response = await admin.messaging().send(message);
    console.log("Push sent:", response);
    return response;

  } catch (error) {
    console.error("FCM Push Error:", error);
  }
};
