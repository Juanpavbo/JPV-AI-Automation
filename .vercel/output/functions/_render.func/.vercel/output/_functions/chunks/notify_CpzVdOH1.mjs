import nodemailer from 'nodemailer';

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": "https://vexania.vercel.app", "SSR": true};
const env = (key, fallback = "") => Object.assign(__vite_import_meta_env__, { OS: process.env.OS })[key] || fallback;
function getEmailRecipients() {
  return {
    personal: (env("NOTIFY_EMAIL_PERSONAL", "") || "").split(",").map((s) => s.trim()).filter(Boolean),
    institutional: (env("NOTIFY_EMAIL_INSTITUTIONAL", "") || "").split(",").map((s) => s.trim()).filter(Boolean),
    business: (env("NOTIFY_EMAIL_BUSINESS", "") || "").split(",").map((s) => s.trim()).filter(Boolean)
  };
}
function getAllEmailRecipients() {
  const recipients = getEmailRecipients();
  return [...recipients.personal, ...recipients.institutional, ...recipients.business];
}
function buildHtml(data) {
  const serviceInterest = data.service_interest && data.service_interest.length > 0 ? data.service_interest.join(", ") : "No especificado";
  return `
    <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e0e0e0; padding: 24px; border-radius: 12px; border: 1px solid rgba(0,212,255,0.1);">
      <h2 style="color: #00d4ff; margin-bottom: 16px;">📥 Nuevo lead: ${data.name}</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tr><td style="padding: 8px 0; color: #888;">Nombre</td><td style="padding: 8px 0; font-weight: 600;">${data.name}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;">${data.email}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Teléfono</td><td style="padding: 8px 0;">${data.phone || "No especificado"}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Empresa</td><td style="padding: 8px 0;">${data.company || "No especificada"}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Cargo</td><td style="padding: 8px 0;">${data.role || "No especificado"}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Interés principal</td><td style="padding: 8px 0;">${data.interest || "No especificado"}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Servicios de interés</td><td style="padding: 8px 0;">${serviceInterest}</td></tr>
      </table>
      <div style="margin-top: 16px; padding: 16px; background: rgba(0,212,255,0.05); border-radius: 8px; border: 1px solid rgba(0,212,255,0.1);">
        <strong>Mensaje:</strong>
        <p style="margin-top: 8px; white-space: pre-wrap;">${data.message}</p>
      </div>
      <hr style="border-color: rgba(0,212,255,0.1); margin: 24px 0;" />
      <p style="font-size: 12px; color: #606070;">Enviado desde vexania.vercel.app</p>
    </div>
  `;
}
async function sendEmailToGroup(data, emails, groupName) {
  if (emails.length === 0) return [];
  const smtpUser = env("ZOHO_SMTP_USER");
  const smtpPass = env("ZOHO_SMTP_PASS");
  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    await transporter.sendMail({
      from: `"vexanIA" <${smtpUser}>`,
      to: emails.join(", "),
      subject: `[${groupName.toUpperCase()}] Nuevo lead: ${data.name} - ${data.interest || "Sin categoría"}`,
      html: buildHtml(data)
    });
    return [`zoho-${groupName}`];
  }
  const resendKey = env("RESEND_API_KEY");
  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env("RESEND_FROM", "onboarding@resend.dev"),
        to: emails,
        subject: `[${groupName.toUpperCase()}] Nuevo lead: ${data.name} - ${data.interest || "Sin categoría"}`,
        html: buildHtml(data)
      })
    });
    if (res.ok) return [`resend-${groupName}`];
  }
  return [];
}
async function sendTelegram(data) {
  const token = env("TELEGRAM_BOT_TOKEN");
  const chatId = env("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return false;
  const serviceInterest = data.service_interest && data.service_interest.length > 0 ? data.service_interest.join(", ") : "No especificado";
  const text = ["📥 *Nuevo lead*", `👤 ${data.name}`, `📧 ${data.email}`, `📞 ${data.phone || "No especificado"}`, `🏢 ${data.company || "No especificada"}`, `💼 ${data.role || "No especificado"}`, `🏷️ ${data.interest || "Sin categoría"}`, `⚙️ ${serviceInterest}`, "", `📝 ${data.message}`].join("\n");
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown"
    })
  });
  return res.ok;
}
let teamsToken = null;
async function getTeamsToken() {
  const tenantId = env("TEAMS_TENANT_ID");
  const clientId = env("TEAMS_CLIENT_ID");
  const clientSecret = env("TEAMS_CLIENT_SECRET");
  if (!tenantId || !clientId || !clientSecret) return null;
  if (teamsToken && teamsToken.expiresAt > Date.now() + 6e4) {
    return teamsToken.value;
  }
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://service.flow.microsoft.com//.default"
  });
  const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (!json.access_token) return null;
  teamsToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1e3
  };
  return teamsToken.value;
}
async function sendTeams(data) {
  const url = env("TEAMS_WEBHOOK_URL");
  if (!url) return false;
  const serviceInterest = data.service_interest && data.service_interest.length > 0 ? data.service_interest.join(", ") : "No especificado";
  const isDirectWebhook = url.includes("webhook.office.com");
  const payload = isDirectWebhook ? {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    summary: `Nuevo lead: ${data.name}`,
    title: "📥 Nuevo lead recibido",
    sections: [{
      facts: [{
        name: "Nombre",
        value: data.name
      }, {
        name: "Email",
        value: data.email
      }, {
        name: "Teléfono",
        value: data.phone || "No especificado"
      }, {
        name: "Empresa",
        value: data.company || "No especificada"
      }, {
        name: "Cargo",
        value: data.role || "No especificado"
      }, {
        name: "Interés principal",
        value: data.interest || "Sin categoría"
      }, {
        name: "Servicios de interés",
        value: serviceInterest
      }, {
        name: "Mensaje",
        value: data.message
      }]
    }]
  } : {
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    role: data.role,
    interest: data.interest,
    service_interest: serviceInterest,
    message: data.message
  };
  const headers = {
    "Content-Type": "application/json"
  };
  if (!isDirectWebhook) {
    const token = await getTeamsToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  return res.ok;
}
async function notifyContact(data) {
  const recipients = getEmailRecipients();
  const [emailPersonal, emailInstitutional, emailBusiness, telegram, teams] = await Promise.allSettled([sendEmailToGroup(data, recipients.personal, "personal"), sendEmailToGroup(data, recipients.institutional, "institucional"), sendEmailToGroup(data, recipients.business, "empresarial"), sendTelegram(data), sendTeams(data)]);
  return {
    email: [...emailPersonal.status === "fulfilled" ? emailPersonal.value : [], ...emailInstitutional.status === "fulfilled" ? emailInstitutional.value : [], ...emailBusiness.status === "fulfilled" ? emailBusiness.value : []],
    telegram: telegram.status === "fulfilled" && telegram.value,
    teams: teams.status === "fulfilled" && teams.value
  };
}
function buildPaymentHtml(data) {
  const amount = (data.amount_in_cents / 100).toLocaleString("es-CO", {
    style: "currency",
    currency: data.currency,
    minimumFractionDigits: 0
  });
  return `
    <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e0e0e0; padding: 24px; border-radius: 12px; border: 1px solid rgba(0,212,255,0.1);">
      <h2 style="color: #00d4ff; margin-bottom: 16px;">✅ Pago aprobado</h2>
      <p><strong>Cliente:</strong> ${data.customer_name}</p>
      <p><strong>Email:</strong> ${data.customer_email}</p>
      <p><strong>Método:</strong> ${data.payment_method}</p>
      <p><strong>Monto:</strong> ${amount}</p>
      <p><strong>Referencia:</strong> ${data.reference}</p>
      <p><strong>Fecha:</strong> ${data.paid_at ? new Date(data.paid_at).toLocaleString("es-CO", {
    timeZone: "America/Bogota"
  }) : "N/A"}</p>
      <hr style="border-color: rgba(0,212,255,0.1); margin: 24px 0;" />
      <p style="font-size: 12px; color: #606070;">Enviado desde vexania.vercel.app</p>
    </div>
  `;
}
async function sendPaymentEmail(data) {
  const to = getAllEmailRecipients();
  if (to.length === 0) return [];
  const smtpUser = env("ZOHO_SMTP_USER");
  const smtpPass = env("ZOHO_SMTP_PASS");
  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    await transporter.sendMail({
      from: `"vexanIA" <${smtpUser}>`,
      to: to.join(", "),
      subject: `💰 Pago aprobado: ${data.customer_name} - ${(data.amount_in_cents / 100).toLocaleString("es-CO", {
        style: "currency",
        currency: data.currency
      })}`,
      html: buildPaymentHtml(data)
    });
    return ["zoho"];
  }
  const resendKey = env("RESEND_API_KEY");
  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env("RESEND_FROM", "onboarding@resend.dev"),
        to,
        subject: `💰 Pago aprobado: ${data.customer_name}`,
        html: buildPaymentHtml(data)
      })
    });
    if (res.ok) return ["resend"];
  }
  return [];
}
async function sendPaymentTelegram(data) {
  const token = env("TELEGRAM_BOT_TOKEN");
  const chatId = env("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return false;
  const amount = (data.amount_in_cents / 100).toLocaleString("es-CO", {
    style: "currency",
    currency: data.currency,
    minimumFractionDigits: 0
  });
  const text = ["💰 *Pago aprobado*", `👤 ${data.customer_name}`, `📧 ${data.customer_email}`, `💳 ${data.payment_method}`, `💵 ${amount}`, `🔖 ${data.reference}`, `🕐 ${data.paid_at ? new Date(data.paid_at).toLocaleString("es-CO", {
    timeZone: "America/Bogota"
  }) : "N/A"}`].join("\n");
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown"
    })
  });
  return res.ok;
}
async function sendPaymentTeams(data) {
  const url = env("TEAMS_WEBHOOK_URL");
  if (!url) return false;
  const amount = (data.amount_in_cents / 100).toLocaleString("es-CO", {
    style: "currency",
    currency: data.currency,
    minimumFractionDigits: 0
  });
  const isDirectWebhook = url.includes("webhook.office.com");
  const payload = isDirectWebhook ? {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    summary: `Pago aprobado: ${data.customer_name}`,
    title: "💰 Pago aprobado",
    sections: [{
      facts: [{
        name: "Cliente",
        value: data.customer_name
      }, {
        name: "Email",
        value: data.customer_email
      }, {
        name: "Método",
        value: data.payment_method
      }, {
        name: "Monto",
        value: amount
      }, {
        name: "Referencia",
        value: data.reference
      }, {
        name: "Fecha",
        value: data.paid_at ? new Date(data.paid_at).toLocaleString("es-CO", {
          timeZone: "America/Bogota"
        }) : "N/A"
      }]
    }]
  } : {
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    amount,
    payment_method: data.payment_method,
    reference: data.reference,
    paid_at: data.paid_at
  };
  const headers = {
    "Content-Type": "application/json"
  };
  if (!isDirectWebhook) {
    const token = await getTeamsToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  return res.ok;
}
async function notifyPayment(data) {
  const [email, telegram, teams] = await Promise.allSettled([sendPaymentEmail(data), sendPaymentTelegram(data), sendPaymentTeams(data)]);
  return {
    email: email.status === "fulfilled" ? email.value : [],
    telegram: telegram.status === "fulfilled" && telegram.value,
    teams: teams.status === "fulfilled" && teams.value
  };
}

export { notifyPayment as a, notifyContact as n };
