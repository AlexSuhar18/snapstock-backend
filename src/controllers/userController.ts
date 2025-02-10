import { Request, Response } from "express";
import asyncHandler from "../middlewares/AsyncHandler";
import { UserService } from "../services/UserService";
import * as Sentry from "@sentry/node";

Sentry.init({ dsn: "SENTRY_DSN" });

/**
 * ✅ Controller pentru gestionarea utilizatorilor
 */
export class UserController {
    /**
     * ✅ Obține detalii despre un utilizator după ID
     */
    static getUser = asyncHandler(async (req: Request, res: Response) => {
        const user = await UserService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    });

    /**
     * ✅ Obține lista utilizatorilor cu paginare
     */
    static getUsers = asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, pageSize = 10 } = req.query;
        const users = await UserService.getAllUsers(Number(page), Number(pageSize));
        res.status(200).json(users);
    });

    /**
     * ✅ Șterge un utilizator după ID
     */
    static deleteUser = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await UserService.deleteUser(id);
        res.status(200).json({ message: "User deleted successfully" });
    });
}