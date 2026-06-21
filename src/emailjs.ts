import emailjs from "@emailjs/browser";
import type { EmailProvider, EmailParams, EmailResult } from "./types";

export interface EmailJSConfig {
  serviceId: string;
  /** Public key from the EmailJS dashboard - safe to expose in the browser. */
  publicKey: string;
}

/** Works in any client-side app - Next.js client components or plain React, identically. */
export class EmailJSProvider implements EmailProvider {
  constructor(private readonly config: EmailJSConfig) {}

  async send(params: EmailParams): Promise<EmailResult> {
    if (!("templateId" in params)) {
      return {
        success: false,
        message: "EmailJSProvider only supports template-based sends (templateId + templateParams).",
      };
    }

    try {
      const response = await emailjs.send(
        this.config.serviceId,
        params.templateId,
        params.templateParams,
        { publicKey: this.config.publicKey }
      );
      return { success: true, status: response.status, message: response.text, raw: response };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        raw: error,
      };
    }
  }
}
