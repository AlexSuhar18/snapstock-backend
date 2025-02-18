import FirestoreInvitationRepository from "./FirestoreInvitationRepository";
import admin from "firebase-admin";

// Obținem instanța Firestore
const firestore = admin.firestore();

// Creăm și exportăm repository-ul invitațiilor
const invitationRepository = new FirestoreInvitationRepository();

export { invitationRepository };
