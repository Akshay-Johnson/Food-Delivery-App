import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANEjfrwO1x-hP507f7tKbldR5KC334pv4",
  authDomain: "food-delivery-app-41fcc.firebaseapp.com",
  projectId: "food-delivery-app-41fcc",
  storageBucket: "food-delivery-app-41fcc.firebasestorage.app",
  messagingSenderId: "863932987276",
  appId: "1:863932987276:web:f8d53e8f8afef1cd7e88a9",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/* 🔑 EXPORT EVERYTHING FROM ONE PLACE */
export const messaging = getMessaging(app);
export const db = getFirestore(app);
