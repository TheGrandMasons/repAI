import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseEnv } from "./env";

// Initialize Firebase
const app = initializeApp(firebaseEnv);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export initialized services
export { app, auth, db };