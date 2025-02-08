import {NextFunction, Request, Response} from 'express';
import { getSuperuser, setSuperuser, deleteSuperuser, cloneSuperuser, getAllSuperusers } from '../models/superuserModel';
import { SUPERUSER_DOC_ID, SUPERUSER_COLLECTION } from '../models/superuserModel';
import { adminDb } from '../config/firebase';

// Create a superuser - one time
export const setupSuperuser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, fullName } = req.body;
        if (!email || !fullName) {
            res.status(400).json({ message: "Email and full nama are required" });
            return;
        }

        const created = await setSuperuser(email, fullName, "password");
        if (!created) {
            res.status(400).json({ message: "Superuser already exists" });
            return;
        }
        res.status(201).json({ message: "Superuser created" });
    } catch (error) {
        next(error);
    }
}

// Get superuser details
export const getSuperuserHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const superuser = await getSuperuser();
        if (!superuser) {
            res.status(404).json({ message: "Superuser not found" });
            return
        }
        res.json(superuser);
    }  catch (error) {
        next(error);
    }
}

//Get all superusers
export const getAllSuperusersHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const superusers = await getAllSuperusers();

        if (!superusers || superusers.length === 0) {
            res.status(404).json({ message: "No superusers found" });
            return;
        }

        const formattedSuperusers = superusers.map(user => ({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            createdAt: user.createdAt ? user.createdAt.toDate().toISOString() : null,
            updatedAt: user.updatedAt ? user.updatedAt.toDate().toISOString() : null,
            lastLogin: user.lastLogin ? user.lastLogin.toDate().toISOString() : null,
            role: user.role,
            isFounder: user.isFounder,
            status: user.status,
            permissions: {
                canManageCustomers: user.permissions?.canManageCustomers ?? false,
                canManageUsers: user.permissions?.canManageUsers ?? false,
                canManageAccounts: user.permissions?.canManageAccounts ?? false,
                canManagePlans: user.permissions?.canManagePlans ?? false,
                canAccessAllData: user.permissions?.canAccessAllData ?? false,
                canModifySettings: user.permissions?.canModifySettings ?? false,
                canManageProducts: user.permissions?.canManageProducts ?? false,
            },
            security: {
                twoFactorAuth: user.security?.twoFactorAuth ?? false,
                password: "[HIDDEN]", // Evităm expunerea parolei
                backupCodes: user.security?.backupCodes ?? [],
            },
            logs: user.logs?.map(log => ({
                action: log.action,
                timestamp: log.timestamp ? log.timestamp.toDate().toISOString() : null,
                ipAddress: log.ipAddress,
                details: log.details ?? {}
            })) ?? [],
            settings: {
                theme: user.settings?.theme ?? "system",
                language: user.settings?.language ?? "en",
                notificationPreferences: {
                    email: user.settings?.notificationPreferences?.email ?? true,
                    sms: user.settings?.notificationPreferences?.sms ?? false,
                }
            },
            cloneable: user.cloneable ?? false
        }));

        res.status(200).json(formattedSuperusers);
    } catch (error) {
        console.error("🚨 Error getting all superusers:", error);
        next(error);
    }
};

// Delete superuser - debug only
export const deleteAllSuperuserHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const snapshot = await adminDb.collection(SUPERUSER_COLLECTION).get();
        
        const superusersToDelete = snapshot.docs
            .filter(doc => doc.id !== SUPERUSER_DOC_ID) // 🔹 Exclude superuserul principal
            .map(doc => doc.ref);

        if (superusersToDelete.length === 0) {
            res.status(400).json({ message: "No superusers to delete, only main superuser exists." });
            return;
        }

        // 🔹 Ștergem fiecare superuser în afară de cel principal
        const batch = adminDb.batch();
        superusersToDelete.forEach(ref => batch.delete(ref));
        await batch.commit();

        res.status(200).json({ message: `Deleted ${superusersToDelete.length} superusers, except the main superuser.` });
    } catch (error) {
        console.error("🚨 Error deleting superusers: ", error);
        next(error);
    }
};

export const deleteSuperuserHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log("🛠️ DELETE request received at /admin/delete-superuser/:superuserId");

        const { superuserId } = req.params;
        console.log("📌 Superuser ID received:", superuserId);

        if (!superuserId) {
            res.status(400).json({ message: "Superuser ID is required" });
            return;
        }

        if (superuserId === "mainSuperuser") {
            res.status(403).json({ message: "⛔ Cannot delete the main superuser" });
            return;
        }

        const deleted = await deleteSuperuser(superuserId);
        if (!deleted) {
            res.status(404).json({ message: `❌ Superuser with ID ${superuserId} not found` });
            return;
        }

        res.status(200).json({ message: `✅ Superuser with ID ${superuserId} deleted successfully` });

    } catch (error) {
        console.error("🚨 Error deleting superuser:", error);
        next(error);
    }
};

export const cloneSuperuserHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, fullName } = req.body;
        if (!email || !fullName) {
            res.status(400).json({ message: "Email and full fullName are required" });
            return;
        }

        const cloned = await cloneSuperuser(email, fullName, "hashedPassword");
        if (!cloned) {
            res.status(400).json({ message: "Superuser not cloned" });
            return;
        }

        res.status(201).json({ message: "Superuser cloned" });
    } catch (error) {
        next(error);
    }
}

