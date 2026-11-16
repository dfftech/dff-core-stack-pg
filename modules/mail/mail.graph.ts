/**
 * Microsoft Graph Mail Service
 * Sends emails via Microsoft Graph API (Office 365)
 *
 * Config is loaded from app_settings (integration_smtp) with env fallbacks:
 *   - graph_tenant_id  / MAIL_GRAPH_TENANT_ID
 *   - graph_client_id  / MAIL_GRAPH_CLIENT_ID
 *   - graph_client_secret / MAIL_GRAPH_CLIENT_SECRET
 *   - graph_sender     / MAIL_GRAPH_SENDER
 */

import { SETTING_SMTP, settingText } from "../../utils/app-settings";
import { env, logger } from "../../utils/app-util";
import AppSettingService from "../app-setting/app-setting.service";

interface GraphTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

interface GraphMailRecipient {
  emailAddress: {
    address: string;
  };
}

interface GraphMailBody {
  contentType: "HTML" | "Text";
  content: string;
}

interface GraphMailMessage {
  subject: string;
  body: GraphMailBody;
  toRecipients: GraphMailRecipient[];
  ccRecipients?: GraphMailRecipient[];
  bccRecipients?: GraphMailRecipient[];
}

interface GraphSendMailRequest {
  message: GraphMailMessage;
  saveToSentItems: boolean;
}

export class MailGraphService {
  private static tokenCache: { token: string; expiresAt: number } | null = null;

  /**
   * Load Graph settings from provided data or app_settings (integration_smtp) with env fallbacks
   */
  private static async loadGraphConfig(settingData?: Record<string, unknown>): Promise<{
    tenantId: string;
    clientId: string;
    clientSecret: string;
    sender: string;
  }> {
    const data = settingData || await AppSettingService.DataByIdService(SETTING_SMTP);
    const tenantId = settingText(data, "graph_tenant_id") || env("MAIL_GRAPH_TENANT_ID") || "";
    const clientId = settingText(data, "graph_client_id") || env("MAIL_GRAPH_CLIENT_ID") || "";
    const clientSecret = settingText(data, "graph_client_secret") || env("MAIL_GRAPH_CLIENT_SECRET") || "";
    const sender = settingText(data, "graph_sender") || env("MAIL_GRAPH_SENDER") || "";
    logger().info(
      `Graph mail configuration loaded: tenant=${tenantId ? "configured" : "missing"}, client=${clientId ? "configured" : "missing"}, secret=${clientSecret ? "configured" : "missing"}, sender=${sender ? "configured" : "missing"}`
    );
    return { tenantId, clientId, clientSecret, sender };
  }

  /**
   * Get access token from Microsoft Graph
   */
  static async getToken(settingData?: Record<string, unknown>): Promise<string> {
    const log = logger();

    // Return cached token if still valid
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      log.info("Graph mail: using cached access token");
      return this.tokenCache.token;
    }

    const { tenantId, clientId, clientSecret } = await this.loadGraphConfig(settingData);
    if (!tenantId || !clientId || !clientSecret) {
      throw new Error("Graph credentials not configured (graph_tenant_id, graph_client_id, graph_client_secret)");
    }

    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    try {
      log.info("Graph mail: requesting access token");
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
          scope: "https://graph.microsoft.com/.default",
        }).toString(),
      });

      const data = (await response.json()) as GraphTokenResponse;

      if (!response.ok || !data.access_token) {
        throw new Error(
          `Token request failed [${response.status}]: ${data.error}: ${data.error_description}`
        );
      }

      // Cache token with 5-minute buffer before expiration
      this.tokenCache = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 300) * 1000,
      };
      log.info("Graph mail: access token acquired and cached");

      return data.access_token;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(`Graph mail: access token request failed: ${message}`);
      throw new Error(`Failed to get Graph token: ${message}`);
    }
  }

  /**
   * Send email via Microsoft Graph
   */
  static async sendMail(
    to: string | string[],
    subject: string,
    body: string,
    html: boolean = true,
    settingData?: Record<string, unknown>,
    cc?: string | string[],
    bcc?: string | string[]
  ): Promise<{ messageId: string }> {
    const log = logger();

    try {
      const { sender } = await this.loadGraphConfig(settingData);
      if (!sender) {
        throw new Error("Graph sender email not configured (graph_sender)");
      }

      const token = await this.getToken(settingData);

      // Normalize email arrays
      const toRecipients = this.normalizeEmails(to);
      const ccRecipients = cc ? this.normalizeEmails(cc) : [];
      const bccRecipients = bcc ? this.normalizeEmails(bcc) : [];

      if (toRecipients.length === 0) {
        throw new Error("At least one recipient is required");
      }

      // Deliberately exclude subject and body so OTPs and other message content are never logged.
      log.info(
        `Graph mail: sending message from ${sender} to ${toRecipients.length} recipient(s), cc=${ccRecipients.length}, bcc=${bccRecipients.length}, contentType=${html ? "HTML" : "Text"}`
      );

      const mailRequest: GraphSendMailRequest = {
        message: {
          subject,
          body: {
            contentType: html ? "HTML" : "Text",
            content: body,
          },
          toRecipients: toRecipients.map((address) => ({
            emailAddress: { address },
          })),
          ...(ccRecipients.length > 0 && {
            ccRecipients: ccRecipients.map((address) => ({
              emailAddress: { address },
            })),
          }),
          ...(bccRecipients.length > 0 && {
            bccRecipients: bccRecipients.map((address) => ({
              emailAddress: { address },
            })),
          }),
        },
        saveToSentItems: true,
      };

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mailRequest),
        }
      );

      if (response.status !== 202) {
        const errorText = await response.text();
        throw new Error(
          `sendMail failed [${response.status}]: ${errorText}`
        );
      }

      log.info(`Graph mail: message accepted by Microsoft Graph for ${toRecipients.length} recipient(s)`);

      // Return a messageId (Graph doesn't return one, so we generate one)
      return {
        messageId: `graph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(`Failed to send mail via Graph: ${message}`);
      throw new Error(`MAIL_GRAPH_FAILED: ${message}`);
    }
  }

  /**
   * Normalize email addresses to array
   */
  private static normalizeEmails(emails: string | string[]): string[] {
    if (typeof emails === "string") {
      return emails
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);
    }
    return emails.filter((e) => e && e.length > 0);
  }

  /**
   * Check if Graph mail is fully configured (DB settings take priority over env).
   */
  static async isConfigured(settingData?: Record<string, unknown>): Promise<boolean> {
    try {
      const { tenantId, clientId, clientSecret, sender } = await this.loadGraphConfig(settingData);
      return !!(tenantId && clientId && clientSecret && sender);
    } catch {
      return false;
    }
  }
}
