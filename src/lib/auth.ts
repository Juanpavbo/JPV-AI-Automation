import { timingSafeEqual } from 'node:crypto';

export function checkCronSecret(request: Request): boolean {
  const secret = import.meta.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;

  const a = Buffer.from(auth);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}
