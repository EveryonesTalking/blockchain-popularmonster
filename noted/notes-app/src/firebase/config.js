// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace with your Firebase project info
const firebaseConfig = {
    apiKey: "AIzaSyCBIIdCUE0jKvK7eWOwr2Pcb1Bfc_8_nDA",
    authDomain: "glyph-fe7c7.firebaseapp.com",
    projectId: "glyph-fe7c7",
    storageBucket: "glyph-fe7c7.firebasestorage.app",
    messagingSenderId: "381693459280",
    appId: "1:381693459280:web:903135f77121531ed00a55",
    measurementId: "G-DKETX41HTW"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { db };
