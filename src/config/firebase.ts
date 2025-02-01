import admin from 'firebase-admin';
import serviceAccount from "./firebaseKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://snapstock-60fdd.firebaseio.com',
});

export const db = admin.firestore();