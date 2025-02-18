class StringUtils {
    /**
     * ✅ Curăță un string de spații albe și caractere speciale
     */
    static sanitize(input: string): string {
      return input.trim().replace(/[^\w\s]/gi, '');
    }
  
    /**
     * ✅ Convertește un string la format slug (ex: "Hello World" -> "hello-world")
     */
    static toSlug(input: string): string {
      return input
        .toLowerCase()
        .trim()
        .replace(/[\s]+/g, '-')
        .replace(/[^\w-]+/g, '');
    }
  
    /**
     * ✅ Verifică dacă un string este valid pentru un email
     */
    static isValidEmail(email: string): boolean {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  }
  
  export default StringUtils;
  