import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../src/firebase";

let watchId = null;

/**
 * 🚴 Start sending live location
 */
export const startLocationTracking = (agentId, orderId) => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      await setDoc(
        doc(db, "agent_locations", agentId),
        {
          lat: latitude,
          lng: longitude,
          orderId,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    (err) => console.error("Location error:", err),
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    }
  );
};

/**
 * 🛑 Stop tracking (after delivery)
 */
export const stopLocationTracking = async (agentId) => {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  await deleteDoc(doc(db, "agent_locations", agentId));
};
