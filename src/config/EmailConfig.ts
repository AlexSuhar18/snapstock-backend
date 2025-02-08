import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

type EmailProvider = "gmail" | "mailgun" | "sendgrid"; // ✅ Definim tipurile posibile pentru provider

class EmailConfig {
  private static transporter: Transporter | null = null;
  private static backupProvider: EmailProvider | null = null; // ✅ Adăugăm backupProvider

  private constructor() {}

  /**
   * ✅ Inițializează transportul de email
   */
  public static getTransporter(providerOverride?: EmailProvider): Transporter {
    if (!this.transporter || providerOverride) {
      let provider = providerOverride || (process.env.EMAIL_PROVIDER || "gmail").toLowerCase() as EmailProvider;

      const validProviders: EmailProvider[] = ["gmail", "mailgun", "sendgrid"];

      // ✅ Verificăm dacă providerul este valid, altfel fallback la "gmail"
      if (!validProviders.includes(provider)) {
        console.warn(`⚠️ Unknown email provider "${provider}". Falling back to "gmail".`);
        provider = "gmail";
      }

      const config: Record<EmailProvider, any> = {
        gmail: {
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
        },
        mailgun: {
          host: "smtp.mailgun.org",
          port: 587,
          auth: { user: process.env.MAILGUN_USER, pass: process.env.MAILGUN_PASSWORD },
        },
        sendgrid: {
          host: "smtp.sendgrid.net",
          port: 587,
          auth: { user: process.env.SENDGRID_USER, pass: process.env.SENDGRID_PASSWORD },
        },
      };

      if (!config[provider].auth.user || !config[provider].auth.pass) {
        console.error(`❌ Missing credentials for ${provider}. Trying backup provider...`);
        provider = this.switchToBackupProvider(validProviders, provider);
      }

      this.transporter = nodemailer.createTransport(config[provider]);
      console.log(`📧 Email provider set to: ${provider}`);
    }

    return this.transporter;
  }

  /**
   * ✅ Fallback logic: schimbă providerul dacă primul eșuează
   */
  private static switchToBackupProvider(validProviders: EmailProvider[], failedProvider: EmailProvider): EmailProvider {
    const backup = validProviders.find(p => p !== failedProvider) || "gmail"; // 🔹 Alegem un provider valid
    console.warn(`⚠️ Switching to backup provider: ${backup}`);
    this.backupProvider = backup;
    return backup;
  }

  /**
   * ✅ Testează conexiunea SMTP
   */
  public static async testConnection(): Promise<void> {
    try {
      await this.getTransporter().verify();
      console.log("✅ SMTP connection successful.");
    } catch (error) {
      console.error("❌ SMTP connection failed:", error);
    }
  }
}

export default EmailConfig;