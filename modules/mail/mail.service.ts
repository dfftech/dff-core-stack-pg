import { CallHbs } from "dff-util";
import type { RequestBodyType, ResponseType } from "../../utils/app-types";
import { logger } from "../../utils/app-util";
import TemplateFileService from "../template-file/template-file.service";
import type { MailSendDto } from "./mail.dto";
import { MailHelper } from "./mail.helper";

export default class MailService {
  static async SendService(input: MailSendDto): Promise<ResponseType> {
    const log = logger();
    try {
      if (!input.templateId || !input.to) {
        return { data: null, error: "INVALID_DATA" };
      }

      const row = await TemplateFileService.FindByNameLangService(
        input.templateId,
        input.lang
      );
      if (!row?.template) return { data: null, error: "INVALID_DATA" };

      const html = await CallHbs(row.template, { data: input.data ?? {} } as RequestBodyType);
      const rendered = Array.isArray(html) ? html.join("") : String(html);
      let subject = (input.subject || row.subject || "").trim();
      if (subject.includes("{{")) {
        const sub = await CallHbs(subject, { data: input.data ?? {} } as RequestBodyType);
        subject = Array.isArray(sub) ? sub.join("") : String(sub);
      }
      if (!subject) return { data: null, error: "INVALID_DATA" };

      const result = await MailHelper.SendMail(
        input.to,
        subject,
        rendered,
        input.attachments ?? []
      );
      log.info(`Sent mail to ${input.to} using template ${row.id}`);
      return { data: result, status: "EMAIL_SENT_SUCCESSFULLY" };
    } catch (error) {
      log.error(`Failed to send mail: ${error}`);
      const message = error instanceof Error ? error.message : String(error);
      if (message === "MAIL_NOT_CONFIGURED") {
        return { data: null, error: message };
      }
      throw error;
    }
  }
}
