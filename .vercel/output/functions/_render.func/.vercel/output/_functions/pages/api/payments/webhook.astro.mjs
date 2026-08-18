import { u as updatePaymentFromWebhook } from '../../../chunks/supabase_BRJlPDF6.mjs';
import { a as notifyPayment } from '../../../chunks/notify_CpzVdOH1.mjs';
import crypto from 'crypto';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
function verifyWompiSignature(payload, signature, secret) {
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
function mapWompiStatus(wompiStatus) {
  switch (wompiStatus) {
    case "APPROVED":
      return "approved";
    case "DECLINED":
      return "declined";
    case "VOIDED":
      return "voided";
    case "ERROR":
      return "error";
    case "EXPIRED":
      return "expired";
    case "PENDING":
      return "pending";
    default:
      return "pending";
  }
}
function mapPaymentMethod(wompiMethod) {
  const method = wompiMethod.toUpperCase();
  if (method.includes("NEQUI")) return "NEQUI";
  if (method.includes("DAVIPLATA") || method.includes("DAVI PLATA")) return "DAVIPLATA";
  if (method.includes("CARD") || method.includes("CREDIT") || method.includes("DEBIT")) return "CARD";
  if (method.includes("BANCOLOMBIA") || method.includes("TRANSFER")) return "BANCOLOMBIA_TRANSFER";
  return "OTHER";
}
const POST = async ({
  request
}) => {
  try {
    const integritySecret = undefined                                      ;
    if (!integritySecret) {
      console.error("WOMPI_INTEGRITY_SECRET not configured");
      return new Response("Webhook secret not configured", {
        status: 500
      });
    }
    const rawBody = await request.text();
    const signature = request.headers.get("wompi-signature") ?? request.headers.get("Wompi-Signature");
    if (!signature) {
      console.warn("Webhook received without signature");
      return new Response("Missing signature", {
        status: 400
      });
    }
    if (!verifyWompiSignature(rawBody, signature, integritySecret)) {
      console.warn("Invalid Wompi signature");
      return new Response("Invalid signature", {
        status: 401
      });
    }
    const event = JSON.parse(rawBody);
    const {
      type: _type,
      data
    } = event;
    if (!data?.transaction) {
      console.warn("Webhook event without transaction data:", event);
      return new Response("Invalid event data", {
        status: 400
      });
    }
    const tx = data.transaction;
    const reference = tx.reference;
    const transactionId = tx.id;
    const status = mapWompiStatus(tx.status);
    const paymentMethod = mapPaymentMethod(tx.payment_method_type ?? tx.payment_method?.type ?? "OTHER");
    const paidAt = tx.paid_at ? new Date(tx.paid_at).toISOString() : null;
    console.log("Wompi webhook:", {
      reference,
      transactionId,
      status,
      paymentMethod
    });
    const paymentId = await updatePaymentFromWebhook({
      wompi_transaction_id: transactionId,
      wompi_reference: reference,
      status,
      payment_method: paymentMethod,
      paid_at: paidAt,
      wompi_response: tx
    });
    if (!paymentId) {
      console.warn("Payment not found for reference:", reference);
      return new Response("Payment not found", {
        status: 404
      });
    }
    if (status === "approved") {
      try {
        const {
          createClient
        } = await import('../../../chunks/index_B12LTPqM.mjs');
        const supabase = createClient(undefined                            , undefined                                         );
        const {
          data: payment
        } = await supabase.from("payments").select("*").eq("id", paymentId).single();
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
        console.error("Error sending payment notification:", notifyError);
      }
    }
    return new Response(JSON.stringify({
      received: true
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Webhook processing failed", {
      status: 500
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
