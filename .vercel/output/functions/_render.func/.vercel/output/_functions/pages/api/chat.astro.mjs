import { z } from 'zod';
import { b as queryRuesByNit, r as ruesContext, a as queryRuesCountsByMunicipio, q as queryRuesByFilters, c as queryRuesByName } from '../../chunks/rues_DNxbqaT0.mjs';
import { c as clientIp, r as rateLimit } from '../../chunks/rateLimit_f48-jaoh.mjs';
export { renderers } from '../../renderers.mjs';

const CHAT_MODEL = "meta/llama-3.1-8b-instruct";
const SYSTEM_PROMPT = `Eres el asistente virtual de vexanIA, una consultoría de automatización e IA para empresas y negocios con sede en Bogotá, Colombia. Respondes siempre en español, con un tono cercano, directo y profesional. No inventes datos: si algo no lo sabes, dilo y sugiere contactar directamente.

## Quiénes somos
vexanIA ayuda a empresas y negocios a ahorrar tiempo, vender más y decidir con datos, usando automatización, aplicaciones a la medida, inteligencia artificial y reportes inteligentes. Lema: "Tu negocio puede trabajar solo, mientras tú lo haces crecer". Atendemos todo tipo de negocios, estén o no formalizados. Te lo explicamos sin palabras técnicas.

## Servicios
1. Automatización de tareas repetitivas: flujos automáticos (Microsoft Power Automate, n8n) que hacen por ti tareas como copiar datos, enviar recordatorios o registrar pedidos. 24/7 y sin errores de digitación.
2. Aplicaciones de negocio a la medida: apps para celular/tablet (Microsoft Power Apps) que reemplazan el papel, el cuaderno y el Excel desordenado.
3. Asistentes virtuales con Inteligencia Artificial: asesores que atienden a tus clientes y empleados 24/7 en tu web o WhatsApp (Microsoft Copilot Studio), entrenados con TU información.
4. Reportes e inteligencia de negocio: tableros visuales en vivo (Microsoft Power BI, Tableau, Looker Studio) de ventas, cartera y rentabilidad.

## Cómo empezar
El visitante puede hacer un diagnóstico exprés en la sección "Diagnóstico": responde 3 preguntas y se le sugiere qué servicio le conviene (es orientativo y sin compromiso). Anímalo a hacerlo o a enviar el formulario de contacto para agendar su diagnóstico gratuito (una conversación de 30 minutos, virtual o presencial).

## Cómo agendar una cita
El visitante puede agendar una videollamada en https://cal.com/vexania. Tipos de reunión: Diagnóstico rápido (15 min), Consulta completa (30 min) y Proyecto nuevo (45 min); presencial o por videollamada. El diagnóstico inicial es gratis (30 min) y en 48h se entrega una lista de procesos automatizables.

## Contacto
Correo: vexania@zohomail.com · LinkedIn: https://www.linkedin.com/company/vexania

## Reglas
- Cuando el usuario indique interés real en un servicio (presupuesto, cotización, implementación), invítalo a hacer el diagnóstico exprés de la página y a agendar una llamada en https://cal.com/vexania.
- Respuestas concisas (máximo ~200 palabras), con saltos de línea y sin markdown excesivo.
- NUNCA inventes precios, casos de éxito ni contactos.

## Base de datos de empresas (RUES Colombia)
Tienes acceso en vivo a la base local del Registro Único Empresarial y Social (RUES) con más de 1.2 millones de empresas ACTIVAS de Bogotá y Cundinamarca (micro, pequeñas y sin clasificar). Puedes responder a preguntas como:
- "¿Cuántas empresas hay en Soacha?" o "¿cuántas empresas registradas hay en Cundinamarca?"
- "Lista de empresas en Bogotá" / "empresas de Chía" / "empresas de tamaño micro en Funza"
- "¿Qué es / quién es [razón social]?" o "busca la empresa con NIT 830000000"
- "¿Cuáles son las empresas del municipio de Girardot?"
Cuando la consulta pida datos de empresas (NIT, razón social, ubicación, conteos), los datos reales se inyectan automáticamente en tu contexto; responde solo con esos datos y menciona la fuente (RUES). Si no encuentras el municipio o la empresa, dilo y sugiere verificarlo.`;

