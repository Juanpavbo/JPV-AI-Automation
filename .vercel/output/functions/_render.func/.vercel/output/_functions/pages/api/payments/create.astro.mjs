import { b as createPendingPayment } from '../../../chunks/supabase_BRJlPDF6.mjs';
import { z } from 'zod';
import crypto from 'crypto';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const createPaymentSchema = z.object({
  amount_in_cents: z.number().int().positive(),
  currency: z.string().default("COP"),
  payment_method: z.enum(["NEQUI", "DAVIPLATA", "CARD", "BANCOLOMBIA_TRANSFER", "OTHER"]),
  customer_email: z.string().email(),
  customer_name: z.string().min(2).max(100),
  customer_phone: z.string().optional().nullable(),
  reference_type: z.enum(["booking", "contact", "service", "other"]).optional().nullable(),
  reference_id: z.string().uuid().optional().nullable(),
  redirect_url: z.string().url().optional()
});
function generateReference() {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString("hex");
  return `wompi_${timestamp}_${random}`;
}
async function createWompiTransaction(params) {
  {
    throw new Error("Wompi credentials not configured");
  }
}
const POST = async ({
  request
}) => {
  try {
    const userId = undefined                                         ?? "00000000-0000-0000-0000-000000000000";
    const json = await request.json();
    const parsed = createPaymentSchema.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({
        error: "Datos inválidos",
        details: parsed.error.flatten()
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const data = parsed.data;
    const reference = generateReference();
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
    const redirectUrl = data.redirect_url ?? `${undefined                              }/gracias?payment_id=${paymentId}`;
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
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Payments create error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Error interno del servidor"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
