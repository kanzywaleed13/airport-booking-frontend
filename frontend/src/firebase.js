import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfMlQ4zOJgHubxSj0OYliYYNQMWD8RGcg",
  authDomain: "airport-booking-system.firebaseapp.com",
  projectId: "airport-booking-system",
  storageBucket: "airport-booking-system.firebasestorage.app",
  messagingSenderId: "1016900125962",
  appId: "1:1016900125962:web:fbd2b1d49ef63d26bae6f3",
  measurementId: "G-6MVCTVFQNL",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;