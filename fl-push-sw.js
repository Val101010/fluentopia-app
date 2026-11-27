// Fluentopia — primește notificările pe telefon, chiar și când aplicația e închisă.
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");
firebase.initializeApp({ apiKey: "AIzaSyApwqynGPFub7ug987o9zIiL9Cx-QvKd1U", authDomain: "fluentopia-39c53.firebaseapp.com", projectId: "fluentopia-39c53", storageBucket: "fluentopia-39c53.firebasestorage.app", messagingSenderId: "426669481781", appId: "1:426669481781:web:cc9a3bdfe387c81b94b67c" });
firebase.messaging();
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
