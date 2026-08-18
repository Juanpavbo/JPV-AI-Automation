import type { APIRoute } from 'astro';
import { z } from 'zod';
import { SYSTEM_PROMPT, CHAT_MODEL, type ChatMessage } from '../../lib/chat';
import {
  queryRuesByNit,
  queryRuesByName,
  queryRuesByFilters,
  queryRuesCountsByMunicipio,
  ruesContext
} from '../../lib/rues';
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
  /empresa|compañía|compa\u00f1\u00eda|sociedad|nit|razón social|razon social|rues|cámara de comercio|camara de comercio|representante legal|registro mercantil|actividad económica|matrícula|registrada|inscrita|qué es|quien es|quién es/i;

const MUNICIPIOS = [
  'bogota', 'bogotá', 'soacha', 'chia', 'cajicá', 'cajica', 'zipaquira', 'zipaquirá', 'mosquera',
  'madrid', 'funza', 'facatativa', 'facatativá', 'girardot', 'fusagasuga', 'fusagasugá', 'ubate',
  'ubaté', 'la calera', 'cota', 'tenjo', 'subachoque', 'el rosal', 'bojaca', 'bojacá', 'sopo',
  'tocancipa', 'tocancipá', 'gachancipa', 'gachancipá', 'sesquile', 'sesquilé', 'guasca', 'guatavita',
  'tabio', 'villeta', 'pacho', 'zipacon', 'silvania', 'sibate', 'sibaté', 'granada', 'el colegio',
  'la mesa', 'anapoima', 'apacar', 'viota', 'viotá', 'agua de dios', 'tocaima', 'cachipay',
  'la vega', 'san francisco', 'sasaima', 'alban', 'albán', 'bituima', 'guayabetal', 'quipile',
  'jerusalen', 'jerusalén', 'nilo', 'nariño', 'nari\u00f1o', 'pandi', 'puli', 'pulí',
  'san juan de rioseco', 'beltrán', 'cabrera', 'venecia', 'arbelaez', 'arbeláez', 'san bernardo',
  'guaduas', 'puerto salgar', 'yacopi', 'yacopí', 'topaipi', 'topaipí', 'caparrapi', 'caparrapí',
  'la palma', 'el peñón', 'vergara', 'supata', 'supatá', 'manta', 'macheta', 'machetá', 'tibirita',
  'turmeque', 'turmequé', 'ramiriqui', 'ramiriquí', 'tuta', 'sotaquira', 'sotaquirá', 'umbita',
  'nuevo colon', 'nuevo colón', 'villapinzon', 'villapinzón', 'cucunuba', 'cucunubá', 'suesca',
  'lenguazaque', 'guacheta', 'guachetá', 'gachala', 'june', 'simijaca', 'sutatausa', 'tausa',
  'susa', 'villagomez', 'villagómez'
];

const COUNT_HINTS =
  /cuántas|cuantas|cuántos|cuantos|cantidad|total de|número de|numero de|cuéntame las empresas|cuéntame cuantas|censo|registros|listado|empresas de|empresas en|empresas del|empresas registradas/i;

const LOCATION_HINTS =
  /empresas (de|en|del|ubicadas|registradas|inscritas)|\bmunicipio\b|\bciudad\b|\bcundinamarca\b|\bbogot[áa]\b|dónde hay|donde hay|qué empresas|que empresas|empresas por/i;

function extractNit(text: string): string | null {
  const digits = text.replace(/[^0-9]/g, '');
  const m = digits.match(/\d{6,10}/);
  return m ? m[0] : null;
}

function looksLikeCompanyQuery(text: string): boolean {
  return COMPANY_HINTS.test(text);
}

function looksLikeCountQuery(text: string): boolean {
  return COUNT_HINTS.test(text);
}

function looksLikeLocationQuery(text: string): boolean {
  return LOCATION_HINTS.test(text);
}

