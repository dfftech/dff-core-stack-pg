import { createTransport, type Transporter } from "nodemailer";
import { env } from "../../utils/app-util";
import { SETTING_SMTP, settingNumber, settingText } from "../../utils/app-settings";
import AppSettingService from "../app-setting/app-setting.service";

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  service: string;
  secure: boolean;
  from: string;
};

export class MailHelper {
  static async LoadSmtp(): Promise<SmtpConfig> {
    const data = await AppSettingService.DataByIdService(SETTING_SMTP);
    const user = settingText(data, "username") || env("MAIL_USER") || "";
    const pass = settingText(data, "password") || env("MAIL_PASS") || "";
    const host = settingText(data, "host");
    const service = settingText(data, "service") || env("MAIL_SERVICE") || "";
    const fromEmail = settingText(data, "from_email") || user;
    const fromName = settingText(data, "from_name");
    const encryption = settingText(data, "encryption").toLowerCase();
    const port = settingNumber(data, "port", 587);
    const secure =
      data.secure === true || encryption === "ssl" || port === 465;
    const from = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;
    return { host, port, user, pass, service, secure, from };
  }

  static async CreateTransport(): Promise<{ transporter: Transporter; from: string }> {
    const smtp = await this.LoadSmtp();
    if (!smtp.user || !smtp.pass || !smtp.from) {
      throw new Error("MAIL_NOT_CONFIGURED");
    }
    const transporter = smtp.host
      ? createTransport({
          host: smtp.host,
          port: smtp.port,
          secure: smtp.secure,
          auth: { user: smtp.user, pass: smtp.pass },
        })
      : createTransport({
          service: smtp.service || "outlook",
          auth: { user: smtp.user, pass: smtp.pass },
        });
    return { transporter, from: smtp.from };
  }

  static async SendMail(
    to: string,
    subject: string,
    html: string,
    attachments: string[] = []
  ) {
    const { transporter, from } = await this.CreateTransport();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      attachments: attachments.map((item) =>
        item.startsWith("http://") || item.startsWith("https://")
          ? { href: item }
          : { path: item }
      ),
    });
    return { messageId: info.messageId };
  }
}
