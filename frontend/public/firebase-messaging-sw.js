importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyANEjfrwO1x-hP507f7tKbldR5KC334pv4",
  authDomain: "food-delivery-app-41fcc.firebaseapp.com",
  projectId: "food-delivery-app-41fcc",
  messagingSenderId: "863932987276",
  appId: "1:863932987276:web:f8d53e8f8afef1cd7e88a9",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification.title,
    { body: payload.notification.body }
  );
});
