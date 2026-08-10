import type { APIRoute } from 'astro';
import { z } from 'zod';
import { queryRuesByNit, queryRuesByName, ruesContext } from '../../lib/rues';
import { rateLimit, clientIp } from '../../lib/rateLimit';

export const prerender = false;

const querySchema = z.object({
  q: z.string().min(3).max(200)
});

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const ip = clientIp(request);
    const ipLimit = rateLimit(`empresa:${ip}`, 30, 60_000);
    if (!ipLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': String(ipLimit.retryAfter) }
      });
    }

    const q = url.searchParams.get('q') ?? '';
    const parsed = querySchema.safeParse({ q });
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Parámetro "q" inválido (mínimo 3 caracteres)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const digits = parsed.data.q.replace(/[^0-9]/g, '');
    const matches = /^\d{6,10}$/.test(digits)
      ? await queryRuesByNit(parsed.data.q)
      : await queryRuesByName(parsed.data.q, 5);

    return new Response(JSON.stringify({ query: parsed.data.q, matches }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Empresa API error:', error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: 'No se pudo consultar el RUES en este momento' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};