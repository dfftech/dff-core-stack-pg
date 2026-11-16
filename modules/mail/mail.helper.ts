import { marked } from 'marked';
import { createTransport, type Transporter } from 'nodemailer';
import { SETTING_SMTP, settingNumber, settingText } from '../../utils/app-settings';
import { env, logger } from '../../utils/app-util';
import AppSettingService from '../app-setting/app-setting.service';
import type { MailAttachmentDto } from './mail.dto';
import { MailGraphService } from './mail.graph';

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
  static LoadSmtp(data: Record<string, unknown>): SmtpConfig {
    const user = settingText(data, 'username') || env('MAIL_USER') || '';
    const pass = settingText(data, 'password') || env('MAIL_PASS') || '';
    const host = settingText(data, 'host') || env('MAIL_HOST') || '';
    const service = settingText(data, 'service') || env('MAIL_SERVICE') || '';
    const fromEmail = settingText(data, 'from_email') || env('MAIL_FROM_EMAIL') || user;
    const fromName = settingText(data, 'from_name') || env('MAIL_FROM_NAME') || 'No Reply';
    const encryption = (settingText(data, 'encryption') || env('MAIL_ENCRYPTION') || '').toLowerCase();
    const port = settingNumber(data, 'port', Number(env('MAIL_PORT')) || 587);
    const secure = data.secure === true || env('MAIL_SECURE') === 'true' || encryption === 'ssl' || port === 465;
    const from = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;
    return { host, port, user, pass, service, secure, from };
  }

  static CreateTransport(data: Record<string, unknown>): { transporter: Transporter; from: string } {
    const smtp = this.LoadSmtp(data);
    if (!smtp.user || !smtp.pass || !smtp.from) {
      throw new Error('MAIL_NOT_CONFIGURED');
    }
    const transporter = smtp.host
      ? createTransport({
          host: smtp.host,
          port: smtp.port,
          secure: smtp.secure,
          auth: { user: smtp.user, pass: smtp.pass },
        })
      : createTransport({
          service: smtp.service || 'outlook',
          auth: { user: smtp.user, pass: smtp.pass },
        });
    return { transporter, from: smtp.from };
  }

  static async SendMail(to: string, subject: string, markdown: string, attachments: MailAttachmentDto[] = []) {
    const log = logger();
    // Load settings once and pass to all methods
    const settingData = await AppSettingService.DataByIdService(SETTING_SMTP);
    // const service = settingText(settingData, 'service') || env('MAIL_SERVICE') || '';
    const service = 'graph';
    const html = await marked.parse(markdown);
    if (service.toLowerCase() === 'graph') {
      const sender = settingText(settingData, 'graph_sender') || env('MAIL_GRAPH_SENDER') || '';
      log.info(`Mail: sending via Graph from ${sender} to ${to}`);
      return MailGraphService.sendMail(to, subject, html, true, settingData);
    }

    const { transporter, from } = this.CreateTransport(settingData);
    log.info(`Mail: sending via SMTP from ${from} to ${to}`);
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html: html,
      attachments: attachments.map((item) => ({
        ...(item.path.startsWith('http://') || item.path.startsWith('https://')
          ? { href: item.path }
          : { path: item.path }),
        ...(item.cid ? { cid: item.cid } : {}),
        ...(item.filename ? { filename: item.filename } : {}),
      })),
    });
    return { messageId: info.messageId };
  }
}
