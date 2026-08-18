import { a as insertContact, c as createLead, l as logActivity } from '../../chunks/supabase_BRJlPDF6.mjs';
import { n as notifyContact } from '../../chunks/notify_CpzVdOH1.mjs';
import { c as clientIp, r as rateLimit } from '../../chunks/rateLimit_f48-jaoh.mjs';
import { z } from 'zod';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const contactSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().min(3).max(200).refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\+?[0-9\s\-()]{6,20}$/.test(v), "Ingresa un correo o un WhatsApp válido"),
  interes: z.string().min(1),
  mensaje: z.string().max(5e3).optional().default(""),
  empresa: z.string().max(100).optional(),
  cargo: z.string().max(100).optional(),
  telefono: z.string().max(30).optional(),
  servicios_interes: z.array(z.string()).optional()
});
const POST = async ({
  request
}) => {
  try {
    const ip = clientIp(request);
    const ipLimit = rateLimit(`contact:${ip}`, 5, 6e4);
    if (!ipLimit.allowed) {
      return new Response(JSON.stringify({
        error: "Demasiadas solicitudes"
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(ipLimit.retryAfter)
        }
      });
    }
    const formData = await request.formData();
    const botField = formData.get("bot-field")?.toString() || "";
    if (botField) {
      return new Response(JSON.stringify({
        success: true
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const data = {
      nombre: formData.get("nombre")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      interes: formData.get("interes")?.toString() || "",
      mensaje: formData.get("mensaje")?.toString() || "",
      empresa: formData.get("empresa")?.toString() || "",
      cargo: formData.get("cargo")?.toString() || "",
      telefono: formData.get("telefono")?.toString() || "",
      servicios_interes: formData.getAll("servicios_interes").map((v) => v.toString())
    };
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      return new Response(JSON.stringify({
        error: "Datos inválidos",
        details: parsed.error.flatten()
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.data.email);
    const contacto = parsed.data.email;
    const email = isEmail ? contacto : `${contacto.replace(/[^0-9]/g, "").slice(-12)}@contacto.vexania.co`;
    const phone = isEmail ? parsed.data.telefono ?? "" : contacto;
    const emailLimit = rateLimit(`contact-email:${parsed.data.email}`, 3, 6e4);
    if (!emailLimit.allowed) {
      return new Response(JSON.stringify({
        error: "Demasiadas solicitudes"
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(emailLimit.retryAfter)
        }
      });
    }
    const contact = await insertContact({
      name: parsed.data.nombre,
      email,
      interest: parsed.data.interes,
      message: parsed.data.mensaje
    });
    let leadId = null;
    try {
      leadId = await createLead({
        contact_id: contact.id,
        name: parsed.data.nombre,
        email,
        phone: phone || null,
        company: parsed.data.empresa || null,
        role: parsed.data.cargo || null,
        source: "web",
        interest: parsed.data.interes,
        interest_detail: parsed.data.mensaje,
        service_interest: (parsed.data.servicios_interes ?? []).length > 0 ? parsed.data.servicios_interes : null,
        utm_source: formData.get("utm_source")?.toString() || null,
        utm_medium: formData.get("utm_medium")?.toString() || null,
        utm_campaign: formData.get("utm_campaign")?.toString() || null,
        utm_content: formData.get("utm_content")?.toString() || null,
        utm_term: formData.get("utm_term")?.toString() || null,
        referrer: formData.get("referrer")?.toString() || null,
        landing_page: "/#contacto",
        assigned_to: null
      });
      console.log("Lead creado en CRM:", leadId);
      if (leadId) {
        await logActivity({
          lead_id: leadId,
          type: "note",
          subject: "Lead creado desde formulario web",
          description: `Nuevo lead registrado desde formulario de contacto. Interés: ${parsed.data.interes}`,
          outcome: "positive"
        });
      }
    } catch (crmError) {
      console.error("Error creando lead en CRM:", crmError);
    }
    try {
      const notify = await notifyContact({
        name: parsed.data.nombre,
        email,
        interest: parsed.data.interes,
        message: parsed.data.mensaje,
        service_interest: (parsed.data.servicios_interes ?? []).length > 0 ? parsed.data.servicios_interes : void 0,
        company: parsed.data.empresa || void 0,
        role: parsed.data.cargo || void 0,
        phone: phone || void 0
      });
      console.log("Notificación enviada:", JSON.stringify(notify));
      return new Response(JSON.stringify({
        success: true,
        contact,
        leadId,
        notify
      }), {
        status: 201,
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (emailError) {
      console.error("Error enviando notificación:", emailError);
    }
    return new Response(JSON.stringify({
      success: true,
      contact,
      leadId
    }), {
      status: 201,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return new Response(JSON.stringify({
      error: "Error interno del servidor"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
