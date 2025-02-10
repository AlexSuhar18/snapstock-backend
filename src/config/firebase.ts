import admin from "firebase-admin";
import dotenv from "dotenv";

// ✅ Încărcăm variabilele de mediu
dotenv.config();

class FirebaseConfig {
  private static instance: admin.app.App;

  private constructor() {} // 🔹 Constructor privat pentru Singleton

  /**
   * ✅ Inițializează Firebase dacă nu este deja inițializat
   */
  public static getInstance(): admin.app.App {
    if (!this.instance) {
      this.instance = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });

      console.log("🔥 Firebase initialized!");
    }
    return this.instance;
  }

  /**
   * ✅ Returnează instanța Firestore
   */
  public static getFirestore(): admin.firestore.Firestore {
    return this.getInstance().firestore();
  }

  /**
   * ✅ Returnează instanța Auth
   */
  public static getAuth(): admin.auth.Auth {
    return this.getInstance().auth();
  }
}

export default FirebaseConfig;