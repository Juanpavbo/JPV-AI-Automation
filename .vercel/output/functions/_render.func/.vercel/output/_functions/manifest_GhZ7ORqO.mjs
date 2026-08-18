import { g as decodeKey } from './chunks/astro/server_DUNlji7s.mjs';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_mJt8Um84.mjs';
import 'clsx';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/57313/AppData/Local/Temp/opencode/JPV-AI-Automation/","adapterName":"@astrojs/vercel/serverless","routes":[{"file":"gracias/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/gracias","isIndex":false,"type":"page","pattern":"^\\/gracias\\/?$","segments":[[{"content":"gracias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/gracias.astro","pathname":"/gracias","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.7qqag-5g.js"}],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/.pnpm/astro@4.16.19_@types+node@2_ca3f9ec9cd14405e7c5e2867e7217577/node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.7qqag-5g.js"}],"styles":[],"routeData":{"route":"/api/analytics/pageview","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/analytics\\/pageview\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"analytics","dynamic":false,"spread":false}],[{"content":"pageview","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/analytics/pageview.ts","pathname":"/api/analytics/pageview","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.7qqag-5g.js"}],"styles":[],"routeData":{"route":"/api/chat","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/chat\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"chat","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/chat.ts","pathname":"/api/chat","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.7qqag-5g.js"}],"styles":[],"routeData":{"route":"/api/contact","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/contact\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/contact.ts","pathname":"/api/contact","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.7qqag-5g.js"}],"styles":[],"routeData":{"route":"/api/cron/cleanup","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/cron\\/cleanup\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"cron","dynamic":false,"spread":false}],[{"content":"cleanup","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/cron/cleanup.ts","pathname":"/api/cron/cleanup","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.7qqag-5g.js"}],"styles":[],"routeData":{"route":"/api/cron/reminders","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/cron\\/reminders\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"cron","dynamic":false,"spread":false}],[{"content":"reminders","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/cron/reminders.ts","pathname":"/api/cron/reminders","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.7qqag-5g.js"}],"styles":[],"routeData":{"route":"/api/empresa","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/empresa\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"empresa","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/empresa.ts","pathname":"/api/empresa","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.7qqag-5g.js"}],"styles":[],"routeData":{"route":"/api/payments/create","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/payments\\/create\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"payments","dynamic":false,"spread":false}],[{"content":"create","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/payments/create.ts","pathname":"/api/payments/create","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.7qqag-5g.js"}],"styles":[],"routeData":{"route":"/api/payments/status","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/payments\\/status\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"payments","dynamic":false,"spread":false}],[{"content":"status","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/payments/status.ts","pathname":"/api/payments/status","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.7qqag-5g.js"}],"styles":[],"routeData":{"route":"/api/payments/webhook","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/payments\\/webhook\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"payments","dynamic":false,"spread":false}],[{"content":"webhook","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/payments/webhook.ts","pathname":"/api/payments/webhook","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"https://vexania.vercel.app","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/57313/AppData/Local/Temp/opencode/JPV-AI-Automation/src/pages/gracias.astro",{"propagation":"none","containsHead":true}],["C:/Users/57313/AppData/Local/Temp/opencode/JPV-AI-Automation/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astro-page:src/pages/api/analytics/pageview@_@ts":"pages/api/analytics/pageview.astro.mjs","\u0000@astro-page:src/pages/api/contact@_@ts":"pages/api/contact.astro.mjs","\u0000@astro-page:src/pages/api/cron/cleanup@_@ts":"pages/api/cron/cleanup.astro.mjs","\u0000@astro-page:src/pages/api/cron/reminders@_@ts":"pages/api/cron/reminders.astro.mjs","\u0000@astro-page:src/pages/api/empresa@_@ts":"pages/api/empresa.astro.mjs","\u0000@astro-page:src/pages/api/payments/create@_@ts":"pages/api/payments/create.astro.mjs","\u0000@astro-page:src/pages/api/payments/status@_@ts":"pages/api/payments/status.astro.mjs","\u0000@astro-page:src/pages/api/payments/webhook@_@ts":"pages/api/payments/webhook.astro.mjs","\u0000@astro-page:src/pages/gracias@_@astro":"pages/gracias.astro.mjs","\u0000@astro-page:src/pages/api/chat@_@ts":"pages/api/chat.astro.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-page:node_modules/.pnpm/astro@4.16.19_@types+node@2_ca3f9ec9cd14405e7c5e2867e7217577/node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","C:/Users/57313/AppData/Local/Temp/opencode/JPV-AI-Automation/node_modules/.pnpm/astro@4.16.19_@types+node@2_ca3f9ec9cd14405e7c5e2867e7217577/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","\u0000@astrojs-manifest":"manifest_GhZ7ORqO.mjs","C:/Users/57313/AppData/Local/Temp/opencode/JPV-AI-Automation/node_modules/.pnpm/@supabase+supabase-js@2.112.1/node_modules/@supabase/supabase-js/dist/index.mjs":"chunks/index_B12LTPqM.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.oDQ7A1bn.js","C:/Users/57313/AppData/Local/Temp/opencode/JPV-AI-Automation/src/islands/FaqAccordion":"_astro/FaqAccordion.DAP0Yd9t.js","astro:scripts/page.js":"_astro/page.7qqag-5g.js","C:/Users/57313/AppData/Local/Temp/opencode/JPV-AI-Automation/node_modules/.pnpm/@preact+signals@1.3.4_preact@10.29.8/node_modules/@preact/signals/dist/signals.module.js":"_astro/signals.module.Cc8XKERo.js","C:/Users/57313/AppData/Local/Temp/opencode/JPV-AI-Automation/src/islands/DiagnosticoQuiz":"_astro/DiagnosticoQuiz.Cp6yfCkQ.js","@astrojs/preact/client.js":"_astro/client.BLCpC4Ko.js","C:/Users/57313/AppData/Local/Temp/opencode/JPV-AI-Automation/src/islands/ContactForm":"_astro/ContactForm.BpDCS5Ni.js","C:/Users/57313/AppData/Local/Temp/opencode/JPV-AI-Automation/src/islands/ServicesExplorer":"_astro/ServicesExplorer.t7pQiTgm.js","/astro/hoisted.js?q=1":"_astro/hoisted.GnPVSOad.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/gracias.Bib90f-I.css","/favicon.svg","/manifest.webmanifest","/sw.js","/icons/calendar.png","/icons/icon-128.png","/icons/icon-144.png","/icons/icon-152.png","/icons/icon-192.png","/icons/icon-384.png","/icons/icon-512.png","/icons/icon-72.png","/icons/icon-96.png","/icons/mail.png","/_astro/client.BLCpC4Ko.js","/_astro/ContactForm.BpDCS5Ni.js","/_astro/DiagnosticoQuiz.Cp6yfCkQ.js","/_astro/FaqAccordion.DAP0Yd9t.js","/_astro/hoisted.GnPVSOad.js","/_astro/hoisted.oDQ7A1bn.js","/_astro/hooks.module.BSoo8t7E.js","/_astro/jsxRuntime.module.C5mynh_E.js","/_astro/page.7qqag-5g.js","/_astro/preact.module.Bchu6jJK.js","/_astro/services.D7cYxxyT.js","/_astro/ServicesExplorer.t7pQiTgm.js","/_astro/signals.module.Cc8XKERo.js","/_astro/page.7qqag-5g.js","/gracias/index.html","/index.html"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"tiyjcKnW/T6JdugmAF0eD8Oxl7la8/p3bqKFEUp2Jps=","experimentalEnvGetSecretEnabled":false});

export { manifest };
