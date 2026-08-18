import { createClient } from '../../../chunks/index_B12LTPqM.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({
  url
}) => {
  try {
    const paymentId = url.searchParams.get("payment_id");
    const reference = url.searchParams.get("reference");
    if (!paymentId && !reference) {
      return new Response(JSON.stringify({
        error: "payment_id o reference requerido"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const supabase = createClient(undefined                            , undefined                                         );
    let query = supabase.from("payments").select("*");
    if (paymentId) query = query.eq("id", paymentId);
    if (reference) query = query.eq("wompi_reference", reference);
    const {
      data: payment,
      error
    } = await query.single();
    if (error || !payment) {
      return new Response(JSON.stringify({
        error: "Pago no encontrado"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    return new Response(JSON.stringify({
      payment
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Payment status error:", error);
    return new Response(JSON.stringify({
      error: "Error interno"
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
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
