import admin from "firebase-admin";
import dotenv from "dotenv";
import LoggerService from "../services/LoggerService";

dotenv.config();

class FirebaseConfig {
  private static instance: admin.app.App;

  private constructor() {} // 🔹 Singleton: împiedică instanțierea directă

  /**
   * ✅ Validează variabilele de mediu Firebase
   */
  private static validateEnv() {
    const requiredVars = [
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY",
      "FIREBASE_DATABASE_URL",
    ];

    for (const envVar of requiredVars) {
      if (!process.env[envVar]) {
        throw new Error(`❌ Missing Firebase env variable: ${envVar}`);
      }
    }
  }

  /**
   * ✅ Inițializează Firebase dacă nu este deja inițializat
   */
  public static getInstance(): admin.app.App {
    if (!this.instance) {
      try {
        this.validateEnv(); // 🔥 Validare înainte de inițializare

        this.instance = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        });

        LoggerService.logInfo("🔥 Firebase initialized successfully!");

        // ✅ Activează emulatoarele Firebase în dezvoltare
        if (process.env.NODE_ENV === "development") {
          this.enableEmulators();
        }
      } catch (error) {
        LoggerService.logError("❌ Firebase initialization failed", error);
        throw error;
      }
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

  /**
   * ✅ Activează emulatoarele Firebase în mod dezvoltare
   */
  private static enableEmulators() {
    if (this.instance) {
      const firestore = this.instance.firestore();
      const auth = this.instance.auth();

      firestore.settings({ host: "localhost:8080", ssl: false });
      process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";

      LoggerService.logInfo("⚡ Firebase emulators activated for local development");
    }
  }
}

export default FirebaseConfig;
