import twilio from "twilio";
import { Auth } from "@vonage/auth";
import { Vonage } from "@vonage/server-sdk";
import * as plivo from "plivo";
import LoggerService from "../services/LoggerService";
import dotenv from "dotenv";

dotenv.config();

/**
 * ✅ Define allowed SMS providers
 */
type SMSProvider = "twilio" | "nexmo" | "plivo";

class SMSConfig {
  private static clients: Record<SMSProvider, any> = {
    twilio: SMSConfig.initTwilio(),
    nexmo: SMSConfig.initVonage(),
    plivo: SMSConfig.initPlivo(),
  };

  private static senderNumbers: Record<SMSProvider, string> = {
    twilio: process.env.TWILIO_PHONE_NUMBER || "",
    nexmo: process.env.NEXMO_PHONE_NUMBER || "",
    plivo: process.env.PLIVO_PHONE_NUMBER || "",
  };

  /**
   * ✅ Inițializează Twilio
   */
  private static initTwilio() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      LoggerService.logWarn("⚠️ Twilio credentials missing. Skipping Twilio.");
      return null;
    }
    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  /**
   * ✅ Inițializează Vonage (Nexmo)
   */
  private static initVonage() {
    if (!process.env.NEXMO_API_KEY || !process.env.NEXMO_API_SECRET) {
      LoggerService.logWarn("⚠️ Nexmo credentials missing. Skipping Nexmo.");
      return null;
    }
    return new Vonage(
      new Auth({
        apiKey: process.env.NEXMO_API_KEY,
        apiSecret: process.env.NEXMO_API_SECRET,
      })
    );
  }

  /**
   * ✅ Inițializează Plivo
   */
  private static initPlivo() {
    if (!process.env.PLIVO_AUTH_ID || !process.env.PLIVO_AUTH_TOKEN) {
      LoggerService.logWarn("⚠️ Plivo credentials missing. Skipping Plivo.");
      return null;
    }
    return new plivo.Client(process.env.PLIVO_AUTH_ID, process.env.PLIVO_AUTH_TOKEN);
  }

  /**
   * ✅ Returnează clientul pentru un provider specific
   */
  public static getClient(provider: SMSProvider) {
    const client = this.clients[provider];
    if (!client) {
      throw new Error(`❌ Unknown or uninitialized SMS provider: ${provider}`);
    }
    return client;
  }

  /**
   * ✅ Returnează numărul expeditor pentru un provider specific
   */
  public static getSenderNumber(provider: SMSProvider): string {
    if (!this.senderNumbers[provider]) {
      throw new Error(`❌ No sender number configured for provider: ${provider}`);
    }
    return this.senderNumbers[provider];
  }

  /**
   * ✅ Trimite un SMS și face fallback dacă providerul eșuează
   */
  public static async sendSMS(to: string, message: string, primaryProvider: SMSProvider = "twilio") {
    const providers: SMSProvider[] = ["twilio", "nexmo", "plivo"];
    const fallbackProviders = providers.filter(p => p !== primaryProvider);
  
    for (const provider of [primaryProvider, ...fallbackProviders]) {
      try {
        const client = this.getClient(provider);
        const sender = this.getSenderNumber(provider);
  
        if (!client) {
          LoggerService.logWarn(`⚠️ Skipping ${provider}, not initialized.`);
          continue;
        }
  
        LoggerService.logInfo(`📲 Sending SMS via ${provider}...`);
  
        if (provider === "twilio") {
          await client.messages.create({ body: message, from: sender, to });
        } else if (provider === "nexmo") {
          await client.sms.send({ from: sender, to, text: message });
        } else if (provider === "plivo") {
          await client.messages.create(sender, to, message);
        }
  
        LoggerService.logInfo(`✅ SMS sent successfully via ${provider} to ${to}`);
        return { success: true, provider, to, message };
      } catch (error) {
        if (error instanceof Error) {
          LoggerService.logError(`❌ Failed to send SMS via ${provider}: ${error.message}`);
        } else {
          LoggerService.logError(`❌ Unknown error sending SMS via ${provider}`, error);
        }
      }
    }
  
    return { success: false, error: "All SMS providers failed." };
  }  
}

export default SMSConfig;
