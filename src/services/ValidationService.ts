import commonPasswords from "../config/commonPasswords.json";

export class ValidationService {
    private static allowedDomainsCache: string[] | null = null;
    private static blacklistedDomainsCache: string[] | null = null;

    static isStrongPassword(password: string | undefined): boolean {
        if (!password) {
            return false; // Parola este invalidă dacă este goală sau nedefinită
        }

        // 🔹 1. Elimină spațiile albe accidentale
        password = password.trim();

        // 🔹 2. Verifică dacă parola este prea scurtă
        if (password.length < 8) {
            return false;
        }

        // 🔹 3. Expresie regulată pentru cerințele de bază
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!strongPasswordRegex.test(password)) {
            return false;
        }

        // 🔹 4. Verifică dacă parola conține secvențe sau parole comune
        if (this.isCommonPassword(password)) {
            return false;
        }

        return true;
    }

    /**
     * ✅ Verifică dacă parola este în lista de parole comune.
     * 
     * @param password - Parola introdusă de utilizator.
     * @returns `true` dacă parola este considerată nesigură.
     */
    static isCommonPassword(password: string): boolean {
        return commonPasswords.includes(password.toLowerCase());
    }

    /**
     * ✅ Verifică dacă email-ul are un format valid conform standardului RFC 5322.
     * 
     * @param email - Email-ul introdus de utilizator.
     * @returns `true` dacă email-ul are un format valid.
     */
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * ✅ Încarcă și cache-uiește domeniile permise.
     */
    private static loadAllowedDomains(): string[] {
        if (this.allowedDomainsCache !== null) {
            return this.allowedDomainsCache;
        }

        const rawDomains = process.env.ALLOWED_DOMAINS;
        console.log("🛠️ RAW ALLOWED_DOMAINS:", rawDomains);

        if (!rawDomains) {
            console.log("⚠️ ALLOWED_DOMAINS is undefined!");
            this.allowedDomainsCache = [];
            return [];
        }

        this.allowedDomainsCache = rawDomains.split(",").map(domain => domain.trim());
        console.log("🔹 Parsed Allowed Domains:", this.allowedDomainsCache);
        return this.allowedDomainsCache;
    }

    /**
     * ✅ Încarcă și cache-uiește domeniile blocate.
     */
    private static loadBlacklistedDomains(): string[] {
        if (this.blacklistedDomainsCache !== null) {
            return this.blacklistedDomainsCache;
        }

        const rawBlacklistedDomains = process.env.BLACKLISTED_DOMAINS;
        console.log("🛠️ RAW BLACKLISTED_DOMAINS:", rawBlacklistedDomains);

        if (!rawBlacklistedDomains) {
            console.log("⚠️ BLACKLISTED_DOMAINS is undefined!");
            this.blacklistedDomainsCache = [];
            return [];
        }

        this.blacklistedDomainsCache = rawBlacklistedDomains.split(",").map(domain => domain.trim());
        console.log("🚫 Parsed Blacklisted Domains:", this.blacklistedDomainsCache);
        return this.blacklistedDomainsCache;
    }

    /**
     * ✅ Verifică dacă email-ul aparține unui domeniu permis și NU este pe blacklist.
     * 
     * @param email - Email-ul introdus de utilizator.
     * @returns `true` dacă domeniul este permis și nu este blocat.
     */
    static isAllowedDomain(email: string): boolean {
        if (!this.isValidEmail(email)) {
            console.log(`❌ Invalid email format: ${email}`);
            return false;
        }

        const domain = email.split("@")[1];
        const allowedDomains = this.loadAllowedDomains();
        const blacklistedDomains = this.loadBlacklistedDomains();

        if (blacklistedDomains.includes(domain)) {
            console.warn(`🚫 Email domain is blacklisted: ${domain}`);
            return false;
        }

        if (allowedDomains.includes("all")) {
            console.log("✅ All domains are allowed.");
            return true;
        }

        return allowedDomains.includes(domain);
    }

    /**
     * ✅ Verifică dacă un email este deja folosit pentru a preveni duplicatele.
     * 
     * @param email - Email-ul de verificat.
     * @param existingEmails - Lista de email-uri existente în sistem.
     * @returns `true` dacă email-ul este deja înregistrat.
     */
    static isDuplicateEmail(email: string, existingEmails: string[]): boolean {
        return existingEmails.includes(email.toLowerCase());
    }
}