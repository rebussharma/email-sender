import type { EmailProvider, EmailParams, EmailResult } from "./types";

export class EmailSender {
  constructor(private readonly provider: EmailProvider) {}

  send(params: EmailParams): Promise<EmailResult> {
    return this.provider.send(params);
  }
}
