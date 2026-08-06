import nodemailer from 'nodemailer';

export interface ContactData {
  name: string;
  email: string;
  interest: string | null;
  message: string;
}

export interface NotifyResult {
  email: string[];
  telegram: boolean;
  teams: boolean;
}

const env = (key: string, fallback = ''): string => import.meta.env[key] || fallback;

function emailRecipients(): string[] {
  const raw = env('NOTIFY_EMAILS', env('CONTACT_EMAIL', ''));
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildHtml(data: ContactData): string {
  return `
    <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e0e0e0; padding: 24px; border-radius: 12px; border: 1px solid rgba(0,212,255,0.1);">
      <h2 style="color: #00d4ff; margin-bottom: 16px;">Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Interés:</strong> ${data.interest || 'No especificado'}</p>
      <div style="margin-top: 16px; padding: 16px; background: rgba(0,212,255,0.05); border-radius: 8px; border: 1px solid rgba(0,212,255,0.1);">
        <strong>Mensaje:</strong>
        <p style="margin-top: 8px; white-space: pre-wrap;">${data.message}</p>
      </div>
      <hr style="border-color: rgba(0,212,255,0.1); margin: 24px 0;" />
      <p style="font-size: 12px; color: #606070;">Enviado desde jpv-ai-automation.vercel.app</p>
    </div>
  `;
}

async function sendEmail(data: ContactData): Promise<string[]> {
  const to = emailRecipients();
  if (to.length === 0) return [];

  const smtpUser = env('ZOHO_SMTP_USER');
  const smtpPass = env('ZOHO_SMTP_PASS');

  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: { user: smtpUser, pass: smtpPass }
    });
    await transporter.sendMail({
      from: `"JPV AI & Automation" <${smtpUser}>`,
      to: to.join(', '),
      subject: `Nuevo contacto: ${data.name} - ${data.interest || 'Sin categoría'}`,
      html: buildHtml(data)
    });
    return ['zoho'];
  }

  const resendKey = env('RESEND_API_KEY');
  if (resendKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env('RESEND_FROM', 'onboarding@resend.dev'),
        to,
        subject: `Nuevo contacto: ${data.name} - ${data.interest || 'Sin categoría'}`,
        html: buildHtml(data)
      })
    });
    if (res.ok) return ['resend'];
  }

  return [];
}

async function sendTelegram(data: ContactData): Promise<boolean> {
  const token = env('TELEGRAM_BOT_TOKEN');
  const chatId = env('TELEGRAM_CHAT_ID');
  if (!token || !chatId) return false;

  const text = [
    '📥 *Nuevo contacto*',
    `👤 ${data.name}`,
    `📧 ${data.email}`,
    `🏷️ ${data.interest || 'Sin categoría'}`,
    '',
    `📝 ${data.message}`
  ].join('\n');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
  });
  return res.ok;
}

async function sendTeams(data: ContactData): Promise<boolean> {
  const url = env('TEAMS_WEBHOOK_URL');
  if (!url) return false;

  const isDirectWebhook = url.includes('webhook.office.com');

  const payload = isDirectWebhook
    ? {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        summary: `Nuevo contacto: ${data.name}`,
        title: '📥 Nuevo contacto recibido',
        sections: [
          {
            facts: [
              { name: 'Nombre', value: data.name },
              { name: 'Email', value: data.email },
              { name: 'Interés', value: data.interest || 'Sin categoría' },
              { name: 'Mensaje', value: data.message }
            ]
          }
        ]
      }
    : {
        name: data.name,
        email: data.email,
        interest: data.interest || 'Sin categoría',
        message: data.message
      };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.ok;
}

export async function notifyContact(data: ContactData): Promise<NotifyResult> {
  const [email, telegram, teams] = await Promise.allSettled([
    sendEmail(data),
    sendTelegram(data),
    sendTeams(data)
  ]);

  return {
    email: email.status === 'fulfilled' ? email.value : [],
    telegram: telegram.status === 'fulfilled' && telegram.value,
    teams: teams.status === 'fulfilled' && teams.value
  };
}
