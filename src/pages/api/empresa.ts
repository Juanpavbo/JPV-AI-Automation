import type { APIRoute } from 'astro';
import { z } from 'zod';
import { queryRuesByNit, queryRuesByName, queryRuesByFilters, queryRuesCountsByMunicipio } from '../../lib/rues';
import { rateLimit, clientIp } from '../../lib/rateLimit';

export const prerender = false;

const querySchema = z.object({
  q: z.string().min(3).max(200)
});

const filterSchema = z.object({
  municipio: z.string().min(2).max(100).optional(),
  departamento: z.string().min(3).max(60).optional(),
  camara: z.string().min(3).max(120).optional(),
  tamano: z.enum(['01', '02', '03', '00']).optional(),
  ciiu: z.string().min(2).max(10).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
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

    // Modo "filtros" (búsqueda por municipio/cámara/tamaño/CIIU): requiere la BD local de Supabase
    const hasFilter = ['municipio', 'departamento', 'camara', 'tamano', 'ciiu'].some((k) => url.searchParams.has(k));
    if (hasFilter) {
      const parsed = filterSchema.safeParse(Object.fromEntries(url.searchParams));
      if (!parsed.success) {
        return new Response(JSON.stringify({ error: 'Filtros inválidos', details: parsed.error.flatten() }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const matches = await queryRuesByFilters(parsed.data);
      return new Response(JSON.stringify({ mode: 'filters', filters: parsed.data, matches }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Modo "conteo por municipio": ?counts=1[&departamento=BOGOTA]
    if (url.searchParams.get('counts') === '1') {
      const departamento = url.searchParams.get('departamento') ?? undefined;
      const counts = await queryRuesCountsByMunicipio(departamento);
      return new Response(JSON.stringify({ mode: 'counts', departamento: departamento ?? null, counts }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
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