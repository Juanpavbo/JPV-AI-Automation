import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const paymentId = url.searchParams.get('payment_id');
    const reference = url.searchParams.get('reference');

    if (!paymentId && !reference) {
      return new Response(JSON.stringify({ error: 'payment_id o reference requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      import.meta.env.SUPABASE_URL,
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let query = supabase.from('payments').select('*');
    if (paymentId) query = query.eq('id', paymentId);
    if (reference) query = query.eq('wompi_reference', reference);

    const { data: payment, error } = await query.single();

    if (error || !payment) {
      return new Response(JSON.stringify({ error: 'Pago no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ payment }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Payment status error:', error);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};