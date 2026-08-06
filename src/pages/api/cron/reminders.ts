import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { checkCronSecret } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!checkCronSecret(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = import.meta.env.SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const now = Date.now();
  const from = new Date(now + 55 * 60 * 1000).toISOString();
  const to = new Date(now + 65 * 60 * 1000).toISOString();

  const { data: bookings, error } = await admin
    .from('bookings')
    .select('id, user_id, client_name, starts_at, meeting_type, meeting_url')
    .eq('status', 'confirmed')
    .gte('starts_at', from)
    .lte('starts_at', to);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!bookings || bookings.length === 0) {
    return new Response(JSON.stringify({ ok: true, created: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const ids = bookings.map((b) => b.id);
  const { data: existing, error: existingError } = await admin
    .from('notifications')
    .select('payload')
    .eq('user_id', bookings[0].user_id)
    .eq('type', 'booking_reminder')
    .in('payload->>booking_id', ids.map(String));

  if (existingError) {
    return new Response(JSON.stringify({ error: existingError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const reminded = new Set((existing ?? []).map((n) => n.payload?.booking_id));
  const toInsert = bookings.filter((b) => !reminded.has(b.id));

  let created = 0;
  for (const b of toInsert) {
    const { error: insertError } = await admin.from('notifications').insert({
      user_id: b.user_id,
      type: 'booking_reminder',
      payload: {
        booking_id: b.id,
        client_name: b.client_name,
        starts_at: b.starts_at,
        meeting_type: b.meeting_type,
        meeting_url: b.meeting_url
      }
    });
    if (!insertError) created++;
  }

  return new Response(JSON.stringify({ ok: true, found: bookings.length, created }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
