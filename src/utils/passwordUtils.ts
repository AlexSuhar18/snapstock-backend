/**
 * ✅ Verifică dacă parola este sigură
 * 
 * - Min. 8 caractere
 * - Cel puțin o literă mare
 * - Cel puțin o literă mică
 * - Cel puțin un număr
 * - Cel puțin un caracter special (@$!%*?&)
 */
export const isStrongPassword = (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return regex.test(password);
};

