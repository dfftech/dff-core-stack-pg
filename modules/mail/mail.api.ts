import { api } from "encore.dev/api";
import type { ResponseType } from "../../utils/app-types";
import type { MailSendDto } from "./mail.dto";
import MailService from "./mail.service";

export const SendMail = api<MailSendDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/mail-send",
  },
  async (input) => {
    return MailService.SendService(input);
  }
);
