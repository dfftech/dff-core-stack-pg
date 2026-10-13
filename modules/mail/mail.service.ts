import { CallHbs, type RequestBodyType } from "dff-util";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";
import TemplateService from "../template/template.service";
import type { MailSendDto } from "./mail.dto";
import { MailHelper } from "./mail.helper";

export default class MailService {
  static async SendService(input: MailSendDto) {
    const log = logger();
    try {
      if (!input.templateId || !input.to) {
        throw new AppError("INVALID_DATA");
      }

      const row = await TemplateService.FindByNameLangService(
        input.templateId,
        input.lang
      );
      if (!row?.content) throw new AppError("INVALID_DATA");

      const html = await CallHbs(row.content, { data: input.data ?? {} } as RequestBodyType);
      const rendered = Array.isArray(html) ? html.join("") : String(html);
      let subject = (input.subject || row.subject || "").trim();
      if (subject.includes("{{")) {
        const sub = await CallHbs(subject, { data: input.data ?? {} } as RequestBodyType);
        subject = Array.isArray(sub) ? sub.join("") : String(sub);
      }
      if (!subject) throw new AppError("INVALID_DATA");

      const result = await MailHelper.SendMail(
        input.to,
        subject,
        rendered,
        input.attachments ?? []
      );
      log.info(`Sent mail to ${input.to} using template ${row.id}`);
      return result;
    } catch (error) {
      log.error(`Failed to send mail: ${error}`);
      const message = error instanceof Error ? error.message : String(error);
      if (message === "MAIL_NOT_CONFIGURED") throw new AppError(message);
      throw error;
    }
  }
}
