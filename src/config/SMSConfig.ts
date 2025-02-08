import twilio from "twilio";
import { Vonage } from "@vonage/server-sdk";
import { Auth } from "@vonage/auth"; // ✅ Correct way to initialize Vonage (Nexmo)
import * as plivo from "plivo";
import LoggerService from "../services/LoggerService"; // ✅ Ensure logging for better debugging

/**
 * ✅ Define allowed SMS providers
 */
type SMSProvider = "twilio" | "vonage" | "plivo"; // 🔹 'nexmo' renamed to 'vonage' (official)

class SMSConfig {
  private static clients: Record<SMSProvider, any> = {} as Record<SMSProvider, any>;
  private static senderNumbers: Record<SMSProvider, string> = {} as Record<SMSProvider, string>;

  /**
   * ✅ Initialize SMS Providers (Singleton Pattern)
   */
  private static init() {
    if (Object.keys(this.clients).length === 0) {
      LoggerService.logInfo("🛠️ Initializing SMS Providers...");

      // ✅ Twilio Initialization
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.clients["twilio"] = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        this.senderNumbers["twilio"] = process.env.TWILIO_PHONE_NUMBER || "";
      } else {
        LoggerService.logWarn("⚠️ Twilio credentials missing. Skipping Twilio initialization.");
      }

      // ✅ Vonage (Nexmo) Initialization
      if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET) {
        const auth = new Auth({
          apiKey: process.env.VONAGE_API_KEY,
          apiSecret: process.env.VONAGE_API_SECRET,
        });

        this.clients["vonage"] = new Vonage(auth);
        this.senderNumbers["vonage"] = process.env.VONAGE_PHONE_NUMBER || "";
      } else {
        LoggerService.logWarn("⚠️ Vonage (Nexmo) credentials missing. Skipping Vonage initialization.");
      }

      // ✅ Plivo Initialization
      if (process.env.PLIVO_AUTH_ID && process.env.PLIVO_AUTH_TOKEN) {
        this.clients["plivo"] = new plivo.Client(process.env.PLIVO_AUTH_ID, process.env.PLIVO_AUTH_TOKEN);
        this.senderNumbers["plivo"] = process.env.PLIVO_PHONE_NUMBER || "";
      } else {
        LoggerService.logWarn("⚠️ Plivo credentials missing. Skipping Plivo initialization.");
      }

      LoggerService.logInfo("✅ SMS Providers Initialized Successfully.");
    }
  }

  /**
   * ✅ Get client for a specific provider
   */
  public static getClient(provider: SMSProvider) {
    this.init(); // Ensure initialization before access

    if (!this.clients[provider]) {
      throw new Error(`❌ Unknown or uninitialized SMS provider: ${provider}`);
    }
    return this.clients[provider];
  }

  /**
   * ✅ Get sender number for a specific provider
   */
  public static getSenderNumber(provider: SMSProvider): string {
    this.init(); // Ensure initialization before access

    if (!this.senderNumbers[provider]) {
      throw new Error(`❌ No sender number configured for provider: ${provider}`);
    }
    return this.senderNumbers[provider];
  }

  /**
   * ✅ Get the default SMS provider (fallback to Twilio)
   */
  public static getDefaultProvider(): SMSProvider {
    this.init(); // Ensure providers are initialized

    const availableProviders = Object.keys(this.clients) as SMSProvider[];
    if (availableProviders.length === 0) {
      throw new Error("❌ No SMS providers available. Please configure at least one provider.");
    }

    const preferredProvider = process.env.SMS_PROVIDER as SMSProvider;
    if (availableProviders.includes(preferredProvider)) {
      return preferredProvider;
    }

    LoggerService.logWarn(`⚠️ Preferred SMS provider '${preferredProvider}' is not available. Falling back to '${availableProviders[0]}'`);
    return availableProviders[0]; // Default to first available provider
  }
}

export default SMSConfig;