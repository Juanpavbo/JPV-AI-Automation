import { c as checkCronSecret } from '../../../chunks/auth_D_z6EZAz.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({
  request
}) => {
  if (!checkCronSecret()) {
    return new Response("Unauthorized", {
      status: 401
    });
  }
  {
    return new Response(JSON.stringify({
      error: "Not configured"
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