function extractCompanyName(text: string): string {
  const cleaned = text
    .replace(/^(por favor|podrías|puedes|me puedes|consulta|busca|averigua|dime|cuéntame|quiero saber|necesito saber|sabes|háblame|hablame|informame|infórmame)/i, '')
    .replace(/\b(empresa|compañía|sociedad|nit|razón social|razon social)\b/gi, '')
    .replace(/\b(de|del|la|el|los|las|que|qué|es|sobre|acerca|como|cómo|quien|quién|esta|este|está|info|información|sabes|saber|hay|alguna|algún)\b/gi, ' ')
    .replace(/[?¿.!¡:;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned;
}

function extractMunicipio(text: string): string | null {
  const lower = text.toLowerCase();
  const matched = MUNICIPIOS.find((m) => lower.includes(m));
  if (matched) return matched.toUpperCase().replace(/[\u00e1\u00e9\u00ed\u00f3\u00fa]/g, '');
  const m = lower.match(/\b(?:de|en|del)\s+([a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1]{3,30})\b/g);
  if (!m) return null;
  for (const token of m) {
    const cand = token.replace(/\b(?:de|en|del)\s+/i, '').trim();
    if (cand && cand.length >= 3 && /^[a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1 ]+$/i.test(cand)) return cand.toUpperCase().replace(/[\u00e1\u00e9\u00ed\u00f3\u00fa]/g, '');
  }
  return null;
}

function extractTamano(text: string): string | null {
  const lower = text.toLowerCase();
  if (/\bmicro\b|microempresa|microempresas/.test(lower)) return '01';
  if (/\bpeque\u00f1[ao]\b|pequen[ao]\b|peque\u00f1a|pymes|mipymes|medianas/.test(lower)) return '02';
  return null;
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
    let ruesSource = 'RUES (datos públicos de Colombia)';

    if (looksLikeCompanyQuery(userText)) {
      const nit = extractNit(userText);
      try {
        if (nit) {
          const matches = await queryRuesByNit(nit);
          ruesContextText = ruesContext(matches);
        } else if (looksLikeCountQuery(userText)) {
          const municipio = extractMunicipio(userText);
          const counts = await queryRuesCountsByMunicipio();
          ruesContextText = buildCountsContext(counts, municipio);
        } else if (looksLikeLocationQuery(userText)) {
          const municipio = extractMunicipio(userText);
          const tamano = extractTamano(userText);
          if (municipio) {
            const matches = await queryRuesByFilters({ municipio, tamano: tamano ?? undefined });
            ruesContextText = buildListContext(matches, municipio, tamano);
          } else {
            const matches = await queryRuesByName(extractCompanyName(userText), 5);
            ruesContextText = ruesContext(matches);
          }
        } else {
          const matches = await queryRuesByName(extractCompanyName(userText), 5);
          ruesContextText = ruesContext(matches);
        }
      } catch (error) {
        console.error('RUES query error:', error instanceof Error ? error.message : error);
      }
    }

    const historyMessages: ChatMessage[] = parsed.data.messages.map((m, i) => {
      if (i === parsed.data.messages.length - 1 && ruesContextText) {
        return {
          role: 'user',
          content: [
            `[Consulta de empresa del usuario: "${userText}"]`,
            `A continuación tienes los datos REALES consultados en vivo desde ${ruesSource} para responder:`,
            ruesContextText,
            `INSTRUCCIONES ESTRICTAS:`,
            `- Responde EXCLUSIVAMENTE basándote en estos datos. No inventes ni uses tu conocimiento interno sobre la empresa.`,
            `- Si hay varios registros, identifica el MÁS RELEVANTE (normalmente la sociedad matriz, no fondos de empleados ni cooperativas de trabajadores) y destácalo como el principal.`,
            `- Presenta el perfil de la empresa con sus datos reales: razón social, NIT con dígito de verificación, tipo de sociedad, estado, cámara de comercio, representante legal, actividades económicas (CIIU), fechas de matrícula/vigencia y último año renovado.`,
            `- Si es una consulta estadística (cuántas empresas, por municipio, por tamaño), presenta los totales y una lista breve de los principales registros.`,
            `- Si no se encontraron registros, dilo honestamente y sugiere verificar el NIT, el nombre exacto o el municipio.`
          ].join('\n\n')
        };
      }
      return m;
    });

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT } as ChatMessage,
      ...historyMessages
    ];

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

function buildCountsContext(counts: Array<{ municipio: string | null; total: number }>, municipio: string | null): string {
  const list = municipio
    ? counts.filter((c) => c.municipio && c.municipio.toLowerCase().includes(municipio.toLowerCase()))
    : counts;
  if (!list.length) return `No se encontraron empresas registradas${municipio ? ` para "${municipio}"` : ''}.`;
  const top = list.slice(0, 10);
  const lines = top.map((c) => `- ${c.municipio}: ${c.total.toLocaleString('es-CO')} empresas`);
  const extra = list.length > top.length ? `\n... y ${(list.length - top.length).toLocaleString('es-CO')} municipios más.` : '';
  return `Registros por municipio:\n${lines.join('\n')}${extra}`;
}

function buildListContext(
  matches: Array<Record<string, unknown>>,
  municipio: string,
  tamano: string | null
): string {
  if (!matches.length) {
    return `No se encontraron empresas en "${municipio}"${tamano ? ' del tamaño indicado' : ''}.`;
  }
  const lines = matches.slice(0, 10).map((r, i) => {
    const name = r.razon_social ?? r.razonSocial ?? 'Sin nombre';
    const nit = r.numero_identificacion ?? r.nit ?? '?';
    const act = r.ciiu_descripcion ?? r.cod_ciiu_act_econ_pri ?? '';
    return `${i + 1}. ${name} — NIT ${nit}${act ? ` · ${act}` : ''}`;
  });
  return `Empresas registradas en ${municipio}${tamano ? ' (micro/pequeña)' : ''}:\n${lines.join('\n')}`;
}