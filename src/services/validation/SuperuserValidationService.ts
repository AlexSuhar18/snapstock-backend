import { BadRequestError } from "../../errors/CustomErrors";

class SuperuserValidationService {
  /**
   * ✅ Validează crearea unui superuser
   */
  static validateCreateSuperuser(data: any): void {
    if (!data.email || !data.fullName) {
      throw new BadRequestError("❌ Missing required fields: email, fullName.");
    }
  }

  /**
   * ✅ Verifică dacă un email are un format valid
   */
  static isValidEmail(email: string): boolean {
    if (!email) {
      throw new BadRequestError("❌ Email is required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * ✅ Verifică dacă un rol este valid
   */
  static isValidRole(role: string): boolean {
    const validRoles = ["admin", "superadmin", "viewer"];
    return validRoles.includes(role);
  }

  /**
   * ✅ Validează clonarea unui superuser
   */
  static validateCloneSuperuser(data: any): void {
    if (!data.email || !data.fullName) {
      throw new BadRequestError("❌ Missing required fields: email, fullName.");
    }
  }
}

export default SuperuserValidationService;
