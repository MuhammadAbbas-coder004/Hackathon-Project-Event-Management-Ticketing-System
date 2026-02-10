import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
const firebaseConfig = {
  apiKey: "AIzaSyCcjDY7q-ATEl-5KyKXOwBYtHfx18o4Qj4",
  authDomain: "management-ticketing-system.firebaseapp.com",
  projectId: "management-ticketing-system",
  storageBucket: "management-ticketing-system.firebasestorage.app",
  messagingSenderId: "227846227765",
  appId: "1:227846227765:web:cb154b87d8687ce21c2e7c",
  measurementId: "G-DS88QF340H"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 