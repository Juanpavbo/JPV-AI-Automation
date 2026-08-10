import type { APIRoute } from 'astro';
import { z } from 'zod';
import { SYSTEM_PROMPT, CHAT_MODEL, type ChatMessage } from '../../lib/chat';
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

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...parsed.data.messages
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