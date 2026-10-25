import type { RequestBodyType } from "dff-util";

export type MailAttachmentDto = {
  path: string;
  cid?: string;
  filename?: string;
};

export type MailSendDto = {
  templateId: string;
  lang?: string;
  data?: RequestBodyType;
  to: string;
  subject?: string;
  attachments?: MailAttachmentDto[];
};
