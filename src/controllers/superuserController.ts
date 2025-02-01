import {NextFunction, Request, Response} from 'express';
import { getSuperuser, setSuperuser, deleteSuperuser, cloneSuperuser } from '../models/superuserModel';
import { SUPERUSER_DOC_ID, SUPERUSER_COLLECTION } from '../models/superuserModel';
import { db } from '../config/firebase';

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

// Delete superuser - debug only
export const deleteSuperuserHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const snapshot = await db.collection(SUPERUSER_COLLECTION).get();
        
        const superusersToDelete = snapshot.docs
            .filter(doc => doc.id !== SUPERUSER_DOC_ID) // 🔹 Exclude superuserul principal
            .map(doc => doc.ref);

        if (superusersToDelete.length === 0) {
            res.status(400).json({ message: "No superusers to delete, only main superuser exists." });
            return;
        }

        // 🔹 Ștergem fiecare superuser în afară de cel principal
        const batch = db.batch();
        superusersToDelete.forEach(ref => batch.delete(ref));
        await batch.commit();

        res.status(200).json({ message: `Deleted ${superusersToDelete.length} superusers, except the main superuser.` });
    } catch (error) {
        console.error("🚨 Error deleting superusers: ", error);
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

