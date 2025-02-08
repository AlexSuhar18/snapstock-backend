import admin from "firebase-admin";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import dotenv from "dotenv";
import serviceAccount from "./firebaseKey.json";

// 🔹 Încarcă fișierul .env corect
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

// 🔹 Inițializează Firebase Admin SDK (Backend)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}
const adminDb = admin.firestore();

// 🔹 Configurare Firebase Client SDK (Frontend)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// 🔥 Inițializează Firebase Client SDK doar dacă nu a fost deja inițializat
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const clientDb = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// 🔹 Exportă instanțele corecte
export { firebaseApp, auth, clientDb, adminDb };
