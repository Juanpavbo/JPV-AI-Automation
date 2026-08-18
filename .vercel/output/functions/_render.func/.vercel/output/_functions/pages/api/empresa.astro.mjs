import { z } from 'zod';
import { q as queryRuesByFilters, a as queryRuesCountsByMunicipio, b as queryRuesByNit, c as queryRuesByName } from '../../chunks/rues_DNxbqaT0.mjs';
import { c as clientIp, r as rateLimit } from '../../chunks/rateLimit_f48-jaoh.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const querySchema = z.object({
  q: z.string().min(3).max(200)
});
const filterSchema = z.object({
  municipio: z.string().min(2).max(100).optional(),
  departamento: z.string().min(3).max(60).optional(),
  camara: z.string().min(3).max(120).optional(),
  tamano: z.enum(["01", "02", "03", "00"]).optional(),
  ciiu: z.string().min(2).max(10).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});
const GET = async ({
  request,
  url
}) => {
  try {
    const ip = clientIp(request);
    const ipLimit = rateLimit(`empresa:${ip}`, 30, 6e4);
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
    const hasFilter = ["municipio", "departamento", "camara", "tamano", "ciiu"].some((k) => url.searchParams.has(k));
    if (hasFilter) {
      const parsed2 = filterSchema.safeParse(Object.fromEntries(url.searchParams));
      if (!parsed2.success) {
        return new Response(JSON.stringify({
          error: "Filtros inválidos",
          details: parsed2.error.flatten()
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        });
      }
      const matches2 = await queryRuesByFilters(parsed2.data);
      return new Response(JSON.stringify({
        mode: "filters",
        filters: parsed2.data,
        matches: matches2
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    if (url.searchParams.get("counts") === "1") {
      const departamento = url.searchParams.get("departamento") ?? void 0;
      const counts = await queryRuesCountsByMunicipio(departamento);
      return new Response(JSON.stringify({
        mode: "counts",
        departamento: departamento ?? null,
        counts
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const q = url.searchParams.get("q") ?? "";
    const parsed = querySchema.safeParse({
      q
    });
    if (!parsed.success) {
      return new Response(JSON.stringify({
        error: 'Parámetro "q" inválido (mínimo 3 caracteres)'
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const digits = parsed.data.q.replace(/[^0-9]/g, "");
    const matches = /^\d{6,10}$/.test(digits) ? await queryRuesByNit(parsed.data.q) : await queryRuesByName(parsed.data.q, 5);
    return new Response(JSON.stringify({
      query: parsed.data.q,
      matches
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Empresa API error:", error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({
      error: "No se pudo consultar el RUES en este momento"
    }), {
      status: 502,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
