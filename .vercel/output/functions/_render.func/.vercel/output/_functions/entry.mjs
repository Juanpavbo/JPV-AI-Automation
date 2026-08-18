import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_DqXBww7e.mjs';
import { manifest } from './manifest_GhZ7ORqO.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/analytics/pageview.astro.mjs');
const _page2 = () => import('./pages/api/chat.astro.mjs');
const _page3 = () => import('./pages/api/contact.astro.mjs');
const _page4 = () => import('./pages/api/cron/cleanup.astro.mjs');
const _page5 = () => import('./pages/api/cron/reminders.astro.mjs');
const _page6 = () => import('./pages/api/empresa.astro.mjs');
const _page7 = () => import('./pages/api/payments/create.astro.mjs');
const _page8 = () => import('./pages/api/payments/status.astro.mjs');
const _page9 = () => import('./pages/api/payments/webhook.astro.mjs');
const _page10 = () => import('./pages/gracias.astro.mjs');
const _page11 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/.pnpm/astro@4.16.19_@types+node@2_ca3f9ec9cd14405e7c5e2867e7217577/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/analytics/pageview.ts", _page1],
    ["src/pages/api/chat.ts", _page2],
    ["src/pages/api/contact.ts", _page3],
    ["src/pages/api/cron/cleanup.ts", _page4],
    ["src/pages/api/cron/reminders.ts", _page5],
    ["src/pages/api/empresa.ts", _page6],
    ["src/pages/api/payments/create.ts", _page7],
    ["src/pages/api/payments/status.ts", _page8],
    ["src/pages/api/payments/webhook.ts", _page9],
    ["src/pages/gracias.astro", _page10],
    ["src/pages/index.astro", _page11]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "54a8b3cd-08b6-4791-9163-ae1e37436c39",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
