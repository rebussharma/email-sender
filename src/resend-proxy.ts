import type { EmailProvider, EmailParams, EmailResult } from "./types";

export interface ResendProxyConfig {
  /**
   * URL of a deployed endpoint running ResendServerProvider. For plain
   * React sites (no server runtime), deploy ONE small shared proxy
   * (Vercel/Cloudflare function) and point every such site at it -
   * `from` is already part of EmailParams, so one proxy can serve
   * multiple brands/sites as long as they share a Resend account.
   */
  proxyUrl: string;
}

/** No SDK dependency - just fetch. Safe to import in any client bundle. */
export class ResendProxyProvider implements EmailProvider {
  constructor(private readonly config: ResendProxyConfig) {}

  async send(params: EmailParams): Promise<EmailResult> {
    try {
      const response = await fetch(this.config.proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: data?.message ?? response.statusText,
          raw: data,
        };
      }

      return { success: true, status: response.status, message: "Email sent", raw: data };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        raw: error,
      };
    }
  }
}
