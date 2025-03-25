import { BadRequestError } from "../../errors/CustomErrors";

class InvitationValidationService {
  static validateCreateInvitation(data: any): void {
    if (!data.email || !data.role) {
      throw new BadRequestError("Missing required fields: email, role.");
    }
  }

  static validateAcceptInvite(fullName: string, password: string): void {
    if (!fullName || !password) {
      throw new BadRequestError("Full name and password are required.");
    }
    if (password.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters long.");
    }
  }

  /**
   * ✅ Validează formatul emailului
   */
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== "string") {
      return false;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }  
}

export default InvitationValidationService;