const prerender = false;
const MAX_HISTORY = 20;
const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(4e3)
  })).min(1).max(MAX_HISTORY)
});
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const COMPANY_HINTS = /empresa|compañía|compa\u00f1\u00eda|sociedad|nit|razón social|razon social|rues|cámara de comercio|camara de comercio|representante legal|registro mercantil|actividad económica|matrícula|registrada|inscrita|qué es|quien es|quién es/i;
const MUNICIPIOS = ["bogota", "bogotá", "soacha", "chia", "cajicá", "cajica", "zipaquira", "zipaquirá", "mosquera", "madrid", "funza", "facatativa", "facatativá", "girardot", "fusagasuga", "fusagasugá", "ubate", "ubaté", "la calera", "cota", "tenjo", "subachoque", "el rosal", "bojaca", "bojacá", "sopo", "tocancipa", "tocancipá", "gachancipa", "gachancipá", "sesquile", "sesquilé", "guasca", "guatavita", "tabio", "villeta", "pacho", "zipacon", "silvania", "sibate", "sibaté", "granada", "el colegio", "la mesa", "anapoima", "apacar", "viota", "viotá", "agua de dios", "tocaima", "cachipay", "la vega", "san francisco", "sasaima", "alban", "albán", "bituima", "guayabetal", "quipile", "jerusalen", "jerusalén", "nilo", "nariño", "nariño", "pandi", "puli", "pulí", "san juan de rioseco", "beltrán", "cabrera", "venecia", "arbelaez", "arbeláez", "san bernardo", "guaduas", "puerto salgar", "yacopi", "yacopí", "topaipi", "topaipí", "caparrapi", "caparrapí", "la palma", "el peñón", "vergara", "supata", "supatá", "manta", "macheta", "machetá", "tibirita", "turmeque", "turmequé", "ramiriqui", "ramiriquí", "tuta", "sotaquira", "sotaquirá", "umbita", "nuevo colon", "nuevo colón", "villapinzon", "villapinzón", "cucunuba", "cucunubá", "suesca", "lenguazaque", "guacheta", "guachetá", "gachala", "june", "simijaca", "sutatausa", "tausa", "susa", "villagomez", "villagómez"];
const COUNT_HINTS = /cuántas|cuantas|cuántos|cuantos|cantidad|total de|número de|numero de|cuéntame las empresas|cuéntame cuantas|censo|registros|listado|empresas de|empresas en|empresas del|empresas registradas/i;
const LOCATION_HINTS = /empresas (de|en|del|ubicadas|registradas|inscritas)|\bmunicipio\b|\bciudad\b|\bcundinamarca\b|\bbogot[áa]\b|dónde hay|donde hay|qué empresas|que empresas|empresas por/i;
function extractNit(text) {
  const digits = text.replace(/[^0-9]/g, "");
  const m = digits.match(/\d{6,10}/);
  return m ? m[0] : null;
}
function looksLikeCompanyQuery(text) {
  return COMPANY_HINTS.test(text);
}
function looksLikeCountQuery(text) {
  return COUNT_HINTS.test(text);
}
function looksLikeLocationQuery(text) {
  return LOCATION_HINTS.test(text);
}
function extractCompanyName(text) {
  const cleaned = text.replace(/^(por favor|podrías|puedes|me puedes|consulta|busca|averigua|dime|cuéntame|quiero saber|necesito saber|sabes|háblame|hablame|informame|infórmame)/i, "").replace(/\b(empresa|compañía|sociedad|nit|razón social|razon social)\b/gi, "").replace(/\b(de|del|la|el|los|las|que|qué|es|sobre|acerca|como|cómo|quien|quién|esta|este|está|info|información|sabes|saber|hay|alguna|algún)\b/gi, " ").replace(/[?¿.!¡:;]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned;
}
function extractMunicipio(text) {
  const lower = text.toLowerCase();
  const matched = MUNICIPIOS.find((m2) => lower.includes(m2));
  if (matched) return matched.toUpperCase().replace(/[\u00e1\u00e9\u00ed\u00f3\u00fa]/g, "");
  const m = lower.match(/\b(?:de|en|del)\s+([a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1]{3,30})\b/g);
  if (!m) return null;
  for (const token of m) {
    const cand = token.replace(/\b(?:de|en|del)\s+/i, "").trim();
    if (cand && cand.length >= 3 && /^[a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1 ]+$/i.test(cand)) return cand.toUpperCase().replace(/[\u00e1\u00e9\u00ed\u00f3\u00fa]/g, "");
  }
  return null;
}
function extractTamano(text) {
  const lower = text.toLowerCase();
  if (/\bmicro\b|microempresa|microempresas/.test(lower)) return "01";
  if (/\bpeque\u00f1[ao]\b|pequen[ao]\b|peque\u00f1a|pymes|mipymes|medianas/.test(lower)) return "02";
  return null;
}
const POST = async ({
  request
}) => {
  try {
    const ip = clientIp(request);
    const ipLimit = rateLimit(`chat:${ip}`, 30, 6e4);
    if (!ipLimit.allowed) {
      return new Response(JSON.stringify({
        error: "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo."
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(ipLimit.retryAfter)
        }
      });
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({
        error: "JSON inválido"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({
        error: "Solicitud inválida",
        details: parsed.error.flatten()
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const apiKey = undefined                              ;
    if (!apiKey) {
      console.error("NVIDIA_API_KEY no configurada");
      return new Response(JSON.stringify({
        error: "Error interno del servidor"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const lastMessage = parsed.data.messages[parsed.data.messages.length - 1];
    const userText = lastMessage.content.trim();
    let ruesContextText = null;
    let ruesSource = "RUES (datos públicos de Colombia)";
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
            const matches = await queryRuesByFilters({
              municipio,
              tamano: tamano ?? void 0
            });
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
        console.error("RUES query error:", error instanceof Error ? error.message : error);
      }
    }
    const historyMessages = parsed.data.messages.map((m, i) => {
      if (i === parsed.data.messages.length - 1 && ruesContextText) {
        return {
          role: "user",
          content: [`[Consulta de empresa del usuario: "${userText}"]`, `A continuación tienes los datos REALES consultados en vivo desde ${ruesSource} para responder:`, ruesContextText, `INSTRUCCIONES ESTRICTAS:`, `- Responde EXCLUSIVAMENTE basándote en estos datos. No inventes ni uses tu conocimiento interno sobre la empresa.`, `- Si hay varios registros, identifica el MÁS RELEVANTE (normalmente la sociedad matriz, no fondos de empleados ni cooperativas de trabajadores) y destácalo como el principal.`, `- Presenta el perfil de la empresa con sus datos reales: razón social, NIT con dígito de verificación, tipo de sociedad, estado, cámara de comercio, representante legal, actividades económicas (CIIU), fechas de matrícula/vigencia y último año renovado.`, `- Si es una consulta estadística (cuántas empresas, por municipio, por tamaño), presenta los totales y una lista breve de los principales registros.`, `- Si no se encontraron registros, dilo honestamente y sugiere verificar el NIT, el nombre exacto o el municipio.`].join("\n\n")
        };
      }
      return m;
    });
    const messages = [{
      role: "system",
      content: SYSTEM_PROMPT
    }, ...historyMessages];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25e3);
    let upstream;
    try {
      upstream = await fetch(NVIDIA_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
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
      console.error("NVIDIA upstream error:", upstream.status, errText.slice(0, 500));
      return new Response(JSON.stringify({
        error: upstream.status === 429 ? "El modelo está ocupado. Inténtalo en unos segundos." : "El servicio de IA no respondió correctamente."
      }), {
        status: 502,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply) {
      console.error("NVIDIA respuesta inesperada:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({
        error: "Respuesta vacía del modelo"
      }), {
        status: 502,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    return new Response(JSON.stringify({
      reply
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Chat API error:", error instanceof Error ? error.message : error);
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
function buildCountsContext(counts, municipio) {
  const list = municipio ? counts.filter((c) => c.municipio && c.municipio.toLowerCase().includes(municipio.toLowerCase())) : counts;
  if (!list.length) return `No se encontraron empresas registradas${municipio ? ` para "${municipio}"` : ""}.`;
  const top = list.slice(0, 10);
  const lines = top.map((c) => `- ${c.municipio}: ${c.total.toLocaleString("es-CO")} empresas`);
  const extra = list.length > top.length ? `
... y ${(list.length - top.length).toLocaleString("es-CO")} municipios más.` : "";
  return `Registros por municipio:
${lines.join("\n")}${extra}`;
}
function buildListContext(matches, municipio, tamano) {
  if (!matches.length) {
    return `No se encontraron empresas en "${municipio}"${tamano ? " del tamaño indicado" : ""}.`;
  }
  const lines = matches.slice(0, 10).map((r, i) => {
    const name = r.razon_social ?? r.razonSocial ?? "Sin nombre";
    const nit = r.numero_identificacion ?? r.nit ?? "?";
    const act = r.ciiu_descripcion ?? r.cod_ciiu_act_econ_pri ?? "";
    return `${i + 1}. ${name} — NIT ${nit}${act ? ` · ${act}` : ""}`;
  });
  return `Empresas registradas en ${municipio}${tamano ? " (micro/pequeña)" : ""}:
${lines.join("\n")}`;
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
