import dotenv from "dotenv";
import LoggerService from "../services/LoggerService";
import { ValidationService } from "../services/ValidationService";

dotenv.config();

/**
 * ✅ Verifică dacă provider-ul de email este valid
 */
const validProviders = ["gmail", "mailgun", "sendgrid", "custom"] as const;
const emailProvider = process.env.EMAIL_PROVIDER?.toLowerCase() as "gmail" | "mailgun" | "sendgrid" | "custom";

if (!emailProvider || !validProviders.includes(emailProvider)) {
  LoggerService.logError(
    `❌ Invalid EMAIL_PROVIDER set in .env. Expected one of: ${validProviders.join(", ")}. Defaulting to Gmail.`
  );
}

/**
 * ✅ Configurare furnizori de email cu validare
 */
export const emailConfig = {
  provider: emailProvider || "gmail",
  providers: {
    gmail: {
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || (() => {
          LoggerService.logWarn("⚠️ EMAIL_USER is missing from .env!");
          return "";
        })(),
        pass: process.env.EMAIL_PASSWORD || (() => {
          LoggerService.logWarn("⚠️ EMAIL_PASSWORD is missing from .env!");
          return "";
        })(),
      },
    },
    mailgun: {
      host: "smtp.mailgun.org",
      port: 587,
      auth: {
        user: process.env.MAILGUN_USER || (() => {
          LoggerService.logWarn("⚠️ MAILGUN_USER is missing from .env!");
          return "";
        })(),
        pass: process.env.MAILGUN_PASSWORD || (() => {
          LoggerService.logWarn("⚠️ MAILGUN_PASSWORD is missing from .env!");
          return "";
        })(),
      },
    },
    sendgrid: {
      host: "smtp.sendgrid.net",
      port: 587,
      auth: {
        user: process.env.SENDGRID_USER || (() => {
          LoggerService.logWarn("⚠️ SENDGRID_USER is missing from .env!");
          return "";
        })(),
        pass: process.env.SENDGRID_PASSWORD || (() => {
          LoggerService.logWarn("⚠️ SENDGRID_PASSWORD is missing from .env!");
          return "";
        })(),
      },
    },
    custom: {
      host: process.env.SMTP_HOST || (() => {
        LoggerService.logWarn("⚠️ SMTP_HOST is missing for custom email provider!");
        return "";
      })(),
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || (() => {
          LoggerService.logWarn("⚠️ SMTP_USER is missing for custom email provider!");
          return "";
        })(),
        pass: process.env.SMTP_PASSWORD || (() => {
          LoggerService.logWarn("⚠️ SMTP_PASSWORD is missing for custom email provider!");
          return "";
        })(),
      },
    },
  },
};

/**
 * ✅ Validează email-ul destinatarului înainte de utilizare
 */
export const validateEmailRecipient = async (email: string): Promise<boolean> => {
  if (!email) {
    LoggerService.logError("❌ Email recipient is missing.");
    return false;
  }

  const isValid = await ValidationService.isValidEmail(email);
  if (!isValid) {
    LoggerService.logError(`❌ Invalid email format: ${email}`);
  }

  return isValid;
};

LoggerService.logInfo(`✅ Email provider configured: ${emailConfig.provider}`);
