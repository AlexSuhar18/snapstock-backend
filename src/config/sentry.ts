import * as Sentry from "@sentry/node";
import "dotenv/config";

// ✅ Verifică dacă DSN este setat corect
if (!process.env.SENTRY_DSN) {
  console.error("❌ SENTRY_DSN nu este definit! Verifică fișierul .env");
  process.exit(1);
}

// ✅ Inițializează Sentry
console.log("🔍 Verificare SENTRY_DSN:", process.env.SENTRY_DSN);
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    Sentry.httpIntegration(), // ✅ Tracking HTTP requests
    Sentry.expressIntegration(), // ✅ Middleware Express
  ],
  tracesSampleRate: 1.0, // Ajustează sampling-ul
});

// ✅ Exportă Sentry pentru utilizare globală
export default Sentry;
