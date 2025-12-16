import admin from "../config/firebaseAdmin.js";

export const sendPushNotification = async ({
  token,
  title,
  body,
  data = {},
}) => {
  if (!token) return;

  const message = {
    token,
    notification: {
      title,
      body,
    },
    data,
  };

  await admin.messaging().send(message);
};
