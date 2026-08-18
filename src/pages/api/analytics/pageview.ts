import type { APIRoute } from 'astro';
import { insertPageView } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();

    // Validar campos requeridos
    if (!payload.session_id || !payload.path) {
      return new Response(JSON.stringify({ error: 'session_id y path son requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await insertPageView({
      session_id: payload.session_id,
      path: payload.path,
      referrer: payload.referrer ?? null,
      utm_source: payload.utm_source ?? null,
      utm_medium: payload.utm_medium ?? null,
      utm_campaign: payload.utm_campaign ?? null,
      utm_content: payload.utm_content ?? null,
      utm_term: payload.utm_term ?? null,
      user_agent: payload.user_agent ?? null,
      device_type: payload.device_type ?? null,
      browser: payload.browser ?? null,
      os: payload.os ?? null,
      duration_seconds: payload.duration_seconds ?? null
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Pageview tracking error:', error);
    // No fallar silenciosamente para no afectar UX
    return new Response(JSON.stringify({ error: 'Tracking error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};