import type { RequestBodyType } from "../../utils/app-types";

export type MailSendDto = {
  templateId: string;
  lang?: string;
  data?: RequestBodyType;
  to: string;
  subject?: string;
  attachments?: string[];
};
