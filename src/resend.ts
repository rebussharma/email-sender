import { Resend } from "resend";
import type { EmailProvider, EmailParams, EmailResult } from "./types";

export interface ResendServerConfig {
  apiKey: string;
  /* Default "from" address/name */
  from: string;
}

/**
 * Resend's template variables only accept string | number, while our
 * EmailParams.templateParams stays Record<string, unknown> for flexibility
 * (and to match EmailJS, which accepts anything). This converts safely at
 * the boundary instead of narrowing the shared public type.
 */
function toResendVariables(params: Record<string, unknown>): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    result[key] = typeof value === "number" ? value : String(value);
  }
  return result;
}

/**
 * Use inside server-side code only: Next.js Server Actions, Route Handlers,
 * or a standalone backend/serverless function for non-Next.js sites.
 * Never import this in client-side code - it holds the secret API key.
 */
export class ResendServerProvider implements EmailProvider {
  private readonly resend: Resend;
  private readonly defaultFrom: string;

  constructor(config: ResendServerConfig) {
    this.resend = new Resend(config.apiKey);
    this.defaultFrom = config.from;
  }

  async send(params: EmailParams): Promise<EmailResult> {
    if (!params.to) {
      return { success: false, message: "Resend requires a 'to' address." };
    }

    const from = params.from ?? this.defaultFrom;

    const { data, error } =
      "templateId" in params
        ? await this.resend.emails.send({
            from,
            to: params.to,
            template: { id: params.templateId, variables: toResendVariables(params.templateParams) },
          })
        : await this.resend.emails.send({
            from,
            to: params.to,
            subject: params.subject,
            html: params.html,
            text: params.text,
          });

    if (error) {
      return { success: false, message: error.message, raw: error };
    }
    return { success: true, message: "sent", raw: data };
  }
}