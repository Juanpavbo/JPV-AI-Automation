import type { APIRoute } from 'astro';
import { createPendingPayment } from '../../../lib/supabase';
import { z } from 'zod';
import crypto from 'crypto';

export const prerender = false;

const createPaymentSchema = z.object({
  amount_in_cents: z.number().int().positive(),
  currency: z.string().default('COP'),
  payment_method: z.enum(['NEQUI', 'DAVIPLATA', 'CARD', 'BANCOLOMBIA_TRANSFER', 'OTHER']),
  customer_email: z.string().email(),
  customer_name: z.string().min(2).max(100),
  customer_phone: z.string().optional().nullable(),
  reference_type: z.enum(['booking', 'contact', 'service', 'other']).optional().nullable(),
  reference_id: z.string().uuid().optional().nullable(),
  redirect_url: z.string().url().optional()
});

const WOMPI_BASE_URL = import.meta.env.WOMPI_ENV === 'production' 
  ? 'https://production.wompi.co/v1' 
  : 'https://sandbox.wompi.co/v1';

function generateReference(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `wompi_${timestamp}_${random}`;
}

async function createWompiTransaction(params: {
  amount_in_cents: number;
  currency: string;
  reference: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string | null;
  payment_method: string;
  redirect_url?: string;
}): Promise<{ checkout_url: string; transaction_id: string; wompi_response: Record<string, unknown> }> {
  const publicKey = import.meta.env.WOMPI_PUBLIC_KEY;
  const integritySecret = import.meta.env.WOMPI_INTEGRITY_SECRET;

  if (!publicKey || !integritySecret) {
    throw new Error('Wompi credentials not configured');
  }

  const body = {
    amount_in_cents: params.amount_in_cents,
    currency: params.currency,
    reference: params.reference,
    customer_email: params.customer_email,
    customer_data: {
      name: params.customer_name,
      phone_number: params.customer_phone ?? undefined
    },
    payment_method: {
      installments: 1
    },
    redirect_url: params.redirect_url ?? `${import.meta.env.PUBLIC_APP_URL}/gracias`,
    expiration_time: 1800,
    single_use: true
  };

  const signature = crypto
    .createHmac('sha256', integritySecret)
    .update(`${params.reference}${params.amount_in_cents}${params.currency}`)
    .digest('hex');

  const response = await fetch(`${WOMPI_BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicKey}`,
      'Wompi-Signature': signature
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Wompi create transaction error:', data);
    throw new Error(data.error?.messages?.[0]?.message || 'Error creando transacción en Wompi');
  }

  return {
    checkout_url: data.data.checkout_url,
    transaction_id: data.data.id,
    wompi_response: data.data
  };
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals?.user;
    const userId = user?.id ?? import.meta.env.SUPABASE_SERVICE_USER_ID ?? '00000000-0000-0000-0000-000000000000';

    const json = await request.json();
    const parsed = createPaymentSchema.safeParse(json);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Datos inválidos', details: parsed.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = parsed.data;
    const reference = generateReference();

    // Crear registro pendiente en BD
    const paymentId = await createPendingPayment({
      user_id: userId,
      wompi_reference: reference,
      amount_in_cents: data.amount_in_cents,
      currency: data.currency,
      payment_method: data.payment_method,
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone ?? null,
      reference_type: data.reference_type ?? null,
      reference_id: data.reference_id ?? null
    });

    // Crear transacción en Wompi
    const redirectUrl = data.redirect_url ?? `${import.meta.env.PUBLIC_APP_URL}/gracias?payment_id=${paymentId}`;
    const wompiResult = await createWompiTransaction({
      amount_in_cents: data.amount_in_cents,
      currency: data.currency,
      reference,
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      payment_method: data.payment_method,
      redirect_url: redirectUrl
    });

    return new Response(JSON.stringify({
      success: true,
      payment_id: paymentId,
      checkout_url: wompiResult.checkout_url,
      reference
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Payments create error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};