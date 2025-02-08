import { Request, Response, NextFunction } from "express";

/**
 * ✅ Middleware pentru a gestiona erorile în Express într-un mod asincron.
 * - Elimină necesitatea blocurilor `try-catch` în controllere.
 * - Transmite erorile către Express error-handling middleware.
 * 
 * @param fn Funcția asincronă care trebuie protejată.
 * @returns O funcție Express middleware care capturează și transmite erorile.
 */
export default function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
}
