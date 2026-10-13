import type { RequestBodyType } from "dff-util";

export type MailSendDto = {
  templateId: string;
  lang?: string;
  data?: RequestBodyType;
  to: string;
  subject?: string;
  attachments?: string[];
};
