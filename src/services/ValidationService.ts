import commonPasswords from '../config/commonPasswords.json';
import EventService from '../services/EventService';
import ModuleMiddleware from '../middlewares/ModuleMiddleware';
import { EventTypes } from '../events/EventTypes';

export class ValidationService {
  private static allowedDomainsCache: string[] | null = null;
  private static blacklistedDomainsCache: string[] | null = null;

  /**
   * ✅ Verifică dacă parola este puternică
   */
  static async isStrongPassword(password: string | undefined): Promise<boolean> {
    ModuleMiddleware.ensureModuleActive("validation");

    if (!password) {
      return false;
    }

    password = password.trim();
    if (password.length < 8) {
      return false;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return false;
    }

    if (this.isCommonPassword(password)) {
      return false;
    }

    await EventService.emitEvent(EventTypes.PASSWORD_VALIDATED, { password: '[HIDDEN]' });
    return true;
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    await EventService.emitEvent(EventTypes.EMAIL_VALIDATED, { email, isValid });
    return isValid;
  }

  /**
   * ✅ Încarcă și cache-uiește domeniile permise
   */
  private static loadAllowedDomains(): string[] {
    if (this.allowedDomainsCache !== null) {
      return this.allowedDomainsCache;
    }

    const rawDomains = process.env.ALLOWED_DOMAINS;
    if (!rawDomains) {
      this.allowedDomainsCache = [];
      return [];
    }

    this.allowedDomainsCache = rawDomains.split(',').map(domain => domain.trim());
    return this.allowedDomainsCache;
  }

  /**
   * ✅ Încarcă și cache-uiește domeniile blocate
   */
  private static loadBlacklistedDomains(): string[] {
    if (this.blacklistedDomainsCache !== null) {
      return this.blacklistedDomainsCache;
    }

    const rawBlacklistedDomains = process.env.BLACKLISTED_DOMAINS;
    if (!rawBlacklistedDomains) {
      this.blacklistedDomainsCache = [];
      return [];
    }

    this.blacklistedDomainsCache = rawBlacklistedDomains.split(',').map(domain => domain.trim());
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

    const domain = email.split('@')[1];
    const allowedDomains = this.loadAllowedDomains();
    const blacklistedDomains = this.loadBlacklistedDomains();

    if (blacklistedDomains.includes(domain)) {
      return false;
    }

    if (allowedDomains.includes('all')) {
      return true;
    }

    return allowedDomains.includes(domain);
  }

  /**
   * ✅ Verifică dacă emailul este duplicat
   */
  static async isDuplicateEmail(email: string, existingEmails: string[]): Promise<boolean> {
    ModuleMiddleware.ensureModuleActive("validation");

    const isDuplicate = existingEmails.includes(email.toLowerCase());
    await EventService.emitEvent(EventTypes.EMAIL_DUPLICATE_CHECKED, { email, isDuplicate });
    return isDuplicate;
  }
}
