import { messaging } from "../firebase";
import { getToken } from "firebase/messaging";
import api from "../api/axiosInstance";

export const registerFCMToken = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  });

  if (token) {
    await api.put("/api/customers/fcm-token", { fcmToken: token });
  }
};
