import { options, h as h$1, Fragment, Component } from 'preact';
import { f as AstroUserError, A as AstroError } from './chunks/astro/assets-service_DNu2RnBt.mjs';
import { h as renderJSX, i as createVNode, A as AstroJSX } from './chunks/astro/server_DUNlji7s.mjs';

var r="diffed",o="__c",i="__s",a="__c",c="__k",u="__d",s="__s",l=/[\s\n\\/='"\0<>]/,f=/^(xlink|xmlns|xml)([A-Z])/,p=/^(?:accessK|auto[A-Z]|cell|ch|col|cont|cross|dateT|encT|form[A-Z]|frame|hrefL|inputM|maxL|minL|noV|playsI|popoverT|readO|rowS|src[A-Z]|tabI|useM|item[A-Z])/,h=/^ac|^ali|arabic|basel|cap|clipPath$|clipRule$|color|dominant|enable|fill|flood|font|glyph[^R]|horiz|image|letter|lighting|marker[^WUH]|overline|panose|pointe|paint|rendering|shape|stop|strikethrough|stroke|text[^L]|transform|underline|unicode|units|^v[^i]|^w|^xH/,d=new Set(["draggable","spellcheck"]);function v(e){ void 0!==e.__g?e.__g|=8:e[u]=true;}function m(e){ void 0!==e.__g?e.__g&=-9:e[u]=false;}function y(e){return void 0!==e.__g?!!(8&e.__g):true===e[u]}var _=/["&<]/;function g(e){if(0===e.length||false===_.test(e))return e;for(var t=0,n=0,r="",o="";n<e.length;n++){switch(e.charCodeAt(n)){case 34:o="&quot;";break;case 38:o="&amp;";break;case 60:o="&lt;";break;default:continue}n!==t&&(r+=e.slice(t,n)),r+=o,t=n+1;}return n!==t&&(r+=e.slice(t,n)),r}var b={},x=new Set(["animation-iteration-count","border-image-outset","border-image-slice","border-image-width","box-flex","box-flex-group","box-ordinal-group","column-count","fill-opacity","flex","flex-grow","flex-negative","flex-order","flex-positive","flex-shrink","flood-opacity","font-weight","grid-column","grid-row","line-clamp","line-height","opacity","order","orphans","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-miterlimit","stroke-opacity","stroke-width","tab-size","widows","z-index","zoom"]),k=/[A-Z]/g;function w(e){var t="";for(var n in e){var r=e[n];if(null!=r&&""!==r){var o="-"==n[0]?n:b[n]||(b[n]=n.replace(k,"-$&").toLowerCase()),i=";";"number"!=typeof r||o.startsWith("--")||x.has(o)||(i="px;"),t=t+o+":"+r+i;}}return t||void 0}function C(){this.__d=true;}function A(e,t){return {__v:e,context:t,props:e.props,setState:C,forceUpdate:C,__d:true,__h:new Array(0)}}function S(e,t,n){if(!e.s){if(n instanceof L){if(!n.s)return void(n.o=S.bind(null,e,t));1&t&&(t=n.s),n=n.v;}if(n&&n.then)return void n.then(S.bind(null,e,t),S.bind(null,e,2));e.s=t,e.v=n;const r=e.o;r&&r(e);}}var L=/*#__PURE__*/function(){function e(){}return e.prototype.then=function(t,n){var r=new e,o=this.s;if(o){var i=1&o?t:n;if(i){try{S(r,1,i(this.v));}catch(e){S(r,2,e);}return r}return this}return this.o=function(e){try{var o=e.v;1&e.s?S(r,1,t?t(o):o):n?S(r,1,n(o)):S(r,2,o);}catch(e){S(r,2,e);}},r},e}();function E(e){return e instanceof L&&1&e.s}function j(e,t,n){for(var r;;){var o=e();if(E(o)&&(o=o.v),!o)return i;if(o.then){r=0;break}var i=n();if(i&&i.then){if(!E(i)){r=1;break}i=i.s;}var a; }var c=new L,u=S.bind(null,c,2);return (0===r?o.then(l):1===r?i.then(s):a.then(f)).then(void 0,u),c;function s(r){i=r;do{if(!(o=e())||E(o)&&!o.v)return void S(c,1,i);if(o.then)return void o.then(l).then(void 0,u);E(i=n())&&(i=i.v);}while(!i||!i.then);i.then(s).then(void 0,u);}function l(e){e?(i=n())&&i.then?i.then(s).then(void 0,u):s(i):S(c,1,i);}function f(){(o=e())?o.then?o.then(l).then(void 0,u):l(o):S(c,1,i);}}function T(e,t){try{var n=e();}catch(e){return t(true,e)}return n&&n.then?n.then(t.bind(null,false),t.bind(null,true)):t(false,n)}var D,P,$,U,Z=function(a,u){try{var s=options[i];options[i]=!0,D=options.__b,P=options[r],$=options.__r,U=options.unmount;var l=h$1(Fragment,null);return l[c]=[a],Promise.resolve(T(function(){return Promise.resolve(R(a,u||F,!1,void 0,l,!0,void 0)).then(function(e){var t,n=function(){if(W(e)){var n=function(){var e=o.join(H);return t=1,e},r=0,o=e,i=j(function(){return !!o.some(function(e){return e&&"function"==typeof e.then})&&r++<25},void 0,function(){return Promise.resolve(Promise.all(o)).then(function(e){o=e.flat();})});return i&&i.then?i.then(n):n()}}();return n&&n.then?n.then(function(n){return t?n:e}):t?n:e})},function(t,n){if(options[o]&&options[o](a,M),options[i]=s,M.length=0,t)throw n;return n}))}catch(e){return Promise.reject(e)}},F={},M=[],W=Array.isArray,z=Object.assign,H="",N="\x3c!--$s--\x3e",q="\x3c!--/$s--\x3e";function B(e){return "string"==typeof e?N+e+q:W(e)?(e.unshift(N),e.push(q),e):e&&"function"==typeof e.then?e.then(B):N+e+q}function O(e,t){var n,r=e.type,o=true;return e[a]?(o=false,(n=e[a]).state=n[s]):n=new r(e.props,t),e[a]=n,n.__v=e,n.props=e.props,n.context=t,v(n),null==n.state&&(n.state=F),null==n[s]&&(n[s]=n.state),r.getDerivedStateFromProps?n.state=z({},n.state,r.getDerivedStateFromProps(n.props,n.state)):o&&n.componentWillMount?(n.componentWillMount(),n.state=n[s]!==n.state?n[s]:n.state):!o&&n.componentWillUpdate&&n.componentWillUpdate(),$&&$(e),n.render(n.props,n.state,t)}function R(t,r,o,i,u,_,b){if(null==t||true===t||false===t||t===H)return H;var x=typeof t;if("object"!=x)return "function"==x?H:"string"==x?g(t):t+H;if(W(t)){var k,C=H;u[c]=t;for(var S=t.length,L=0;L<S;L++){var E=t[L];if(null!=E&&"boolean"!=typeof E){var j,T=R(E,r,o,i,u,_,b);"string"==typeof T?C+=T:(k||(k=new Array(S)),C&&k.push(C),C=H,W(T)?(j=k).push.apply(j,T):k.push(T));}}return k?(C&&k.push(C),k):C}if(void 0!==t.constructor)return H;t.__=u,D&&D(t);var Z=t.type,M=t.props;if("function"==typeof Z){var N,q,I,K=r;if(Z===Fragment){if("tpl"in M){for(var G=H,Q=0;Q<M.tpl.length;Q++)if(G+=M.tpl[Q],M.exprs&&Q<M.exprs.length){var X=M.exprs[Q];if(null==X)continue;"object"!=typeof X||void 0!==X.constructor&&!W(X)?G+=X:G+=R(X,r,o,i,t,_,b);}return G}if("UNSTABLE_comment"in M)return "\x3c!--"+g(M.UNSTABLE_comment)+"--\x3e";q=M.children;}else {if(null!=(N=Z.contextType)){var Y=r[N.__c];K=Y?Y.props.value:N.__;}var ee=Z.prototype&&"function"==typeof Z.prototype.render;if(ee)q=/**#__NOINLINE__**/O(t,K),I=t[a];else {t[a]=I=/**#__NOINLINE__**/A(t,K);for(var te=0;y(I)&&te++<25;){m(I),$&&$(t);try{q=Z.call(I,M,K);}catch(e){throw e&&"function"==typeof e.then&&(t._suspended=true),e}}v(I);}if(null!=I.getChildContext&&(r=z({},r,I.getChildContext())),ee&&options.errorBoundaries&&(Z.getDerivedStateFromError||I.componentDidCatch)){q=null!=q&&q.type===Fragment&&null==q.key&&null==q.props.tpl?q.props.children:q;try{return R(q,r,o,i,t,_,!1)}catch(e){return Z.getDerivedStateFromError&&(I[s]=Z.getDerivedStateFromError(e)),I.componentDidCatch&&I.componentDidCatch(e,F),y(I)?(q=O(t,r),null!=(I=t[a]).getChildContext&&(r=z({},r,I.getChildContext())),R(q=null!=q&&q.type===Fragment&&null==q.key&&null==q.props.tpl?q.props.children:q,r,o,i,t,_,b)):H}finally{P&&P(t),U&&U(t);}}}q=null!=q&&q.type===Fragment&&null==q.key&&null==q.props.tpl?q.props.children:q;try{var ne=R(q,r,o,i,t,_,b);return P&&P(t),options.unmount&&options.unmount(t),t._suspended?B(ne):ne}catch(n){if(!n||"function"!=typeof n.then)throw n;return n.then(function e(){try{var n=R(q,r,o,i,t,_,b);return t._suspended?B(n):n}catch(t){if(!t||"function"!=typeof t.then)throw t;return t.then(e)}})}}var ie,ae="<"+Z,ce=H;for(var ue in M){var se=M[ue];if("function"!=typeof(se=J(se)?se.value:se)||"class"===ue||"className"===ue){switch(ue){case "children":ie=se;continue;case "key":case "ref":case "__self":case "__source":continue;case "htmlFor":if("for"in M)continue;ue="for";break;case "className":if("class"in M)continue;ue="class";break;case "defaultChecked":ue="checked";break;case "defaultSelected":ue="selected";break;case "defaultValue":case "value":switch(ue="value",Z){case "textarea":ie=se;continue;case "select":i=se;continue;case "option":i!=se||"selected"in M||(ae+=" selected");}break;case "dangerouslySetInnerHTML":ce=se&&se.__html;continue;case "style":"object"==typeof se&&(se=w(se));break;case "acceptCharset":ue="accept-charset";break;case "httpEquiv":ue="http-equiv";break;default:if(l.test(ue))continue;f.test(ue)?ue=ue.replace(f,"$1:$2").toLowerCase():"-"!==ue[4]&&!d.has(ue)||null==se?o?h.test(ue)&&(ue="panose1"===ue?"panose-1":ue.replace(/([A-Z])/g,"-$1").toLowerCase()):p.test(ue)&&(ue=ue.toLowerCase()):se+=H;}null!=se&&false!==se&&(ae=true===se||se===H?ae+" "+ue:ae+" "+ue+'="'+("string"==typeof se?g(se):se+H)+'"');}}if(l.test(Z))throw new Error(Z+" is not a valid HTML tag name in "+ae+">");if(ce||("string"==typeof ie?ce=g(ie):null!=ie&&false!==ie&&true!==ie&&(ce=R(ie,r,"svg"===Z||"foreignObject"!==Z&&o,i,t,_,b))),P&&P(t),U&&U(t),!ce&&V.has(Z))return ae+"/>";var le="</"+Z+">",fe=ae+">";return W(ce)?[fe].concat(ce,[le]):"string"!=typeof ce?[fe,ce,le]:fe+ce+le}var V=new Set(["area","base","br","col","command","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"]);function J(e){return null!==e&&"object"==typeof e&&"function"==typeof e.peek&&"value"in e}

const contexts = /* @__PURE__ */ new WeakMap();
function getContext(result) {
  if (contexts.has(result)) {
    return contexts.get(result);
  }
  let ctx = {
    c: 0,
    get id() {
      return "p" + this.c.toString();
    },
    signals: /* @__PURE__ */ new Map(),
    propsToSignals: /* @__PURE__ */ new Map()
  };
  contexts.set(result, ctx);
  return ctx;
}
function incrementId(ctx) {
  let id = ctx.id;
  ctx.c++;
  return id;
}

function isSignal(x) {
  return x != null && typeof x === "object" && typeof x.peek === "function" && "value" in x;
}
function restoreSignalsOnProps(ctx, props) {
  let propMap;
  if (ctx.propsToSignals.has(props)) {
    propMap = ctx.propsToSignals.get(props);
  } else {
    propMap = /* @__PURE__ */ new Map();
    ctx.propsToSignals.set(props, propMap);
  }
  for (const [key, signal] of propMap) {
    props[key] = signal;
  }
  return propMap;
}
function serializeSignals(ctx, props, attrs, map) {
  const signals = {};
  for (const [key, value] of Object.entries(props)) {
    const isPropArray = Array.isArray(value);
    const isPropObject = !isSignal(value) && typeof props[key] === "object" && props[key] !== null && !isPropArray;
    if (isPropObject || isPropArray) {
      const values = isPropObject ? Object.keys(props[key]) : value;
      values.forEach((valueKey, valueIndex) => {
        const signal = isPropObject ? props[key][valueKey] : valueKey;
        if (isSignal(signal)) {
          const keyOrIndex = isPropObject ? valueKey.toString() : valueIndex;
          props[key] = isPropObject ? Object.assign({}, props[key], { [keyOrIndex]: signal.peek() }) : props[key].map(
            (v, i) => i === valueIndex ? [signal.peek(), i] : v
          );
          const currentMap = map.get(key) || [];
          map.set(key, [...currentMap, [signal, keyOrIndex]]);
          const currentSignals = signals[key] || [];
          signals[key] = [...currentSignals, [getSignalId(ctx, signal), keyOrIndex]];
        }
      });
    } else if (isSignal(value)) {
      props[key] = value.peek();
      map.set(key, value);
      signals[key] = getSignalId(ctx, value);
    }
  }
  if (Object.keys(signals).length) {
    attrs["data-preact-signals"] = JSON.stringify(signals);
  }
}
function getSignalId(ctx, item) {
  let id = ctx.signals.get(item);
  if (!id) {
    id = incrementId(ctx);
    ctx.signals.set(item, id);
  }
  return id;
}

const StaticHtml = ({ value, name, hydrate = true }) => {
  if (!value) return null;
  const tagName = hydrate ? "astro-slot" : "astro-static-slot";
  return h$1(tagName, { name, dangerouslySetInnerHTML: { __html: value } });
};
StaticHtml.shouldComponentUpdate = () => false;
var static_html_default = StaticHtml;

const slotName$1 = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
let originalConsoleError;
let consoleFilterRefs = 0;
async function check$1(Component$1, props, children) {
  if (typeof Component$1 !== "function") return false;
  if (Component$1.name === "QwikComponent") return false;
  if (Component$1.prototype != null && typeof Component$1.prototype.render === "function") {
    return Component.isPrototypeOf(Component$1);
  }
  useConsoleFilter();
  try {
    const { html } = await renderToStaticMarkup$1.call(this, Component$1, props, children, void 0);
    if (typeof html !== "string") {
      return false;
    }
    return html == "" ? false : !html.includes("<undefined>");
  } catch {
    return false;
  } finally {
    finishUsingConsoleFilter();
  }
}
function shouldHydrate(metadata) {
  return metadata?.astroStaticSlot ? !!metadata.hydrate : true;
}
async function renderToStaticMarkup$1(Component, props, { default: children, ...slotted }, metadata) {
  const ctx = getContext(this.result);
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName$1(key);
    slots[name] = h$1(static_html_default, {
      hydrate: shouldHydrate(metadata),
      value,
      name
    });
  }
  let propsMap = restoreSignalsOnProps(ctx, props);
  const newProps = { ...props, ...slots };
  const attrs = {};
  serializeSignals(ctx, props, attrs, propsMap);
  const vNode = h$1(
    Component,
    newProps,
    children != null ? h$1(static_html_default, {
      hydrate: shouldHydrate(metadata),
      value: children
    }) : children
  );
  const html = await Z(vNode);
  return { attrs, html };
}
function useConsoleFilter() {
  consoleFilterRefs++;
  if (!originalConsoleError) {
    originalConsoleError = console.error;
    try {
      console.error = filteredConsoleError;
    } catch {
    }
  }
}
function finishUsingConsoleFilter() {
  consoleFilterRefs--;
}
function filteredConsoleError(msg, ...rest) {
  if (consoleFilterRefs > 0 && typeof msg === "string") {
    const isKnownReactHookError = msg.includes("Warning: Invalid hook call.") && msg.includes("https://reactjs.org/link/invalid-hook-call");
    if (isKnownReactHookError) return;
  }
  originalConsoleError(msg, ...rest);
}
const renderer$1 = {
  name: "@astrojs/preact",
  check: check$1,
  renderToStaticMarkup: renderToStaticMarkup$1,
  supportsAstroStaticSlot: true
};
var server_default$1 = renderer$1;

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(Component, props, { default: children = null, ...slotted } = {}) {
  if (typeof Component !== "function") return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children });
    return result[AstroJSX];
  } catch (e) {
    throwEnhancedErrorIfMdxComponent(e, Component);
  }
  return false;
}
async function renderToStaticMarkup(Component, props = {}, { default: children = null, ...slotted } = {}) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  try {
    const html = await renderJSX(result, createVNode(Component, { ...props, ...slots, children }));
    return { html };
  } catch (e) {
    throwEnhancedErrorIfMdxComponent(e, Component);
    throw e;
  }
}
function throwEnhancedErrorIfMdxComponent(error, Component) {
  if (Component[Symbol.for("mdx-component")]) {
    if (AstroUserError.is(error)) return;
    throw new AstroError({
      message: error.message,
      title: error.name,
      hint: `This issue often occurs when your MDX component encounters runtime errors.`,
      name: error.name,
      stack: error.stack
    });
  }
}
const renderer = {
  name: "astro:jsx",
  check,
  renderToStaticMarkup
};
var server_default = renderer;

const renderers = [Object.assign({"name":"@astrojs/preact","clientEntrypoint":"@astrojs/preact/client.js","serverEntrypoint":"@astrojs/preact/server.js"}, { ssr: server_default$1 }),Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default }),];

export { renderers };
