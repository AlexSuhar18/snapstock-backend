import { Request, Response, NextFunction } from "express";
import EmailService from "../services/EmailService";

class EmailController {
  static async sendEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { to, subject, text, html } = req.body;

      // 🔹 Apelăm serviciul pentru trimiterea emailului
      await EmailService.sendEmail(to, subject, text, html);

      res.status(200).json({ message: `Email sent to ${to}` });
    } catch (error) {
      next(error); // Pasăm eroarea către Express error handler
    }
  }
}

export default EmailController;
