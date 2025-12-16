import { onMessage } from "firebase/messaging";
import { messaging } from "../firebase";

export const initForegroundPush = () => {
  onMessage(messaging, (payload) => {
    console.log("Foreground push received:", payload);

    if (payload?.notification) {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/logo.png",
      });
    }
  });
};
