import{k as a,F as f,l as _}from"./preact.module.Bchu6jJK.js";/**
 * @license lucide-preact v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),p=(...e)=>e.filter((o,n,s)=>!!o&&s.indexOf(o)===n).join(" ");/**
 * @license lucide-preact v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var v={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-preact v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=({color:e="currentColor",size:o=24,strokeWidth:n=2,absoluteStrokeWidth:s,children:i,iconNode:c,class:l="",...r})=>a("svg",{...v,width:String(o),height:o,stroke:e,"stroke-width":s?Number(n)*24/Number(o):n,class:["lucide",l].join(" "),...r},[...c.map(([t,u])=>a(t,u)),...f(i)]);/**
 * @license lucide-preact v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=(e,o)=>{const n=({class:s="",children:i,...c})=>a(w,{...c,iconNode:o,class:p(`lucide-${d(e)}`,s)},i);return n.displayName=`${e}`,n};var g=0;function m(e,o,n,s,i,c){o||(o={});var l,r,t=o;if("ref"in t)for(r in t={},o)r=="ref"?l=o[r]:t[r]=o[r];var u={type:e,props:t,key:n,ref:l,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--g,__i:-1,__u:0,__source:i,__self:c};if(typeof e=="function"&&(l=e.defaultProps))for(r in l)t[r]===void 0&&(t[r]=l[r]);return _.vnode&&_.vnode(u),u}export{k as c,m as u};
