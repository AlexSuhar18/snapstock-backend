import { clientDb } from "../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

/**
 * 🔹 Funcție pentru a genera un username unic bazat pe email sau nume
 */
export const generateUsername = async (email: string, firstName?: string, lastName?: string): Promise<string> => {
    if (!validateEmail(email)) {
        throw new Error("Invalid email format.");
    }

    let baseUsername = "";

    if (firstName && lastName) {
        baseUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    } else {
        baseUsername = email.split("@")[0].toLowerCase();
    }

    let username = baseUsername;
    let counter = 1;
    const maxAttempts = 100; // ✅ Evită infinite loops

    while (await usernameExists(username) && counter < maxAttempts) {
        username = `${baseUsername}${counter}`;
        counter++;
    }

    if (counter >= maxAttempts) {
        throw new Error("Unable to generate a unique username.");
    }

    return username;
};

/**
 * 🔹 Verifică dacă un username există deja în baza de date (case-insensitive)
 */
const usernameExists = async (username: string): Promise<boolean> => {
    const usersRef = collection(clientDb, "users");
    const q = query(usersRef, where("username", "==", username.toLowerCase())); // ✅ Case-insensitive
    const userSnapshot = await getDocs(q);
    return !userSnapshot.empty;
};

/**
 * 🔹 Funcție pentru a valida email-ul
 */
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
