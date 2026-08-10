import type { APIRoute } from 'astro';
import { z } from 'zod';
import { SYSTEM_PROMPT, CHAT_MODEL, type ChatMessage } from '../../lib/chat';
import { queryRuesByNit, queryRuesByName, ruesContext } from '../../lib/rues';
import { rateLimit, clientIp } from '../../lib/rateLimit';

export const prerender = false;

const MAX_HISTORY = 20;

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000)
      })
    )
    .min(1)
    .max(MAX_HISTORY)
});

const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const COMPANY_HINTS =
  /empresa|compañia|compa\u00f1\u00eda|sociedad|nit|raz\u00f3n social|razon social|rues|c\u00e1mara de comercio|camara de comercio|representante legal|registro mercantil|actividad econ\u00f3mica|matr\u00edcula|registrada|inscrita|qu\u00e9 es|quien es|qui\u00e9n es/i;

function extractNit(text: string): string | null {
  const digits = text.replace(/[^0-9]/g, '');
  const m = digits.match(/\d{6,10}/);
  return m ? m[0] : null;
}

function looksLikeCompanyQuery(text: string): boolean {
  return COMPANY_HINTS.test(text);
}

function extractCompanyName(text: string): string {
  const cleaned = text
    .replace(/^(por favor|podr\u00edas|puedes|me puedes|consulta|busca|averigua|dime|cu\u00e9ntame|quiero saber|necesito saber|sabes|h\u00e1blame|hablame|informame|inf\u00f3rmame)/i, '')
    .replace(/\b(empresa|compa\u00f1\u00eda|sociedad|nit|raz\u00f3n social|razon social)\b/gi, '')
    .replace(/\b(de|del|la|el|los|las|que|qu\u00e9|es|sobre|acerca|como|c\u00f3mo|quien|qui\u00e9n|esta|este|est\u00e1|info|informaci\u00f3n|sabes|saber|hay|alguna|alg\u00fan)\b/gi, ' ')
    .replace(/[?¿.!¡:;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const ip = clientIp(request);
    const ipLimit = rateLimit(`chat:${ip}`, 30, 60_000);
    if (!ipLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': String(ipLimit.retryAfter) }
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'JSON inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Solicitud inválida', details: parsed.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = import.meta.env.NVIDIA_API_KEY;
    if (!apiKey) {
      console.error('NVIDIA_API_KEY no configurada');
      return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const lastMessage = parsed.data.messages[parsed.data.messages.length - 1];
    const userText = lastMessage.content.trim();

    let ruesContextText: string | null = null;
    if (looksLikeCompanyQuery(userText)) {
      const nit = extractNit(userText);
      try {
        const matches = nit ? await queryRuesByNit(nit) : await queryRuesByName(extractCompanyName(userText));
        ruesContextText = ruesContext(matches);
      } catch (error) {
        console.error('RUES query error:', error instanceof Error ? error.message : error);
      }
    }

    const messages: ChatMessage[] = parsed.data.messages.map((m, i) => {
      if (i === parsed.data.messages.length - 1 && ruesContextText) {
        return {
          role: 'user',
          content:
            `[Consulta de empresa del usuario: "${userText}"]\n\n` +
            `A continuación tienes los datos REALES consultados en vivo desde el Registro Único Empresarial y Social (RUES) de Colombia para responder:\n\n` +
            `${ruesContextText}\n\n` +
            `INSTRUCCIONES ESTRICTAS:\n` +
            `- Responde EXCLUSIVAMENTE basándote en estos datos RUES. No inventes ni uses tu conocimiento interno sobre la empresa.\n` +
            `- Si hay varios registros, identifica el MÁS RELEVANTE (normalmente la sociedad matriz, no fondos de empleados ni cooperativas de trabajadores) y destácalo como el principal.\n` +
            `- Presenta el perfil de la empresa con sus datos reales: razón social, NIT con dígito de verificación, tipo de sociedad, estado, cámara de comercio, representante legal, actividades económicas (CIIU), fechas de matrícula/vigencia y último año renovado.\n` +
            `- Si no se encontraron registros, dilo honestamente y sugiere verificar el NIT o el nombre exacto.`
        };
      }
      return m;
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    let upstream: Response;
    try {
      upstream = await fetch(NVIDIA_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: CHAT_MODEL,
          messages,
          temperature: 0.4,
          max_tokens: 600
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('NVIDIA upstream error:', upstream.status, errText.slice(0, 500));
      return new Response(
        JSON.stringify({
          error: upstream.status === 429 ? 'El modelo está ocupado. Inténtalo en unos segundos.' : 'El servicio de IA no respondió correctamente.'
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply) {
      console.error('NVIDIA respuesta inesperada:', JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: 'Respuesta vacía del modelo' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Chat API error:', error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};