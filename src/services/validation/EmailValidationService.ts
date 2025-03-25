class EmailValidationService {
    /**
     * ✅ Verifică dacă adresa de email este validă
     */
    static isValidEmail(email: string): boolean {
      if (!email) return false;
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  }
  
  export default EmailValidationService;
  