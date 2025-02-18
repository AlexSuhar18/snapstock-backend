class DateUtils {
    /**
     * ✅ Formatează un timestamp într-un string lizibil
     */
    static formatTimestamp(timestamp: Date | string | number): string {
      const date = new Date(timestamp);
      return date.toISOString();
    }
  
    /**
     * ✅ Verifică dacă o dată este în trecut
     */
    static isPastDate(date: Date | string | number): boolean {
      return new Date(date).getTime() < Date.now();
    }
  
    /**
     * ✅ Obține diferența dintre două date în zile
     */
    static getDaysDifference(date1: Date | string, date2: Date | string): number {
      const d1 = new Date(date1).getTime();
      const d2 = new Date(date2).getTime();
      return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    }
  }
  
  export default DateUtils;
  