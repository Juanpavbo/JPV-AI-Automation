// Simple rate limiting utility
import type { APIContext } from 'astro';

const requests = new Map<string, { count: number; resetAt: number }>();

export function clientIp(context: APIContext): string {
  return (
    context.request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    context.request.headers.get('x-real-ip') ||
    context.clientAddress ||
    'unknown'
  );
}

export async function rateLimit(
  ip: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<{ success: boolean; remaining: number }> {
  const now = Date.now();
  const record = requests.get(ip);

  if (!record || now > record.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: limit - record.count };
}
