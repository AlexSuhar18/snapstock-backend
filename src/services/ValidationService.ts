import commonPasswords from "../config/commonPasswords.json";
import EventService from "../services/EventService";
import ModuleMiddleware from "../middlewares/ModuleMiddleware";
import { EventTypes } from "../events/EventTypes";
import { BadRequestError } from "../errors/CustomErrors";

export class ValidationService {
  private static allowedDomainsCache: Set<string> | null = null;
  private static blacklistedDomainsCache: Set<string> | null = null;

  /**
   * ✅ Verifică dacă parola este puternică
   */
  static async isStrongPassword(password?: string): Promise<boolean> {
    ModuleMiddleware.ensureModuleActive("validation");

    if (!password || password.trim().length < 8) {
      return false;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    const isStrong = strongPasswordRegex.test(password) && !this.isCommonPassword(password);

    await EventService.emitEvent(EventTypes.PASSWORD_VALIDATED, { password: "[HIDDEN]", isStrong });
    return isStrong;
  }

  /**
   * ✅ Verifică dacă parola este comună
   */
  static isCommonPassword(password: string): boolean {
    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * ✅ Validează un email conform RFC 5322
   */
  static async isValidEmail(email: string): Promise<boolean> {
    ModuleMiddleware.ensureModuleActive("validation");

    if (!email) {
      throw new BadRequestError("Email is required for validation.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    await EventService.emitEvent(EventTypes.EMAIL_VALIDATED, { email, isValid });
    return isValid;
  }

  /**
   * ✅ Încarcă și cache-uiește domeniile permise
   */
  private static getAllowedDomains(): Set<string> {
    if (!this.allowedDomainsCache) {
      const rawDomains = process.env.ALLOWED_DOMAINS || "";
      this.allowedDomainsCache = new Set(rawDomains.split(",").map((domain) => domain.trim()));
    }
    return this.allowedDomainsCache;
  }

  /**
   * ✅ Încarcă și cache-uiește domeniile blocate
   */
  private static getBlacklistedDomains(): Set<string> {
    if (!this.blacklistedDomainsCache) {
      const rawBlacklistedDomains = process.env.BLACKLISTED_DOMAINS || "";
      this.blacklistedDomainsCache = new Set(rawBlacklistedDomains.split(",").map((domain) => domain.trim()));
    }
    return this.blacklistedDomainsCache;
  }

  /**
   * ✅ Verifică dacă domeniul emailului este permis și nu este pe blacklist
   */
  static async isAllowedDomain(email: string): Promise<boolean> {
    ModuleMiddleware.ensureModuleActive("validation");

    if (!(await this.isValidEmail(email))) {
      return false;
    }

    const domain = email.split("@")[1];
    const allowedDomains = this.getAllowedDomains();
    const blacklistedDomains = this.getBlacklistedDomains();

    const isAllowed = !blacklistedDomains.has(domain) && (allowedDomains.has("all") || allowedDomains.has(domain));

    await EventService.emitEvent(EventTypes.EMAIL_DOMAIN_CHECKED, { email, domain, isAllowed });
    return isAllowed;
  }

  /**
   * ✅ Verifică dacă emailul este duplicat
   */
  static async isDuplicateEmail(email: string, existingEmails: string[]): Promise<boolean> {
    ModuleMiddleware.ensureModuleActive("validation");

    if (!email) {
      throw new BadRequestError("Email is required for duplicate check.");
    }

    const isDuplicate = existingEmails.some((existingEmail) => existingEmail.toLowerCase() === email.toLowerCase());

    await EventService.emitEvent(EventTypes.EMAIL_DUPLICATE_CHECKED, { email, isDuplicate });
    return isDuplicate;
  }
}
