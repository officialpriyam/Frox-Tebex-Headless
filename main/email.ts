import nodemailer from "nodemailer";
import { storage } from "./storage";
import { EmailTemplate, SiteSettings } from "@data/schema";

export async function sendTemplatedEmail(
  to: string,
  templateType: string,
  templateData: Record<string, string | number>
) {
  try {
    const settings = await storage.getSettings();
    if (!settings || !settings.smtpHost) {
      console.warn("[Email] SMTP not configured, skipping email to:", to);
      return;
    }

    const templates = await storage.getEmailTemplates();
    const template = templates.find((t) => t.type === templateType && t.active);

    if (!template) {
      console.warn(`[Email] Active template of type "${templateType}" not found.`);
      return;
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: settings.smtpSecure ?? (settings.smtpPort === 465),
      auth: {
        user: settings.smtpUser || "",
        pass: settings.smtpPass || "",
      },
    });

    // Replace variables in subject and body
    let subject = template.subject;
    let html = template.bodyHtml;

    // Default system variables
    const finalData = {
      ...templateData,
      site_name: settings.serverName || settings.appName || "Our Server",
    };

    Object.entries(finalData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(regex, String(value));
      html = html.replace(regex, String(value));
    });

    // Send the email
    const fromEmail = settings.smtpFrom || settings.smtpUser || "noreply@example.com";
    const fromName = settings.serverName || settings.appName || "SnapTebex";

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    console.log(`[Email] Message sent: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    throw error;
  }
}
