import twilio from "twilio";
import { Auth } from "@vonage/auth";
import { Vonage } from "@vonage/server-sdk"; // ✅ Importăm corect SDK-ul Vonage
import * as plivo from "plivo";

/**
 * ✅ Define allowed SMS providers
 */
type SMSProvider = "twilio" | "nexmo" | "plivo";

class SMSConfig {
  private static clients: Record<SMSProvider, any> = {
    twilio: twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN),
    nexmo: new Vonage(
      new Auth({
        apiKey: process.env.NEXMO_API_KEY || "",
        apiSecret: process.env.NEXMO_API_SECRET || "",
      })
    ),
    plivo: new plivo.Client(process.env.PLIVO_AUTH_ID || "", process.env.PLIVO_AUTH_TOKEN || ""),
  };

  private static senderNumbers: Record<SMSProvider, string> = {
    twilio: process.env.TWILIO_PHONE_NUMBER || "",
    nexmo: process.env.NEXMO_PHONE_NUMBER || "",
    plivo: process.env.PLIVO_PHONE_NUMBER || "",
  };

  /**
   * ✅ Returnează clientul pentru un provider specific
   */
  public static getClient(provider: SMSProvider) {
    if (!this.clients[provider]) {
      throw new Error(`❌ Unknown SMS provider: ${provider}`);
    }
    return this.clients[provider];
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
}

export default SMSConfig;