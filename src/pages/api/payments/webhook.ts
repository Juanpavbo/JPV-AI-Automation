import type { APIRoute } from 'astro';
import { updatePaymentFromWebhook } from '../../../lib/supabase';
import { notifyPayment } from '../../../lib/notify';
import crypto from 'crypto';

export const prerender = false;

function verifyWompiSignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function mapWompiStatus(wompiStatus: string): 'pending' | 'approved' | 'declined' | 'voided' | 'error' | 'expired' {
  switch (wompiStatus) {
    case 'APPROVED': return 'approved';
    case 'DECLINED': return 'declined';
    case 'VOIDED': return 'voided';
    case 'ERROR': return 'error';
    case 'EXPIRED': return 'expired';
    case 'PENDING': return 'pending';
    default: return 'pending';
  }
}

function mapPaymentMethod(wompiMethod: string): 'NEQUI' | 'DAVIPLATA' | 'CARD' | 'BANCOLOMBIA_TRANSFER' | 'OTHER' {
  const method = wompiMethod.toUpperCase();
  if (method.includes('NEQUI')) return 'NEQUI';
  if (method.includes('DAVIPLATA') || method.includes('DAVI PLATA')) return 'DAVIPLATA';
  if (method.includes('CARD') || method.includes('CREDIT') || method.includes('DEBIT')) return 'CARD';
  if (method.includes('BANCOLOMBIA') || method.includes('TRANSFER')) return 'BANCOLOMBIA_TRANSFER';
  return 'OTHER';
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const integritySecret = import.meta.env.WOMPI_INTEGRITY_SECRET;
    if (!integritySecret) {
      console.error('WOMPI_INTEGRITY_SECRET not configured');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get('wompi-signature') ?? request.headers.get('Wompi-Signature');

    if (!signature) {
      console.warn('Webhook received without signature');
      return new Response('Missing signature', { status: 400 });
    }

    if (!verifyWompiSignature(rawBody, signature, integritySecret)) {
      console.warn('Invalid Wompi signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const { type, data } = event;

    if (!data?.transaction) {
      console.warn('Webhook event without transaction data:', event);
      return new Response('Invalid event data', { status: 400 });
    }

    const tx = data.transaction;
    const reference = tx.reference;
    const transactionId = tx.id;
    const status = mapWompiStatus(tx.status);
    const paymentMethod = mapPaymentMethod(tx.payment_method_type ?? tx.payment_method?.type ?? 'OTHER');
    const paidAt = tx.paid_at ? new Date(tx.paid_at).toISOString() : null;

    console.log('Wompi webhook:', { reference, transactionId, status, paymentMethod });

    // Actualizar pago en BD
    const paymentId = await updatePaymentFromWebhook({
      wompi_transaction_id: transactionId,
      wompi_reference: reference,
      status,
      payment_method: paymentMethod,
      paid_at: paidAt,
      wompi_response: tx
    });

    if (!paymentId) {
      console.warn('Payment not found for reference:', reference);
      return new Response('Payment not found', { status: 404 });
    }

    // Si el pago fue aprobado, enviar notificación
    if (status === 'approved') {
      try {
        // Obtener detalles del pago para notificación
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          import.meta.env.SUPABASE_URL,
          import.meta.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { data: payment } = await supabase
          .from('payments')
          .select('*')
          .eq('id', paymentId)
          .single();

        if (payment) {
          await notifyPayment({
            customer_name: payment.customer_name,
            customer_email: payment.customer_email,
            amount_in_cents: payment.amount_in_cents,
            currency: payment.currency,
            payment_method: payment.payment_method,
            reference: payment.wompi_reference,
            paid_at: payment.paid_at
          });
        }
      } catch (notifyError) {
        console.error('Error sending payment notification:', notifyError);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
};