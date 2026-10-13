import { api } from "encore.dev/api";
import type { ResponseType } from "dff-util";
import type { MailSendDto } from "./mail.dto";
import MailService from "./mail.service";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";

export const SendMail = api<MailSendDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/mail-send",
  },
  async (input) => {
    try {
      const data = await MailService.SendService(input);
      return { data, status: "EMAIL_SENT_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to send mail: ${error}`);
      throw error;
    }
  }
);
