import { db } from "../config/firebase";
import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Request, Response, NextFunction } from 'express';

export const SUPERUSER_COLLECTION = 'superusers';
export const SUPERUSER_DOC_ID = 'mainSuperuser';

export interface Superuser {
    id: string;
    email: string;
    fullName: string;
    createdAt?: FirebaseFirestore.Timestamp;
    updatedAt?: FirebaseFirestore.Timestamp;
    lastLogin?: FirebaseFirestore.Timestamp;
    role: "SUPERUSER";
    isFounder: boolean;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    permissions: {
        canManageCustomers: boolean;
        canManageUsers: boolean;
        canManageAccounts: boolean;
        canManagePlans: boolean;
        canAccessAllData: boolean;
        canModifySettings: boolean;
        canManageProducts: boolean;
    };
    security: {
        twoFactorAuth: boolean;
        password: string;
        backupCodes: string[];
    };
    logs?: Array<{
        action: string;
        timestamp: FirebaseFirestore.Timestamp;
        ipAddress: string;
        details?: any;
    }>;
    settings: {
        theme: "light" | "dark" | "system";
        language: string;
        notificationPreferences: {
            email: boolean;
            sms: boolean;
        };
    };
    cloneable: boolean;
}

//Get Superuser from Firestore
export const getSuperuser = async (superuserId: string = SUPERUSER_DOC_ID): Promise<Superuser | null> => {
    try {
    const superuserDoc = await db.collection(SUPERUSER_COLLECTION).doc(superuserId).get();
    if (!superuserDoc.exists) {
        console.warn(`Superuser with ID ${superuserId} not found`);
        return null;
    }
    return superuserDoc.data() as Superuser;
    } catch (error) {
        console.error(`Error getting superuser (${superuserId}): `, error);
        return null;
    }
}

//Set Superuser in Firestore if it doesn't exist
export const setSuperuser = async (email: string, fullName: string = "Main Superuser", hashedPassword: string): Promise<string | null> => {
    try {
        if (!email || !fullName || !hashedPassword) {
            console.error("🚨 Error: Missing required parameters", { email, fullName, hashedPassword });
            return null;
        }

        const superuserDoc = await db.collection(SUPERUSER_COLLECTION).doc(SUPERUSER_DOC_ID).get();
        if (superuserDoc.exists) {
            console.log(`⛔ Superuser already exists with ID: ${SUPERUSER_DOC_ID}`);
            return null;
        }

        // ✅ Inițializăm obiectul doar dacă superuserul nu există
        const newSuperuser: Superuser = {
            id: SUPERUSER_DOC_ID,
            email,
            fullName: fullName,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
            role: "SUPERUSER",
            isFounder: true,
            status: "ACTIVE",
            permissions: {
                canManageCustomers: true,
                canManageUsers: true,
                canManageAccounts: true,
                canManagePlans: true,
                canAccessAllData: true,
                canModifySettings: true,
                canManageProducts: true
            },
            security: {
                twoFactorAuth: false,
                password: hashedPassword,
                backupCodes: []
            },
            logs: [],
            settings: {
                theme: "system",
                language: "en",
                notificationPreferences: {
                    email: true,
                    sms: false
                }
            },
            cloneable: true
        };

        await db.collection(SUPERUSER_COLLECTION).doc(SUPERUSER_DOC_ID).set(newSuperuser);
        console.log("✅ Superuser created successfully");
        return SUPERUSER_DOC_ID;

    } catch (error) {
        console.error("🚨 Error creating superuser: ", error);
        return null;
    }
};

//Get all Superusers from Firestore
export const getAllSuperusers = async (): Promise<Superuser[]> => {
    try {
    const snapshot = await db.collection(SUPERUSER_COLLECTION).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Superuser));
    } catch (error) {
        console.error("Error getting all superusers: ", error);
        return [];
    }
}

//Clone Superuser in Firestore
export const cloneSuperuser = async (email: string, fullName: string, hashedPassword: string): Promise<boolean> => {
    try {
        const superuserToClone = await getSuperuser();

        if (!superuserToClone) {
            console.error("❌ Original superuser not found");
            return false;
        }

        if (email === superuserToClone.email) {
            console.log("⛔ Cannot clone the superuser with the same email");
            return false;
        }        

        if (superuserToClone.id === SUPERUSER_DOC_ID && !superuserToClone.cloneable) {
            console.log("⛔ Main superuser cannot be cloned because it is not cloneable.");
            return false;
        }

        if (!superuserToClone.cloneable) {
            console.log("⛔ This superuser is not cloneable");
            return false;
        }        

        const existingSuperuser = await db.collection(SUPERUSER_COLLECTION).where("email", "==", email).get();

        if (!existingSuperuser.empty) {
            console.error("❌ Superuser with this email already exists");
            return false;
        }

        const newSuperuserRef = db.collection(SUPERUSER_COLLECTION).doc(); // ID generat automat
        const clonedSuperuser: Superuser = {
            ...superuserToClone,
            id: newSuperuserRef.id, // Folosim ID-ul nou generat
            email,
            fullName,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
            isFounder: false,
            status: "ACTIVE",
            security: {
                ...superuserToClone.security,
                password: hashedPassword,
                backupCodes: []
            },
            logs: [],
            cloneable: false
        };

        await newSuperuserRef.set(clonedSuperuser);
        console.log(`✅ Superuser cloned successfully with ID: ${newSuperuserRef.id}`);
        return true;

    } catch (error) {
        console.error("🚨 Error cloning superuser: ", error);
        return false;
    }
};

//Delete Superuser from Firestore - debug only
export const deleteSuperuser = async (superuserId: string): Promise<boolean> => {
    try {
        if (superuserId === SUPERUSER_DOC_ID) {
            console.log("⛔ Cannot delete the main superuser");
            return false;
        }

        await db.collection(SUPERUSER_COLLECTION).doc(superuserId).delete();
        console.log(`✅ Superuser with ID ${superuserId} deleted successfully`);
        return true;

    } catch (error) {
        console.error("🚨 Error deleting superuser: ", error);
        return false;
    }
};

export const updateLastLogin = async (): Promise<void> => {
    try {
        await db.collection(SUPERUSER_COLLECTION).doc(SUPERUSER_DOC_ID).update({
            lastLogin: FieldValue.serverTimestamp()
        });
        console.log(`✅ Updated last login for ${SUPERUSER_DOC_ID}`);
    } catch (error) {
        console.error("🚨 Error updating last login: ", error);
    }
};
