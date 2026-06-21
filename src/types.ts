export interface BaseEmailParams {
  /** Optional - some EmailJS templates already define recipient internally. */
  to?: string;
  /** Override the provider's default "from" for this one send, if needed. */
  from?: string;
}

export interface TemplateEmail {
  templateId: string;
  templateParams: Record<string, unknown>;
}

export interface ContentEmail {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Pick ONE mode per call:
 *  - templateId + templateParams -> provider-hosted template
 *  - subject + html              -> hand-rolled HTML built locally
 */
export type EmailParams = BaseEmailParams & (TemplateEmail | ContentEmail);

export interface EmailResult {
  success: boolean;
  status?: number;
  message?: string;
  raw?: unknown;
}

export interface EmailProvider {
  send(params: EmailParams): Promise<EmailResult>;
}
