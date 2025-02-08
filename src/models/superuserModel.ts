import { adminDb } from "../config/firebase";
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
    const superuserDoc = await adminDb.collection(SUPERUSER_COLLECTION).doc(superuserId).get();
    if (!superuserDoc.exists) {
        console.warn(`Superuser with ID ${superuserId} not found`);
        return null;
    }
    
    const superuserData = superuserDoc.data();
        if (!superuserData) return null;

        return {
            id: superuserId,
            email: superuserData.email || "",
            fullName: superuserData.fullName || "Unnamed Superuser",
            createdAt: superuserData.createdAt ? superuserData.createdAt.toDate().toISOString() : null,
            updatedAt: superuserData.updatedAt ? superuserData.updatedAt.toDate().toISOString() : null,
            lastLogin: superuserData.lastLogin ? superuserData.lastLogin.toDate().toISOString() : null,
            role: "SUPERUSER",
            isFounder: superuserData.isFounder ?? false,
            status: superuserData.status || "ACTIVE",
            permissions: {
                canManageCustomers: superuserData.permissions?.canManageCustomers ?? false,
                canManageUsers: superuserData.permissions?.canManageUsers ?? false,
                canManageAccounts: superuserData.permissions?.canManageAccounts ?? false,
                canManagePlans: superuserData.permissions?.canManagePlans ?? false,
                canAccessAllData: superuserData.permissions?.canAccessAllData ?? false,
                canModifySettings: superuserData.permissions?.canModifySettings ?? false,
                canManageProducts: superuserData.permissions?.canManageProducts ?? false,
            },
            security: {
                twoFactorAuth: superuserData.security?.twoFactorAuth ?? false,
                password: superuserData.security?.password || "",
                backupCodes: superuserData.security?.backupCodes || []
            },
            logs: superuserData.logs || [],
            settings: {
                theme: superuserData.settings?.theme || "system",
                language: superuserData.settings?.language || "en",
                notificationPreferences: {
                    email: superuserData.settings?.notificationPreferences?.email ?? false,
                    sms: superuserData.settings?.notificationPreferences?.sms ?? false,
                }
            },
            cloneable: superuserData.cloneable ?? true
        };

    } catch (error) {
        console.error(`Error getting superuser (${superuserId}): `, error);
        return null;
    }
}

//Set Superuser in Firestore if it doesn't exist
export const setSuperuser = async (email: string, fullName: string, hashedPassword: string): Promise<string | null> => {
    try {
        if (!email || !fullName || !hashedPassword) {
            console.error("🚨 Error: Missing required parameters", { email, fullName, hashedPassword });
            return null;
        }

        const superuserDoc = await adminDb.collection(SUPERUSER_COLLECTION).doc(SUPERUSER_DOC_ID).get();
        if (superuserDoc.exists) {
            console.log(`⛔ Superuser already exists with ID: ${SUPERUSER_DOC_ID}`);
            return null;
        }

        const timestamp = admin.firestore.Timestamp.now();

        // ✅ Inițializăm obiectul fără lastLogin dacă este undefined
        const newSuperuser: Partial<Superuser> = {
            id: SUPERUSER_DOC_ID,
            email,
            fullName,
            createdAt: timestamp,
            updatedAt: timestamp,
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

        // 🔥 Dacă lastLogin nu este definit, îl eliminăm din obiect
        if (typeof newSuperuser.lastLogin === "undefined") {
            delete newSuperuser.lastLogin;
        }

        await adminDb.collection(SUPERUSER_COLLECTION).doc(SUPERUSER_DOC_ID).set(newSuperuser);
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
        const snapshot = await adminDb.collection(SUPERUSER_COLLECTION).get();

        return snapshot.docs.map(doc => {
            const data = doc.data() as Superuser;

            return {
                id: data.id,
                email: data.email,
                fullName: data.fullName,
                createdAt: data.createdAt ?? undefined,
                updatedAt: data.updatedAt ?? undefined,
                lastLogin: data.lastLogin ?? undefined,
                role: data.role,
                isFounder: data.isFounder,
                status: data.status,
                permissions: {
                    canManageCustomers: data.permissions?.canManageCustomers ?? false,
                    canManageUsers: data.permissions?.canManageUsers ?? false,
                    canManageAccounts: data.permissions?.canManageAccounts ?? false,
                    canManagePlans: data.permissions?.canManagePlans ?? false,
                    canAccessAllData: data.permissions?.canAccessAllData ?? false,
                    canModifySettings: data.permissions?.canModifySettings ?? false,
                    canManageProducts: data.permissions?.canManageProducts ?? false,
                },
                security: {
                    twoFactorAuth: data.security?.twoFactorAuth ?? false,
                    password: data.security?.password ?? "",
                    backupCodes: data.security?.backupCodes ?? [],
                },
                logs: data.logs ?? [],
                settings: {
                    theme: data.settings?.theme ?? "system",
                    language: data.settings?.language ?? "en",
                    notificationPreferences: {
                        email: data.settings?.notificationPreferences?.email ?? true,
                        sms: data.settings?.notificationPreferences?.sms ?? false,
                    }
                },
                cloneable: data.cloneable ?? false
            };
        });

    } catch (error) {
        console.error("🚨 Error getting all superusers:", error);
        return [];
    }
};

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

        if (!superuserToClone.cloneable) {
            console.log("⛔ This superuser cannot be cloned");
            return false;
        }

        const existingSuperuser = await adminDb.collection(SUPERUSER_COLLECTION).where("email", "==", email).get();
        if (!existingSuperuser.empty) {
            console.error("❌ Superuser with this email already exists");
            return false;
        }

        const timestamp = admin.firestore.Timestamp.now();
        const newSuperuserRef = adminDb.collection(SUPERUSER_COLLECTION).doc(); // ID generat automat

        const clonedSuperuser: Superuser = {
            id: newSuperuserRef.id,
            email,
            fullName,
            createdAt: timestamp,
            updatedAt: timestamp,
            role: "SUPERUSER",
            isFounder: false,
            status: "ACTIVE",
            permissions: { ...superuserToClone.permissions }, // Se copiază permisiunile existente
            security: {
                twoFactorAuth: superuserToClone.security.twoFactorAuth,
                password: hashedPassword, // Folosim noua parolă, nu cea veche!
                backupCodes: []
            },
            logs: [],
            settings: { ...superuserToClone.settings }, // Se copiază setările existente
            cloneable: false
        };

        // **🚀 Eliminăm `lastLogin` din obiectul clonat**
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

        await adminDb.collection(SUPERUSER_COLLECTION).doc(superuserId).delete();
        console.log(`✅ Superuser with ID ${superuserId} deleted successfully`);
        return true;

    } catch (error) {
        console.error("🚨 Error deleting superuser: ", error);
        return false;
    }
};

export const updateLastLogin = async (): Promise<void> => {
    try {
        const timestamp = admin.firestore.Timestamp.now();
        
        await adminDb.collection(SUPERUSER_COLLECTION).doc(SUPERUSER_DOC_ID).update({
            lastLogin: timestamp
        });

        console.log(`✅ Updated last login for ${SUPERUSER_DOC_ID}`);
    } catch (error) {
        console.error("🚨 Error updating last login: ", error);
    }
};

