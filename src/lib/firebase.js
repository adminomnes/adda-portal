import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyA1g6UDmrcWXGqkKMdmONvjWPhp3-85JHY",
  authDomain: "imperia-42291.firebaseapp.com",
  projectId: "imperia-42291",
  storageBucket: "imperia-42291.firebasestorage.app",
  messagingSenderId: "757447533395",
  appId: "1:757447533395:web:ff0a13aa7111d0321237a6",
  measurementId: "G-M62MJZTT4L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
