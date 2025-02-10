import nodemailer, { Transporter } from "nodemailer";
import { emailConfig } from "../config/email";

class EmailConfig {
  private static transporter: Transporter | null = null;

  private constructor() {}

  /**
   * ✅ Inițializează și returnează un transport Nodemailer pentru providerul specificat
   */
  public static getTransporter(provider?: "gmail" | "mailgun" | "sendgrid"): Transporter {
    const selectedProvider = provider || emailConfig.provider;

    if (!this.transporter || selectedProvider !== emailConfig.provider) {
      this.transporter = nodemailer.createTransport(emailConfig.providers[selectedProvider]);
      console.log(`📧 Email provider set to: ${selectedProvider}`);
    }

    return this.transporter;
  }
}

export default EmailConfig;