import helmet from "helmet";

/**
 * ✅ Configurare Helmet pentru securitate HTTP Headers
 */
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://trusted.cdn.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    frameguard: { action: "deny" }, // 🔹 Previne clickjacking
    referrerPolicy: { policy: "no-referrer" }, // 🔹 Protejează împotriva scurgerii de informații
});

export default helmetConfig;
