import dotenv from "dotenv";

dotenv.config();

export const emailConfig = {
  provider: (process.env.EMAIL_PROVIDER?.toLowerCase() as "gmail" | "mailgun" | "sendgrid") || "gmail",
  providers: {
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
  },
};