import type { APIRoute } from 'astro';
import { insertContact } from '../../lib/supabase';
import { notifyContact } from '../../lib/notify';
import { rateLimit, clientIp } from '../../lib/rateLimit';
import { z } from 'zod';

export const prerender = false;

const contactSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email(),
  interes: z.string().min(1),
  mensaje: z.string().min(10).max(5000)
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const ip = clientIp(request);
    const ipLimit = rateLimit(`contact:${ip}`, 5, 60_000);
    if (!ipLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': String(ipLimit.retryAfter) }
      });
    }

    const formData = await request.formData();

    const botField = formData.get('bot-field')?.toString() || '';
    if (botField) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = {
      nombre: formData.get('nombre')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      interes: formData.get('interes')?.toString() || '',
      mensaje: formData.get('mensaje')?.toString() || ''
    };

    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Datos inválidos', details: parsed.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailLimit = rateLimit(`contact-email:${parsed.data.email}`, 3, 60_000);
    if (!emailLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': String(emailLimit.retryAfter) }
      });
    }

    const contact = await insertContact({
      name: parsed.data.nombre,
      email: parsed.data.email,
      interest: parsed.data.interes,
      message: parsed.data.mensaje
    });

    try {
      const notify = await notifyContact({
        name: parsed.data.nombre,
        email: parsed.data.email,
        interest: parsed.data.interes,
        message: parsed.data.mensaje
      });
      console.log('Notificación enviada:', JSON.stringify(notify));
      return new Response(JSON.stringify({ success: true, contact, notify }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (emailError) {
      console.error('Error enviando notificación:', emailError);
    }

    return new Response(JSON.stringify({ success: true, contact }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};