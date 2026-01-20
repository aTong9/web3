const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./AboutView-CKt4LVBw.js","./AboutView-BjSvksaD.css"])))=>i.map(i=>d[i]);
(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function n(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(o){if(o.ep)return;o.ep=!0;const r=n(o);fetch(o.href,r)}})();function Hi(e){const t=Object.create(null);for(const n of e.split(","))t[n]=1;return n=>n in t}const ee={},Wt=[],Qe=()=>{},gr=()=>!1,zn=e=>e.charCodeAt(0)===111&&e.charCodeAt(1)===110&&(e.charCodeAt(2)>122||e.charCodeAt(2)<97),Ui=e=>e.startsWith("onUpdate:"),de=Object.assign,Gi=(e,t)=>{const n=e.indexOf(t);n>-1&&e.splice(n,1)},Yl=Object.prototype.hasOwnProperty,Y=(e,t)=>Yl.call(e,t),H=Array.isArray,zt=e=>Kn(e)==="[object Map]",mr=e=>Kn(e)==="[object Set]",U=e=>typeof e=="function",ae=e=>typeof e=="string",Ct=e=>typeof e=="symbol",te=e=>e!==null&&typeof e=="object",wr=e=>(te(e)||U(e))&&U(e.then)&&U(e.catch),vr=Object.prototype.toString,Kn=e=>vr.call(e),Ql=e=>Kn(e).slice(8,-1),yr=e=>Kn(e)==="[object Object]",Vi=e=>ae(e)&&e!=="NaN"&&e[0]!=="-"&&""+parseInt(e,10)===e,an=Hi(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Yn=e=>{const t=Object.create(null);return(n=>t[n]||(t[n]=e(n)))},Xl=/-\w/g,Ne=Yn(e=>e.replace(Xl,t=>t.slice(1).toUpperCase())),Jl=/\B([A-Z])/g,Ft=Yn(e=>e.replace(Jl,"-$1").toLowerCase()),Qn=Yn(e=>e.charAt(0).toUpperCase()+e.slice(1)),si=Yn(e=>e?`on${Qn(e)}`:""),yt=(e,t)=>!Object.is(e,t),ci=(e,...t)=>{for(let n=0;n<e.length;n++)e[n](...t)},br=(e,t,n,i=!1)=>{Object.defineProperty(e,t,{configurable:!0,enumerable:!1,writable:i,value:n})},Zl=e=>{const t=parseFloat(e);return isNaN(t)?e:t};let go;const Xn=()=>go||(go=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function Ee(e){if(H(e)){const t={};for(let n=0;n<e.length;n++){const i=e[n],o=ae(i)?is(i):Ee(i);if(o)for(const r in o)t[r]=o[r]}return t}else if(ae(e)||te(e))return e}const es=/;(?![^(]*\))/g,ts=/:([^]+)/,ns=/\/\*[^]*?\*\//g;function is(e){const t={};return e.replace(ns,"").split(es).forEach(n=>{if(n){const i=n.split(ts);i.length>1&&(t[i[0].trim()]=i[1].trim())}}),t}function Mt(e){let t="";if(ae(e))t=e;else if(H(e))for(let n=0;n<e.length;n++){const i=Mt(e[n]);i&&(t+=i+" ")}else if(te(e))for(const n in e)e[n]&&(t+=n+" ");return t.trim()}const os="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",rs=Hi(os);function xr(e){return!!e||e===""}const _r=e=>!!(e&&e.__v_isRef===!0),Ht=e=>ae(e)?e:e==null?"":H(e)||te(e)&&(e.toString===vr||!U(e.toString))?_r(e)?Ht(e.value):JSON.stringify(e,Ar,2):String(e),Ar=(e,t)=>_r(t)?Ar(e,t.value):zt(t)?{[`Map(${t.size})`]:[...t.entries()].reduce((n,[i,o],r)=>(n[ai(i,r)+" =>"]=o,n),{})}:mr(t)?{[`Set(${t.size})`]:[...t.values()].map(n=>ai(n))}:Ct(t)?ai(t):te(t)&&!H(t)&&!yr(t)?String(t):t,ai=(e,t="")=>{var n;return Ct(e)?`Symbol(${(n=e.description)!=null?n:t})`:e};let Ie;class Cr{constructor(t=!1){this.detached=t,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=Ie,!t&&Ie&&(this.index=(Ie.scopes||(Ie.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let t,n;if(this.scopes)for(t=0,n=this.scopes.length;t<n;t++)this.scopes[t].pause();for(t=0,n=this.effects.length;t<n;t++)this.effects[t].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let t,n;if(this.scopes)for(t=0,n=this.scopes.length;t<n;t++)this.scopes[t].resume();for(t=0,n=this.effects.length;t<n;t++)this.effects[t].resume()}}run(t){if(this._active){const n=Ie;try{return Ie=this,t()}finally{Ie=n}}}on(){++this._on===1&&(this.prevScope=Ie,Ie=this)}off(){this._on>0&&--this._on===0&&(Ie=this.prevScope,this.prevScope=void 0)}stop(t){if(this._active){this._active=!1;let n,i;for(n=0,i=this.effects.length;n<i;n++)this.effects[n].stop();for(this.effects.length=0,n=0,i=this.cleanups.length;n<i;n++)this.cleanups[n]();if(this.cleanups.length=0,this.scopes){for(n=0,i=this.scopes.length;n<i;n++)this.scopes[n].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!t){const o=this.parent.scopes.pop();o&&o!==this&&(this.parent.scopes[this.index]=o,o.index=this.index)}this.parent=void 0}}}function ls(e){return new Cr(e)}function ss(){return Ie}let Z;const ui=new WeakSet;class Er{constructor(t){this.fn=t,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Ie&&Ie.active&&Ie.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,ui.has(this)&&(ui.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Ir(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,mo(this),Tr(this);const t=Z,n=Le;Z=this,Le=!0;try{return this.fn()}finally{Or(this),Z=t,Le=n,this.flags&=-3}}stop(){if(this.flags&1){for(let t=this.deps;t;t=t.nextDep)zi(t);this.deps=this.depsTail=void 0,mo(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?ui.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Ci(this)&&this.run()}get dirty(){return Ci(this)}}let Sr=0,un,fn;function Ir(e,t=!1){if(e.flags|=8,t){e.next=fn,fn=e;return}e.next=un,un=e}function qi(){Sr++}function Wi(){if(--Sr>0)return;if(fn){let t=fn;for(fn=void 0;t;){const n=t.next;t.next=void 0,t.flags&=-9,t=n}}let e;for(;un;){let t=un;for(un=void 0;t;){const n=t.next;if(t.next=void 0,t.flags&=-9,t.flags&1)try{t.trigger()}catch(i){e||(e=i)}t=n}}if(e)throw e}function Tr(e){for(let t=e.deps;t;t=t.nextDep)t.version=-1,t.prevActiveLink=t.dep.activeLink,t.dep.activeLink=t}function Or(e){let t,n=e.depsTail,i=n;for(;i;){const o=i.prevDep;i.version===-1?(i===n&&(n=o),zi(i),cs(i)):t=i,i.dep.activeLink=i.prevActiveLink,i.prevActiveLink=void 0,i=o}e.deps=t,e.depsTail=n}function Ci(e){for(let t=e.deps;t;t=t.nextDep)if(t.dep.version!==t.version||t.dep.computed&&(Mr(t.dep.computed)||t.dep.version!==t.version))return!0;return!!e._dirty}function Mr(e){if(e.flags&4&&!(e.flags&16)||(e.flags&=-17,e.globalVersion===wn)||(e.globalVersion=wn,!e.isSSR&&e.flags&128&&(!e.deps&&!e._dirty||!Ci(e))))return;e.flags|=2;const t=e.dep,n=Z,i=Le;Z=e,Le=!0;try{Tr(e);const o=e.fn(e._value);(t.version===0||yt(o,e._value))&&(e.flags|=128,e._value=o,t.version++)}catch(o){throw t.version++,o}finally{Z=n,Le=i,Or(e),e.flags&=-3}}function zi(e,t=!1){const{dep:n,prevSub:i,nextSub:o}=e;if(i&&(i.nextSub=o,e.prevSub=void 0),o&&(o.prevSub=i,e.nextSub=void 0),n.subs===e&&(n.subs=i,!i&&n.computed)){n.computed.flags&=-5;for(let r=n.computed.deps;r;r=r.nextDep)zi(r,!0)}!t&&!--n.sc&&n.map&&n.map.delete(n.key)}function cs(e){const{prevDep:t,nextDep:n}=e;t&&(t.nextDep=n,e.prevDep=void 0),n&&(n.prevDep=t,e.nextDep=void 0)}let Le=!0;const Rr=[];function lt(){Rr.push(Le),Le=!1}function st(){const e=Rr.pop();Le=e===void 0?!0:e}function mo(e){const{cleanup:t}=e;if(e.cleanup=void 0,t){const n=Z;Z=void 0;try{t()}finally{Z=n}}}let wn=0;class as{constructor(t,n){this.sub=t,this.dep=n,this.version=n.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class Ki{constructor(t){this.computed=t,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(t){if(!Z||!Le||Z===this.computed)return;let n=this.activeLink;if(n===void 0||n.sub!==Z)n=this.activeLink=new as(Z,this),Z.deps?(n.prevDep=Z.depsTail,Z.depsTail.nextDep=n,Z.depsTail=n):Z.deps=Z.depsTail=n,Pr(n);else if(n.version===-1&&(n.version=this.version,n.nextDep)){const i=n.nextDep;i.prevDep=n.prevDep,n.prevDep&&(n.prevDep.nextDep=i),n.prevDep=Z.depsTail,n.nextDep=void 0,Z.depsTail.nextDep=n,Z.depsTail=n,Z.deps===n&&(Z.deps=i)}return n}trigger(t){this.version++,wn++,this.notify(t)}notify(t){qi();try{for(let n=this.subs;n;n=n.prevSub)n.sub.notify()&&n.sub.dep.notify()}finally{Wi()}}}function Pr(e){if(e.dep.sc++,e.sub.flags&4){const t=e.dep.computed;if(t&&!e.dep.subs){t.flags|=20;for(let i=t.deps;i;i=i.nextDep)Pr(i)}const n=e.dep.subs;n!==e&&(e.prevSub=n,n&&(n.nextSub=e)),e.dep.subs=e}}const Ei=new WeakMap,Pt=Symbol(""),Si=Symbol(""),vn=Symbol("");function he(e,t,n){if(Le&&Z){let i=Ei.get(e);i||Ei.set(e,i=new Map);let o=i.get(n);o||(i.set(n,o=new Ki),o.map=i,o.key=n),o.track()}}function it(e,t,n,i,o,r){const l=Ei.get(e);if(!l){wn++;return}const s=c=>{c&&c.trigger()};if(qi(),t==="clear")l.forEach(s);else{const c=H(e),f=c&&Vi(n);if(c&&n==="length"){const a=Number(i);l.forEach((u,g)=>{(g==="length"||g===vn||!Ct(g)&&g>=a)&&s(u)})}else switch((n!==void 0||l.has(void 0))&&s(l.get(n)),f&&s(l.get(vn)),t){case"add":c?f&&s(l.get("length")):(s(l.get(Pt)),zt(e)&&s(l.get(Si)));break;case"delete":c||(s(l.get(Pt)),zt(e)&&s(l.get(Si)));break;case"set":zt(e)&&s(l.get(Pt));break}}Wi()}function Bt(e){const t=K(e);return t===e?t:(he(t,"iterate",vn),ke(e)?t:t.map(je))}function Jn(e){return he(e=K(e),"iterate",vn),e}function ht(e,t){return ct(e)?Qt(kt(e)?je(t):t):je(t)}const us={__proto__:null,[Symbol.iterator](){return fi(this,Symbol.iterator,e=>ht(this,e))},concat(...e){return Bt(this).concat(...e.map(t=>H(t)?Bt(t):t))},entries(){return fi(this,"entries",e=>(e[1]=ht(this,e[1]),e))},every(e,t){return et(this,"every",e,t,void 0,arguments)},filter(e,t){return et(this,"filter",e,t,n=>n.map(i=>ht(this,i)),arguments)},find(e,t){return et(this,"find",e,t,n=>ht(this,n),arguments)},findIndex(e,t){return et(this,"findIndex",e,t,void 0,arguments)},findLast(e,t){return et(this,"findLast",e,t,n=>ht(this,n),arguments)},findLastIndex(e,t){return et(this,"findLastIndex",e,t,void 0,arguments)},forEach(e,t){return et(this,"forEach",e,t,void 0,arguments)},includes(...e){return pi(this,"includes",e)},indexOf(...e){return pi(this,"indexOf",e)},join(e){return Bt(this).join(e)},lastIndexOf(...e){return pi(this,"lastIndexOf",e)},map(e,t){return et(this,"map",e,t,void 0,arguments)},pop(){return rn(this,"pop")},push(...e){return rn(this,"push",e)},reduce(e,...t){return wo(this,"reduce",e,t)},reduceRight(e,...t){return wo(this,"reduceRight",e,t)},shift(){return rn(this,"shift")},some(e,t){return et(this,"some",e,t,void 0,arguments)},splice(...e){return rn(this,"splice",e)},toReversed(){return Bt(this).toReversed()},toSorted(e){return Bt(this).toSorted(e)},toSpliced(...e){return Bt(this).toSpliced(...e)},unshift(...e){return rn(this,"unshift",e)},values(){return fi(this,"values",e=>ht(this,e))}};function fi(e,t,n){const i=Jn(e),o=i[t]();return i!==e&&!ke(e)&&(o._next=o.next,o.next=()=>{const r=o._next();return r.done||(r.value=n(r.value)),r}),o}const fs=Array.prototype;function et(e,t,n,i,o,r){const l=Jn(e),s=l!==e&&!ke(e),c=l[t];if(c!==fs[t]){const u=c.apply(e,r);return s?je(u):u}let f=n;l!==e&&(s?f=function(u,g){return n.call(this,ht(e,u),g,e)}:n.length>2&&(f=function(u,g){return n.call(this,u,g,e)}));const a=c.call(l,f,i);return s&&o?o(a):a}function wo(e,t,n,i){const o=Jn(e);let r=n;return o!==e&&(ke(e)?n.length>3&&(r=function(l,s,c){return n.call(this,l,s,c,e)}):r=function(l,s,c){return n.call(this,l,ht(e,s),c,e)}),o[t](r,...i)}function pi(e,t,n){const i=K(e);he(i,"iterate",vn);const o=i[t](...n);return(o===-1||o===!1)&&Xi(n[0])?(n[0]=K(n[0]),i[t](...n)):o}function rn(e,t,n=[]){lt(),qi();const i=K(e)[t].apply(e,n);return Wi(),st(),i}const ps=Hi("__proto__,__v_isRef,__isVue"),kr=new Set(Object.getOwnPropertyNames(Symbol).filter(e=>e!=="arguments"&&e!=="caller").map(e=>Symbol[e]).filter(Ct));function ds(e){Ct(e)||(e=String(e));const t=K(this);return he(t,"has",e),t.hasOwnProperty(e)}class Nr{constructor(t=!1,n=!1){this._isReadonly=t,this._isShallow=n}get(t,n,i){if(n==="__v_skip")return t.__v_skip;const o=this._isReadonly,r=this._isShallow;if(n==="__v_isReactive")return!o;if(n==="__v_isReadonly")return o;if(n==="__v_isShallow")return r;if(n==="__v_raw")return i===(o?r?As:jr:r?Lr:Dr).get(t)||Object.getPrototypeOf(t)===Object.getPrototypeOf(i)?t:void 0;const l=H(t);if(!o){let c;if(l&&(c=us[n]))return c;if(n==="hasOwnProperty")return ds}const s=Reflect.get(t,n,me(t)?t:i);if((Ct(n)?kr.has(n):ps(n))||(o||he(t,"get",n),r))return s;if(me(s)){const c=l&&Vi(n)?s:s.value;return o&&te(c)?Ti(c):c}return te(s)?o?Ti(s):Zn(s):s}}class Fr extends Nr{constructor(t=!1){super(!1,t)}set(t,n,i,o){let r=t[n];const l=H(t)&&Vi(n);if(!this._isShallow){const f=ct(r);if(!ke(i)&&!ct(i)&&(r=K(r),i=K(i)),!l&&me(r)&&!me(i))return f||(r.value=i),!0}const s=l?Number(n)<t.length:Y(t,n),c=Reflect.set(t,n,i,me(t)?t:o);return t===K(o)&&(s?yt(i,r)&&it(t,"set",n,i):it(t,"add",n,i)),c}deleteProperty(t,n){const i=Y(t,n);t[n];const o=Reflect.deleteProperty(t,n);return o&&i&&it(t,"delete",n,void 0),o}has(t,n){const i=Reflect.has(t,n);return(!Ct(n)||!kr.has(n))&&he(t,"has",n),i}ownKeys(t){return he(t,"iterate",H(t)?"length":Pt),Reflect.ownKeys(t)}}class hs extends Nr{constructor(t=!1){super(!0,t)}set(t,n){return!0}deleteProperty(t,n){return!0}}const gs=new Fr,ms=new hs,ws=new Fr(!0);const Ii=e=>e,Sn=e=>Reflect.getPrototypeOf(e);function vs(e,t,n){return function(...i){const o=this.__v_raw,r=K(o),l=zt(r),s=e==="entries"||e===Symbol.iterator&&l,c=e==="keys"&&l,f=o[e](...i),a=n?Ii:t?Qt:je;return!t&&he(r,"iterate",c?Si:Pt),de(Object.create(f),{next(){const{value:u,done:g}=f.next();return g?{value:u,done:g}:{value:s?[a(u[0]),a(u[1])]:a(u),done:g}}})}}function In(e){return function(...t){return e==="delete"?!1:e==="clear"?void 0:this}}function ys(e,t){const n={get(o){const r=this.__v_raw,l=K(r),s=K(o);e||(yt(o,s)&&he(l,"get",o),he(l,"get",s));const{has:c}=Sn(l),f=t?Ii:e?Qt:je;if(c.call(l,o))return f(r.get(o));if(c.call(l,s))return f(r.get(s));r!==l&&r.get(o)},get size(){const o=this.__v_raw;return!e&&he(K(o),"iterate",Pt),o.size},has(o){const r=this.__v_raw,l=K(r),s=K(o);return e||(yt(o,s)&&he(l,"has",o),he(l,"has",s)),o===s?r.has(o):r.has(o)||r.has(s)},forEach(o,r){const l=this,s=l.__v_raw,c=K(s),f=t?Ii:e?Qt:je;return!e&&he(c,"iterate",Pt),s.forEach((a,u)=>o.call(r,f(a),f(u),l))}};return de(n,e?{add:In("add"),set:In("set"),delete:In("delete"),clear:In("clear")}:{add(o){!t&&!ke(o)&&!ct(o)&&(o=K(o));const r=K(this);return Sn(r).has.call(r,o)||(r.add(o),it(r,"add",o,o)),this},set(o,r){!t&&!ke(r)&&!ct(r)&&(r=K(r));const l=K(this),{has:s,get:c}=Sn(l);let f=s.call(l,o);f||(o=K(o),f=s.call(l,o));const a=c.call(l,o);return l.set(o,r),f?yt(r,a)&&it(l,"set",o,r):it(l,"add",o,r),this},delete(o){const r=K(this),{has:l,get:s}=Sn(r);let c=l.call(r,o);c||(o=K(o),c=l.call(r,o)),s&&s.call(r,o);const f=r.delete(o);return c&&it(r,"delete",o,void 0),f},clear(){const o=K(this),r=o.size!==0,l=o.clear();return r&&it(o,"clear",void 0,void 0),l}}),["keys","values","entries",Symbol.iterator].forEach(o=>{n[o]=vs(o,e,t)}),n}function Yi(e,t){const n=ys(e,t);return(i,o,r)=>o==="__v_isReactive"?!e:o==="__v_isReadonly"?e:o==="__v_raw"?i:Reflect.get(Y(n,o)&&o in i?n:i,o,r)}const bs={get:Yi(!1,!1)},xs={get:Yi(!1,!0)},_s={get:Yi(!0,!1)};const Dr=new WeakMap,Lr=new WeakMap,jr=new WeakMap,As=new WeakMap;function Cs(e){switch(e){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function Es(e){return e.__v_skip||!Object.isExtensible(e)?0:Cs(Ql(e))}function Zn(e){return ct(e)?e:Qi(e,!1,gs,bs,Dr)}function Br(e){return Qi(e,!1,ws,xs,Lr)}function Ti(e){return Qi(e,!0,ms,_s,jr)}function Qi(e,t,n,i,o){if(!te(e)||e.__v_raw&&!(t&&e.__v_isReactive))return e;const r=Es(e);if(r===0)return e;const l=o.get(e);if(l)return l;const s=new Proxy(e,r===2?i:n);return o.set(e,s),s}function kt(e){return ct(e)?kt(e.__v_raw):!!(e&&e.__v_isReactive)}function ct(e){return!!(e&&e.__v_isReadonly)}function ke(e){return!!(e&&e.__v_isShallow)}function Xi(e){return e?!!e.__v_raw:!1}function K(e){const t=e&&e.__v_raw;return t?K(t):e}function $r(e){return!Y(e,"__v_skip")&&Object.isExtensible(e)&&br(e,"__v_skip",!0),e}const je=e=>te(e)?Zn(e):e,Qt=e=>te(e)?Ti(e):e;function me(e){return e?e.__v_isRef===!0:!1}function Nn(e){return Hr(e,!1)}function Ss(e){return Hr(e,!0)}function Hr(e,t){return me(e)?e:new Is(e,t)}class Is{constructor(t,n){this.dep=new Ki,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=n?t:K(t),this._value=n?t:je(t),this.__v_isShallow=n}get value(){return this.dep.track(),this._value}set value(t){const n=this._rawValue,i=this.__v_isShallow||ke(t)||ct(t);t=i?t:K(t),yt(t,n)&&(this._rawValue=t,this._value=i?t:je(t),this.dep.trigger())}}function bt(e){return me(e)?e.value:e}const Ts={get:(e,t,n)=>t==="__v_raw"?e:bt(Reflect.get(e,t,n)),set:(e,t,n,i)=>{const o=e[t];return me(o)&&!me(n)?(o.value=n,!0):Reflect.set(e,t,n,i)}};function Ur(e){return kt(e)?e:new Proxy(e,Ts)}class Os{constructor(t,n,i){this.fn=t,this.setter=n,this._value=void 0,this.dep=new Ki(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=wn-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!n,this.isSSR=i}notify(){if(this.flags|=16,!(this.flags&8)&&Z!==this)return Ir(this,!0),!0}get value(){const t=this.dep.track();return Mr(this),t&&(t.version=this.dep.version),this._value}set value(t){this.setter&&this.setter(t)}}function Ms(e,t,n=!1){let i,o;return U(e)?i=e:(i=e.get,o=e.set),new Os(i,o,n)}const Tn={},Fn=new WeakMap;let Ot;function Rs(e,t=!1,n=Ot){if(n){let i=Fn.get(n);i||Fn.set(n,i=[]),i.push(e)}}function Ps(e,t,n=ee){const{immediate:i,deep:o,once:r,scheduler:l,augmentJob:s,call:c}=n,f=x=>o?x:ke(x)||o===!1||o===0?vt(x,1):vt(x);let a,u,g,h,A=!1,S=!1;if(me(e)?(u=()=>e.value,A=ke(e)):kt(e)?(u=()=>f(e),A=!0):H(e)?(S=!0,A=e.some(x=>kt(x)||ke(x)),u=()=>e.map(x=>{if(me(x))return x.value;if(kt(x))return f(x);if(U(x))return c?c(x,2):x()})):U(e)?t?u=c?()=>c(e,2):e:u=()=>{if(g){lt();try{g()}finally{st()}}const x=Ot;Ot=a;try{return c?c(e,3,[h]):e(h)}finally{Ot=x}}:u=Qe,t&&o){const x=u,G=o===!0?1/0:o;u=()=>vt(x(),G)}const k=ss(),R=()=>{a.stop(),k&&k.active&&Gi(k.effects,a)};if(r&&t){const x=t;t=(...G)=>{x(...G),R()}}let w=S?new Array(e.length).fill(Tn):Tn;const E=x=>{if(!(!(a.flags&1)||!a.dirty&&!x))if(t){const G=a.run();if(o||A||(S?G.some((ie,oe)=>yt(ie,w[oe])):yt(G,w))){g&&g();const ie=Ot;Ot=a;try{const oe=[G,w===Tn?void 0:S&&w[0]===Tn?[]:w,h];w=G,c?c(t,3,oe):t(...oe)}finally{Ot=ie}}}else a.run()};return s&&s(E),a=new Er(u),a.scheduler=l?()=>l(E,!1):E,h=x=>Rs(x,!1,a),g=a.onStop=()=>{const x=Fn.get(a);if(x){if(c)c(x,4);else for(const G of x)G();Fn.delete(a)}},t?i?E(!0):w=a.run():l?l(E.bind(null,!0),!0):a.run(),R.pause=a.pause.bind(a),R.resume=a.resume.bind(a),R.stop=R,R}function vt(e,t=1/0,n){if(t<=0||!te(e)||e.__v_skip||(n=n||new Map,(n.get(e)||0)>=t))return e;if(n.set(e,t),t--,me(e))vt(e.value,t,n);else if(H(e))for(let i=0;i<e.length;i++)vt(e[i],t,n);else if(mr(e)||zt(e))e.forEach(i=>{vt(i,t,n)});else if(yr(e)){for(const i in e)vt(e[i],t,n);for(const i of Object.getOwnPropertySymbols(e))Object.prototype.propertyIsEnumerable.call(e,i)&&vt(e[i],t,n)}return e}function Cn(e,t,n,i){try{return i?e(...i):e()}catch(o){ei(o,t,n)}}function Je(e,t,n,i){if(U(e)){const o=Cn(e,t,n,i);return o&&wr(o)&&o.catch(r=>{ei(r,t,n)}),o}if(H(e)){const o=[];for(let r=0;r<e.length;r++)o.push(Je(e[r],t,n,i));return o}}function ei(e,t,n,i=!0){const o=t?t.vnode:null,{errorHandler:r,throwUnhandledErrorInProduction:l}=t&&t.appContext.config||ee;if(t){let s=t.parent;const c=t.proxy,f=`https://vuejs.org/error-reference/#runtime-${n}`;for(;s;){const a=s.ec;if(a){for(let u=0;u<a.length;u++)if(a[u](e,c,f)===!1)return}s=s.parent}if(r){lt(),Cn(r,null,10,[e,c,f]),st();return}}ks(e,n,o,i,l)}function ks(e,t,n,i=!0,o=!1){if(o)throw e;console.error(e)}const be=[];let Ke=-1;const Kt=[];let gt=null,Ut=0;const Gr=Promise.resolve();let Dn=null;function Vr(e){const t=Dn||Gr;return e?t.then(this?e.bind(this):e):t}function Ns(e){let t=Ke+1,n=be.length;for(;t<n;){const i=t+n>>>1,o=be[i],r=yn(o);r<e||r===e&&o.flags&2?t=i+1:n=i}return t}function Ji(e){if(!(e.flags&1)){const t=yn(e),n=be[be.length-1];!n||!(e.flags&2)&&t>=yn(n)?be.push(e):be.splice(Ns(t),0,e),e.flags|=1,qr()}}function qr(){Dn||(Dn=Gr.then(zr))}function Fs(e){H(e)?Kt.push(...e):gt&&e.id===-1?gt.splice(Ut+1,0,e):e.flags&1||(Kt.push(e),e.flags|=1),qr()}function vo(e,t,n=Ke+1){for(;n<be.length;n++){const i=be[n];if(i&&i.flags&2){if(e&&i.id!==e.uid)continue;be.splice(n,1),n--,i.flags&4&&(i.flags&=-2),i(),i.flags&4||(i.flags&=-2)}}}function Wr(e){if(Kt.length){const t=[...new Set(Kt)].sort((n,i)=>yn(n)-yn(i));if(Kt.length=0,gt){gt.push(...t);return}for(gt=t,Ut=0;Ut<gt.length;Ut++){const n=gt[Ut];n.flags&4&&(n.flags&=-2),n.flags&8||n(),n.flags&=-2}gt=null,Ut=0}}const yn=e=>e.id==null?e.flags&2?-1:1/0:e.id;function zr(e){try{for(Ke=0;Ke<be.length;Ke++){const t=be[Ke];t&&!(t.flags&8)&&(t.flags&4&&(t.flags&=-2),Cn(t,t.i,t.i?15:14),t.flags&4||(t.flags&=-2))}}finally{for(;Ke<be.length;Ke++){const t=be[Ke];t&&(t.flags&=-2)}Ke=-1,be.length=0,Wr(),Dn=null,(be.length||Kt.length)&&zr()}}let De=null,Kr=null;function Ln(e){const t=De;return De=e,Kr=e&&e.type.__scopeId||null,t}function Oi(e,t=De,n){if(!t||e._n)return e;const i=(...o)=>{i._d&&$n(-1);const r=Ln(t);let l;try{l=e(...o)}finally{Ln(r),i._d&&$n(1)}return l};return i._n=!0,i._c=!0,i._d=!0,i}function It(e,t,n,i){const o=e.dirs,r=t&&t.dirs;for(let l=0;l<o.length;l++){const s=o[l];r&&(s.oldValue=r[l].value);let c=s.dir[i];c&&(lt(),Je(c,n,8,[e.el,s,e,t]),st())}}function On(e,t){if(ge){let n=ge.provides;const i=ge.parent&&ge.parent.provides;i===n&&(n=ge.provides=Object.create(i)),n[e]=t}}function rt(e,t,n=!1){const i=jc();if(i||Yt){let o=Yt?Yt._context.provides:i?i.parent==null||i.ce?i.vnode.appContext&&i.vnode.appContext.provides:i.parent.provides:void 0;if(o&&e in o)return o[e];if(arguments.length>1)return n&&U(t)?t.call(i&&i.proxy):t}}const Ds=Symbol.for("v-scx"),Ls=()=>rt(Ds);function Mn(e,t,n){return Yr(e,t,n)}function Yr(e,t,n=ee){const{immediate:i,deep:o,flush:r,once:l}=n,s=de({},n),c=t&&i||!t&&r!=="post";let f;if(xn){if(r==="sync"){const h=Ls();f=h.__watcherHandles||(h.__watcherHandles=[])}else if(!c){const h=()=>{};return h.stop=Qe,h.resume=Qe,h.pause=Qe,h}}const a=ge;s.call=(h,A,S)=>Je(h,a,A,S);let u=!1;r==="post"?s.scheduler=h=>{Me(h,a&&a.suspense)}:r!=="sync"&&(u=!0,s.scheduler=(h,A)=>{A?h():Ji(h)}),s.augmentJob=h=>{t&&(h.flags|=4),u&&(h.flags|=2,a&&(h.id=a.uid,h.i=a))};const g=Ps(e,t,s);return xn&&(f?f.push(g):c&&g()),g}function js(e,t,n){const i=this.proxy,o=ae(e)?e.includes(".")?Qr(i,e):()=>i[e]:e.bind(i,i);let r;U(t)?r=t:(r=t.handler,n=t);const l=En(this),s=Yr(o,r.bind(i),n);return l(),s}function Qr(e,t){const n=t.split(".");return()=>{let i=e;for(let o=0;o<n.length&&i;o++)i=i[n[o]];return i}}const Bs=Symbol("_vte"),$s=e=>e.__isTeleport,Hs=Symbol("_leaveCb");function Zi(e,t){e.shapeFlag&6&&e.component?(e.transition=t,Zi(e.component.subTree,t)):e.shapeFlag&128?(e.ssContent.transition=t.clone(e.ssContent),e.ssFallback.transition=t.clone(e.ssFallback)):e.transition=t}function tn(e,t){return U(e)?de({name:e.name},t,{setup:e}):e}function Xr(e){e.ids=[e.ids[0]+e.ids[2]+++"-",0,0]}const jn=new WeakMap;function pn(e,t,n,i,o=!1){if(H(e)){e.forEach((A,S)=>pn(A,t&&(H(t)?t[S]:t),n,i,o));return}if(dn(i)&&!o){i.shapeFlag&512&&i.type.__asyncResolved&&i.component.subTree.component&&pn(e,t,n,i.component.subTree);return}const r=i.shapeFlag&4?oo(i.component):i.el,l=o?null:r,{i:s,r:c}=e,f=t&&t.r,a=s.refs===ee?s.refs={}:s.refs,u=s.setupState,g=K(u),h=u===ee?gr:A=>Y(g,A);if(f!=null&&f!==c){if(yo(t),ae(f))a[f]=null,h(f)&&(u[f]=null);else if(me(f)){f.value=null;const A=t;A.k&&(a[A.k]=null)}}if(U(c))Cn(c,s,12,[l,a]);else{const A=ae(c),S=me(c);if(A||S){const k=()=>{if(e.f){const R=A?h(c)?u[c]:a[c]:c.value;if(o)H(R)&&Gi(R,r);else if(H(R))R.includes(r)||R.push(r);else if(A)a[c]=[r],h(c)&&(u[c]=a[c]);else{const w=[r];c.value=w,e.k&&(a[e.k]=w)}}else A?(a[c]=l,h(c)&&(u[c]=l)):S&&(c.value=l,e.k&&(a[e.k]=l))};if(l){const R=()=>{k(),jn.delete(e)};R.id=-1,jn.set(e,R),Me(R,n)}else yo(e),k()}}}function yo(e){const t=jn.get(e);t&&(t.flags|=8,jn.delete(e))}Xn().requestIdleCallback;Xn().cancelIdleCallback;const dn=e=>!!e.type.__asyncLoader,Jr=e=>e.type.__isKeepAlive;function Us(e,t){Zr(e,"a",t)}function Gs(e,t){Zr(e,"da",t)}function Zr(e,t,n=ge){const i=e.__wdc||(e.__wdc=()=>{let o=n;for(;o;){if(o.isDeactivated)return;o=o.parent}return e()});if(ti(t,i,n),n){let o=n.parent;for(;o&&o.parent;)Jr(o.parent.vnode)&&Vs(i,t,n,o),o=o.parent}}function Vs(e,t,n,i){const o=ti(t,e,i,!0);eo(()=>{Gi(i[t],o)},n)}function ti(e,t,n=ge,i=!1){if(n){const o=n[e]||(n[e]=[]),r=t.__weh||(t.__weh=(...l)=>{lt();const s=En(n),c=Je(t,n,e,l);return s(),st(),c});return i?o.unshift(r):o.push(r),r}}const at=e=>(t,n=ge)=>{(!xn||e==="sp")&&ti(e,(...i)=>t(...i),n)},qs=at("bm"),el=at("m"),Ws=at("bu"),zs=at("u"),Ks=at("bum"),eo=at("um"),Ys=at("sp"),Qs=at("rtg"),Xs=at("rtc");function Js(e,t=ge){ti("ec",e,t)}const Zs="components";function ec(e,t){return nc(Zs,e,!0,t)||e}const tc=Symbol.for("v-ndc");function nc(e,t,n=!0,i=!1){const o=De||ge;if(o){const r=o.type;{const s=Gc(r,!1);if(s&&(s===t||s===Ne(t)||s===Qn(Ne(t))))return r}const l=bo(o[e]||r[e],t)||bo(o.appContext[e],t);return!l&&i?r:l}}function bo(e,t){return e&&(e[t]||e[Ne(t)]||e[Qn(Ne(t))])}function Se(e,t,n,i){let o;const r=n,l=H(e);if(l||ae(e)){const s=l&&kt(e);let c=!1,f=!1;s&&(c=!ke(e),f=ct(e),e=Jn(e)),o=new Array(e.length);for(let a=0,u=e.length;a<u;a++)o[a]=t(c?f?Qt(je(e[a])):je(e[a]):e[a],a,void 0,r)}else if(typeof e=="number"){o=new Array(e);for(let s=0;s<e;s++)o[s]=t(s+1,s,void 0,r)}else if(te(e))if(e[Symbol.iterator])o=Array.from(e,(s,c)=>t(s,c,void 0,r));else{const s=Object.keys(e);o=new Array(s.length);for(let c=0,f=s.length;c<f;c++){const a=s[c];o[c]=t(e[a],a,c,r)}}else o=[];return o}const Mi=e=>e?yl(e)?oo(e):Mi(e.parent):null,hn=de(Object.create(null),{$:e=>e,$el:e=>e.vnode.el,$data:e=>e.data,$props:e=>e.props,$attrs:e=>e.attrs,$slots:e=>e.slots,$refs:e=>e.refs,$parent:e=>Mi(e.parent),$root:e=>Mi(e.root),$host:e=>e.ce,$emit:e=>e.emit,$options:e=>nl(e),$forceUpdate:e=>e.f||(e.f=()=>{Ji(e.update)}),$nextTick:e=>e.n||(e.n=Vr.bind(e.proxy)),$watch:e=>js.bind(e)}),di=(e,t)=>e!==ee&&!e.__isScriptSetup&&Y(e,t),ic={get({_:e},t){if(t==="__v_skip")return!0;const{ctx:n,setupState:i,data:o,props:r,accessCache:l,type:s,appContext:c}=e;if(t[0]!=="$"){const g=l[t];if(g!==void 0)switch(g){case 1:return i[t];case 2:return o[t];case 4:return n[t];case 3:return r[t]}else{if(di(i,t))return l[t]=1,i[t];if(o!==ee&&Y(o,t))return l[t]=2,o[t];if(Y(r,t))return l[t]=3,r[t];if(n!==ee&&Y(n,t))return l[t]=4,n[t];Ri&&(l[t]=0)}}const f=hn[t];let a,u;if(f)return t==="$attrs"&&he(e.attrs,"get",""),f(e);if((a=s.__cssModules)&&(a=a[t]))return a;if(n!==ee&&Y(n,t))return l[t]=4,n[t];if(u=c.config.globalProperties,Y(u,t))return u[t]},set({_:e},t,n){const{data:i,setupState:o,ctx:r}=e;return di(o,t)?(o[t]=n,!0):i!==ee&&Y(i,t)?(i[t]=n,!0):Y(e.props,t)||t[0]==="$"&&t.slice(1)in e?!1:(r[t]=n,!0)},has({_:{data:e,setupState:t,accessCache:n,ctx:i,appContext:o,props:r,type:l}},s){let c;return!!(n[s]||e!==ee&&s[0]!=="$"&&Y(e,s)||di(t,s)||Y(r,s)||Y(i,s)||Y(hn,s)||Y(o.config.globalProperties,s)||(c=l.__cssModules)&&c[s])},defineProperty(e,t,n){return n.get!=null?e._.accessCache[t]=0:Y(n,"value")&&this.set(e,t,n.value,null),Reflect.defineProperty(e,t,n)}};function xo(e){return H(e)?e.reduce((t,n)=>(t[n]=null,t),{}):e}let Ri=!0;function oc(e){const t=nl(e),n=e.proxy,i=e.ctx;Ri=!1,t.beforeCreate&&_o(t.beforeCreate,e,"bc");const{data:o,computed:r,methods:l,watch:s,provide:c,inject:f,created:a,beforeMount:u,mounted:g,beforeUpdate:h,updated:A,activated:S,deactivated:k,beforeDestroy:R,beforeUnmount:w,destroyed:E,unmounted:x,render:G,renderTracked:ie,renderTriggered:oe,errorCaptured:$e,serverPrefetch:ut,expose:He,inheritAttrs:ft,components:Et,directives:Ue,filters:nn}=t;if(f&&rc(f,i,null),l)for(const X in l){const W=l[X];U(W)&&(i[X]=W.bind(n))}if(o){const X=o.call(n,n);te(X)&&(e.data=Zn(X))}if(Ri=!0,r)for(const X in r){const W=r[X],Ze=U(W)?W.bind(n,n):U(W.get)?W.get.bind(n,n):Qe,pt=!U(W)&&U(W.set)?W.set.bind(n):Qe,Ge=Fe({get:Ze,set:pt});Object.defineProperty(i,X,{enumerable:!0,configurable:!0,get:()=>Ge.value,set:_e=>Ge.value=_e})}if(s)for(const X in s)tl(s[X],i,n,X);if(c){const X=U(c)?c.call(n):c;Reflect.ownKeys(X).forEach(W=>{On(W,X[W])})}a&&_o(a,e,"c");function pe(X,W){H(W)?W.forEach(Ze=>X(Ze.bind(n))):W&&X(W.bind(n))}if(pe(qs,u),pe(el,g),pe(Ws,h),pe(zs,A),pe(Us,S),pe(Gs,k),pe(Js,$e),pe(Xs,ie),pe(Qs,oe),pe(Ks,w),pe(eo,x),pe(Ys,ut),H(He))if(He.length){const X=e.exposed||(e.exposed={});He.forEach(W=>{Object.defineProperty(X,W,{get:()=>n[W],set:Ze=>n[W]=Ze,enumerable:!0})})}else e.exposed||(e.exposed={});G&&e.render===Qe&&(e.render=G),ft!=null&&(e.inheritAttrs=ft),Et&&(e.components=Et),Ue&&(e.directives=Ue),ut&&Xr(e)}function rc(e,t,n=Qe){H(e)&&(e=Pi(e));for(const i in e){const o=e[i];let r;te(o)?"default"in o?r=rt(o.from||i,o.default,!0):r=rt(o.from||i):r=rt(o),me(r)?Object.defineProperty(t,i,{enumerable:!0,configurable:!0,get:()=>r.value,set:l=>r.value=l}):t[i]=r}}function _o(e,t,n){Je(H(e)?e.map(i=>i.bind(t.proxy)):e.bind(t.proxy),t,n)}function tl(e,t,n,i){let o=i.includes(".")?Qr(n,i):()=>n[i];if(ae(e)){const r=t[e];U(r)&&Mn(o,r)}else if(U(e))Mn(o,e.bind(n));else if(te(e))if(H(e))e.forEach(r=>tl(r,t,n,i));else{const r=U(e.handler)?e.handler.bind(n):t[e.handler];U(r)&&Mn(o,r,e)}}function nl(e){const t=e.type,{mixins:n,extends:i}=t,{mixins:o,optionsCache:r,config:{optionMergeStrategies:l}}=e.appContext,s=r.get(t);let c;return s?c=s:!o.length&&!n&&!i?c=t:(c={},o.length&&o.forEach(f=>Bn(c,f,l,!0)),Bn(c,t,l)),te(t)&&r.set(t,c),c}function Bn(e,t,n,i=!1){const{mixins:o,extends:r}=t;r&&Bn(e,r,n,!0),o&&o.forEach(l=>Bn(e,l,n,!0));for(const l in t)if(!(i&&l==="expose")){const s=lc[l]||n&&n[l];e[l]=s?s(e[l],t[l]):t[l]}return e}const lc={data:Ao,props:Co,emits:Co,methods:cn,computed:cn,beforeCreate:ve,created:ve,beforeMount:ve,mounted:ve,beforeUpdate:ve,updated:ve,beforeDestroy:ve,beforeUnmount:ve,destroyed:ve,unmounted:ve,activated:ve,deactivated:ve,errorCaptured:ve,serverPrefetch:ve,components:cn,directives:cn,watch:cc,provide:Ao,inject:sc};function Ao(e,t){return t?e?function(){return de(U(e)?e.call(this,this):e,U(t)?t.call(this,this):t)}:t:e}function sc(e,t){return cn(Pi(e),Pi(t))}function Pi(e){if(H(e)){const t={};for(let n=0;n<e.length;n++)t[e[n]]=e[n];return t}return e}function ve(e,t){return e?[...new Set([].concat(e,t))]:t}function cn(e,t){return e?de(Object.create(null),e,t):t}function Co(e,t){return e?H(e)&&H(t)?[...new Set([...e,...t])]:de(Object.create(null),xo(e),xo(t??{})):t}function cc(e,t){if(!e)return t;if(!t)return e;const n=de(Object.create(null),e);for(const i in t)n[i]=ve(e[i],t[i]);return n}function il(){return{app:null,config:{isNativeTag:gr,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let ac=0;function uc(e,t){return function(i,o=null){U(i)||(i=de({},i)),o!=null&&!te(o)&&(o=null);const r=il(),l=new WeakSet,s=[];let c=!1;const f=r.app={_uid:ac++,_component:i,_props:o,_container:null,_context:r,_instance:null,version:qc,get config(){return r.config},set config(a){},use(a,...u){return l.has(a)||(a&&U(a.install)?(l.add(a),a.install(f,...u)):U(a)&&(l.add(a),a(f,...u))),f},mixin(a){return r.mixins.includes(a)||r.mixins.push(a),f},component(a,u){return u?(r.components[a]=u,f):r.components[a]},directive(a,u){return u?(r.directives[a]=u,f):r.directives[a]},mount(a,u,g){if(!c){const h=f._ceVNode||fe(i,o);return h.appContext=r,g===!0?g="svg":g===!1&&(g=void 0),e(h,a,g),c=!0,f._container=a,a.__vue_app__=f,oo(h.component)}},onUnmount(a){s.push(a)},unmount(){c&&(Je(s,f._instance,16),e(null,f._container),delete f._container.__vue_app__)},provide(a,u){return r.provides[a]=u,f},runWithContext(a){const u=Yt;Yt=f;try{return a()}finally{Yt=u}}};return f}}let Yt=null;const fc=(e,t)=>t==="modelValue"||t==="model-value"?e.modelModifiers:e[`${t}Modifiers`]||e[`${Ne(t)}Modifiers`]||e[`${Ft(t)}Modifiers`];function pc(e,t,...n){if(e.isUnmounted)return;const i=e.vnode.props||ee;let o=n;const r=t.startsWith("update:"),l=r&&fc(i,t.slice(7));l&&(l.trim&&(o=n.map(a=>ae(a)?a.trim():a)),l.number&&(o=n.map(Zl)));let s,c=i[s=si(t)]||i[s=si(Ne(t))];!c&&r&&(c=i[s=si(Ft(t))]),c&&Je(c,e,6,o);const f=i[s+"Once"];if(f){if(!e.emitted)e.emitted={};else if(e.emitted[s])return;e.emitted[s]=!0,Je(f,e,6,o)}}const dc=new WeakMap;function ol(e,t,n=!1){const i=n?dc:t.emitsCache,o=i.get(e);if(o!==void 0)return o;const r=e.emits;let l={},s=!1;if(!U(e)){const c=f=>{const a=ol(f,t,!0);a&&(s=!0,de(l,a))};!n&&t.mixins.length&&t.mixins.forEach(c),e.extends&&c(e.extends),e.mixins&&e.mixins.forEach(c)}return!r&&!s?(te(e)&&i.set(e,null),null):(H(r)?r.forEach(c=>l[c]=null):de(l,r),te(e)&&i.set(e,l),l)}function ni(e,t){return!e||!zn(t)?!1:(t=t.slice(2).replace(/Once$/,""),Y(e,t[0].toLowerCase()+t.slice(1))||Y(e,Ft(t))||Y(e,t))}function Eo(e){const{type:t,vnode:n,proxy:i,withProxy:o,propsOptions:[r],slots:l,attrs:s,emit:c,render:f,renderCache:a,props:u,data:g,setupState:h,ctx:A,inheritAttrs:S}=e,k=Ln(e);let R,w;try{if(n.shapeFlag&4){const x=o||i,G=x;R=Ye(f.call(G,x,a,u,h,g,A)),w=s}else{const x=t;R=Ye(x.length>1?x(u,{attrs:s,slots:l,emit:c}):x(u,null)),w=t.props?s:hc(s)}}catch(x){gn.length=0,ei(x,e,1),R=fe(_t)}let E=R;if(w&&S!==!1){const x=Object.keys(w),{shapeFlag:G}=E;x.length&&G&7&&(r&&x.some(Ui)&&(w=gc(w,r)),E=Xt(E,w,!1,!0))}return n.dirs&&(E=Xt(E,null,!1,!0),E.dirs=E.dirs?E.dirs.concat(n.dirs):n.dirs),n.transition&&Zi(E,n.transition),R=E,Ln(k),R}const hc=e=>{let t;for(const n in e)(n==="class"||n==="style"||zn(n))&&((t||(t={}))[n]=e[n]);return t},gc=(e,t)=>{const n={};for(const i in e)(!Ui(i)||!(i.slice(9)in t))&&(n[i]=e[i]);return n};function mc(e,t,n){const{props:i,children:o,component:r}=e,{props:l,children:s,patchFlag:c}=t,f=r.emitsOptions;if(t.dirs||t.transition)return!0;if(n&&c>=0){if(c&1024)return!0;if(c&16)return i?So(i,l,f):!!l;if(c&8){const a=t.dynamicProps;for(let u=0;u<a.length;u++){const g=a[u];if(l[g]!==i[g]&&!ni(f,g))return!0}}}else return(o||s)&&(!s||!s.$stable)?!0:i===l?!1:i?l?So(i,l,f):!0:!!l;return!1}function So(e,t,n){const i=Object.keys(t);if(i.length!==Object.keys(e).length)return!0;for(let o=0;o<i.length;o++){const r=i[o];if(t[r]!==e[r]&&!ni(n,r))return!0}return!1}function wc({vnode:e,parent:t},n){for(;t;){const i=t.subTree;if(i.suspense&&i.suspense.activeBranch===e&&(i.el=e.el),i===e)(e=t.vnode).el=n,t=t.parent;else break}}const rl={},ll=()=>Object.create(rl),sl=e=>Object.getPrototypeOf(e)===rl;function vc(e,t,n,i=!1){const o={},r=ll();e.propsDefaults=Object.create(null),cl(e,t,o,r);for(const l in e.propsOptions[0])l in o||(o[l]=void 0);n?e.props=i?o:Br(o):e.type.props?e.props=o:e.props=r,e.attrs=r}function yc(e,t,n,i){const{props:o,attrs:r,vnode:{patchFlag:l}}=e,s=K(o),[c]=e.propsOptions;let f=!1;if((i||l>0)&&!(l&16)){if(l&8){const a=e.vnode.dynamicProps;for(let u=0;u<a.length;u++){let g=a[u];if(ni(e.emitsOptions,g))continue;const h=t[g];if(c)if(Y(r,g))h!==r[g]&&(r[g]=h,f=!0);else{const A=Ne(g);o[A]=ki(c,s,A,h,e,!1)}else h!==r[g]&&(r[g]=h,f=!0)}}}else{cl(e,t,o,r)&&(f=!0);let a;for(const u in s)(!t||!Y(t,u)&&((a=Ft(u))===u||!Y(t,a)))&&(c?n&&(n[u]!==void 0||n[a]!==void 0)&&(o[u]=ki(c,s,u,void 0,e,!0)):delete o[u]);if(r!==s)for(const u in r)(!t||!Y(t,u))&&(delete r[u],f=!0)}f&&it(e.attrs,"set","")}function cl(e,t,n,i){const[o,r]=e.propsOptions;let l=!1,s;if(t)for(let c in t){if(an(c))continue;const f=t[c];let a;o&&Y(o,a=Ne(c))?!r||!r.includes(a)?n[a]=f:(s||(s={}))[a]=f:ni(e.emitsOptions,c)||(!(c in i)||f!==i[c])&&(i[c]=f,l=!0)}if(r){const c=K(n),f=s||ee;for(let a=0;a<r.length;a++){const u=r[a];n[u]=ki(o,c,u,f[u],e,!Y(f,u))}}return l}function ki(e,t,n,i,o,r){const l=e[n];if(l!=null){const s=Y(l,"default");if(s&&i===void 0){const c=l.default;if(l.type!==Function&&!l.skipFactory&&U(c)){const{propsDefaults:f}=o;if(n in f)i=f[n];else{const a=En(o);i=f[n]=c.call(null,t),a()}}else i=c;o.ce&&o.ce._setProp(n,i)}l[0]&&(r&&!s?i=!1:l[1]&&(i===""||i===Ft(n))&&(i=!0))}return i}const bc=new WeakMap;function al(e,t,n=!1){const i=n?bc:t.propsCache,o=i.get(e);if(o)return o;const r=e.props,l={},s=[];let c=!1;if(!U(e)){const a=u=>{c=!0;const[g,h]=al(u,t,!0);de(l,g),h&&s.push(...h)};!n&&t.mixins.length&&t.mixins.forEach(a),e.extends&&a(e.extends),e.mixins&&e.mixins.forEach(a)}if(!r&&!c)return te(e)&&i.set(e,Wt),Wt;if(H(r))for(let a=0;a<r.length;a++){const u=Ne(r[a]);Io(u)&&(l[u]=ee)}else if(r)for(const a in r){const u=Ne(a);if(Io(u)){const g=r[a],h=l[u]=H(g)||U(g)?{type:g}:de({},g),A=h.type;let S=!1,k=!0;if(H(A))for(let R=0;R<A.length;++R){const w=A[R],E=U(w)&&w.name;if(E==="Boolean"){S=!0;break}else E==="String"&&(k=!1)}else S=U(A)&&A.name==="Boolean";h[0]=S,h[1]=k,(S||Y(h,"default"))&&s.push(u)}}const f=[l,s];return te(e)&&i.set(e,f),f}function Io(e){return e[0]!=="$"&&!an(e)}const to=e=>e==="_"||e==="_ctx"||e==="$stable",no=e=>H(e)?e.map(Ye):[Ye(e)],xc=(e,t,n)=>{if(t._n)return t;const i=Oi((...o)=>no(t(...o)),n);return i._c=!1,i},ul=(e,t,n)=>{const i=e._ctx;for(const o in e){if(to(o))continue;const r=e[o];if(U(r))t[o]=xc(o,r,i);else if(r!=null){const l=no(r);t[o]=()=>l}}},fl=(e,t)=>{const n=no(t);e.slots.default=()=>n},pl=(e,t,n)=>{for(const i in t)(n||!to(i))&&(e[i]=t[i])},_c=(e,t,n)=>{const i=e.slots=ll();if(e.vnode.shapeFlag&32){const o=t._;o?(pl(i,t,n),n&&br(i,"_",o,!0)):ul(t,i)}else t&&fl(e,t)},Ac=(e,t,n)=>{const{vnode:i,slots:o}=e;let r=!0,l=ee;if(i.shapeFlag&32){const s=t._;s?n&&s===1?r=!1:pl(o,t,n):(r=!t.$stable,ul(t,o)),l=t}else t&&(fl(e,t),l={default:1});if(r)for(const s in o)!to(s)&&l[s]==null&&delete o[s]},Me=Tc;function Cc(e){return Ec(e)}function Ec(e,t){const n=Xn();n.__VUE__=!0;const{insert:i,remove:o,patchProp:r,createElement:l,createText:s,createComment:c,setText:f,setElementText:a,parentNode:u,nextSibling:g,setScopeId:h=Qe,insertStaticContent:A}=e,S=(p,d,m,v=null,_=null,y=null,O=void 0,T=null,I=!!d.dynamicChildren)=>{if(p===d)return;p&&!ln(p,d)&&(v=b(p),_e(p,_,y,!0),p=null),d.patchFlag===-2&&(I=!1,d.dynamicChildren=null);const{type:C,ref:B,shapeFlag:P}=d;switch(C){case ii:k(p,d,m,v);break;case _t:R(p,d,m,v);break;case Rn:p==null&&w(d,m,v,O);break;case ne:Et(p,d,m,v,_,y,O,T,I);break;default:P&1?G(p,d,m,v,_,y,O,T,I):P&6?Ue(p,d,m,v,_,y,O,T,I):(P&64||P&128)&&C.process(p,d,m,v,_,y,O,T,I,D)}B!=null&&_?pn(B,p&&p.ref,y,d||p,!d):B==null&&p&&p.ref!=null&&pn(p.ref,null,y,p,!0)},k=(p,d,m,v)=>{if(p==null)i(d.el=s(d.children),m,v);else{const _=d.el=p.el;d.children!==p.children&&f(_,d.children)}},R=(p,d,m,v)=>{p==null?i(d.el=c(d.children||""),m,v):d.el=p.el},w=(p,d,m,v)=>{[p.el,p.anchor]=A(p.children,d,m,v,p.el,p.anchor)},E=({el:p,anchor:d},m,v)=>{let _;for(;p&&p!==d;)_=g(p),i(p,m,v),p=_;i(d,m,v)},x=({el:p,anchor:d})=>{let m;for(;p&&p!==d;)m=g(p),o(p),p=m;o(d)},G=(p,d,m,v,_,y,O,T,I)=>{if(d.type==="svg"?O="svg":d.type==="math"&&(O="mathml"),p==null)ie(d,m,v,_,y,O,T,I);else{const C=p.el&&p.el._isVueCE?p.el:null;try{C&&C._beginPatch(),ut(p,d,_,y,O,T,I)}finally{C&&C._endPatch()}}},ie=(p,d,m,v,_,y,O,T)=>{let I,C;const{props:B,shapeFlag:P,transition:L,dirs:$}=p;if(I=p.el=l(p.type,y,B&&B.is,B),P&8?a(I,p.children):P&16&&$e(p.children,I,null,v,_,hi(p,y),O,T),$&&It(p,null,v,"created"),oe(I,p,p.scopeId,O,v),B){for(const J in B)J!=="value"&&!an(J)&&r(I,J,null,B[J],y,v);"value"in B&&r(I,"value",null,B.value,y),(C=B.onVnodeBeforeMount)&&ze(C,v,p)}$&&It(p,null,v,"beforeMount");const q=Sc(_,L);q&&L.beforeEnter(I),i(I,d,m),((C=B&&B.onVnodeMounted)||q||$)&&Me(()=>{C&&ze(C,v,p),q&&L.enter(I),$&&It(p,null,v,"mounted")},_)},oe=(p,d,m,v,_)=>{if(m&&h(p,m),v)for(let y=0;y<v.length;y++)h(p,v[y]);if(_){let y=_.subTree;if(d===y||ml(y.type)&&(y.ssContent===d||y.ssFallback===d)){const O=_.vnode;oe(p,O,O.scopeId,O.slotScopeIds,_.parent)}}},$e=(p,d,m,v,_,y,O,T,I=0)=>{for(let C=I;C<p.length;C++){const B=p[C]=T?mt(p[C]):Ye(p[C]);S(null,B,d,m,v,_,y,O,T)}},ut=(p,d,m,v,_,y,O)=>{const T=d.el=p.el;let{patchFlag:I,dynamicChildren:C,dirs:B}=d;I|=p.patchFlag&16;const P=p.props||ee,L=d.props||ee;let $;if(m&&Tt(m,!1),($=L.onVnodeBeforeUpdate)&&ze($,m,d,p),B&&It(d,p,m,"beforeUpdate"),m&&Tt(m,!0),(P.innerHTML&&L.innerHTML==null||P.textContent&&L.textContent==null)&&a(T,""),C?He(p.dynamicChildren,C,T,m,v,hi(d,_),y):O||W(p,d,T,null,m,v,hi(d,_),y,!1),I>0){if(I&16)ft(T,P,L,m,_);else if(I&2&&P.class!==L.class&&r(T,"class",null,L.class,_),I&4&&r(T,"style",P.style,L.style,_),I&8){const q=d.dynamicProps;for(let J=0;J<q.length;J++){const Q=q[J],Ae=P[Q],Ce=L[Q];(Ce!==Ae||Q==="value")&&r(T,Q,Ae,Ce,_,m)}}I&1&&p.children!==d.children&&a(T,d.children)}else!O&&C==null&&ft(T,P,L,m,_);(($=L.onVnodeUpdated)||B)&&Me(()=>{$&&ze($,m,d,p),B&&It(d,p,m,"updated")},v)},He=(p,d,m,v,_,y,O)=>{for(let T=0;T<d.length;T++){const I=p[T],C=d[T],B=I.el&&(I.type===ne||!ln(I,C)||I.shapeFlag&198)?u(I.el):m;S(I,C,B,null,v,_,y,O,!0)}},ft=(p,d,m,v,_)=>{if(d!==m){if(d!==ee)for(const y in d)!an(y)&&!(y in m)&&r(p,y,d[y],null,_,v);for(const y in m){if(an(y))continue;const O=m[y],T=d[y];O!==T&&y!=="value"&&r(p,y,T,O,_,v)}"value"in m&&r(p,"value",d.value,m.value,_)}},Et=(p,d,m,v,_,y,O,T,I)=>{const C=d.el=p?p.el:s(""),B=d.anchor=p?p.anchor:s("");let{patchFlag:P,dynamicChildren:L,slotScopeIds:$}=d;$&&(T=T?T.concat($):$),p==null?(i(C,m,v),i(B,m,v),$e(d.children||[],m,B,_,y,O,T,I)):P>0&&P&64&&L&&p.dynamicChildren&&p.dynamicChildren.length===L.length?(He(p.dynamicChildren,L,m,_,y,O,T),(d.key!=null||_&&d===_.subTree)&&dl(p,d,!0)):W(p,d,m,B,_,y,O,T,I)},Ue=(p,d,m,v,_,y,O,T,I)=>{d.slotScopeIds=T,p==null?d.shapeFlag&512?_.ctx.activate(d,m,v,O,I):nn(d,m,v,_,y,O,I):Dt(p,d,I)},nn=(p,d,m,v,_,y,O)=>{const T=p.component=Lc(p,v,_);if(Jr(p)&&(T.ctx.renderer=D),Bc(T,!1,O),T.asyncDep){if(_&&_.registerDep(T,pe,O),!p.el){const I=T.subTree=fe(_t);R(null,I,d,m),p.placeholder=I.el}}else pe(T,p,d,m,_,y,O)},Dt=(p,d,m)=>{const v=d.component=p.component;if(mc(p,d,m))if(v.asyncDep&&!v.asyncResolved){X(v,d,m);return}else v.next=d,v.update();else d.el=p.el,v.vnode=d},pe=(p,d,m,v,_,y,O)=>{const T=()=>{if(p.isMounted){let{next:P,bu:L,u:$,parent:q,vnode:J}=p;{const qe=hl(p);if(qe){P&&(P.el=J.el,X(p,P,O)),qe.asyncDep.then(()=>{p.isUnmounted||T()});return}}let Q=P,Ae;Tt(p,!1),P?(P.el=J.el,X(p,P,O)):P=J,L&&ci(L),(Ae=P.props&&P.props.onVnodeBeforeUpdate)&&ze(Ae,q,P,J),Tt(p,!0);const Ce=Eo(p),Ve=p.subTree;p.subTree=Ce,S(Ve,Ce,u(Ve.el),b(Ve),p,_,y),P.el=Ce.el,Q===null&&wc(p,Ce.el),$&&Me($,_),(Ae=P.props&&P.props.onVnodeUpdated)&&Me(()=>ze(Ae,q,P,J),_)}else{let P;const{el:L,props:$}=d,{bm:q,m:J,parent:Q,root:Ae,type:Ce}=p,Ve=dn(d);Tt(p,!1),q&&ci(q),!Ve&&(P=$&&$.onVnodeBeforeMount)&&ze(P,Q,d),Tt(p,!0);{Ae.ce&&Ae.ce._def.shadowRoot!==!1&&Ae.ce._injectChildStyle(Ce);const qe=p.subTree=Eo(p);S(null,qe,m,v,p,_,y),d.el=qe.el}if(J&&Me(J,_),!Ve&&(P=$&&$.onVnodeMounted)){const qe=d;Me(()=>ze(P,Q,qe),_)}(d.shapeFlag&256||Q&&dn(Q.vnode)&&Q.vnode.shapeFlag&256)&&p.a&&Me(p.a,_),p.isMounted=!0,d=m=v=null}};p.scope.on();const I=p.effect=new Er(T);p.scope.off();const C=p.update=I.run.bind(I),B=p.job=I.runIfDirty.bind(I);B.i=p,B.id=p.uid,I.scheduler=()=>Ji(B),Tt(p,!0),C()},X=(p,d,m)=>{d.component=p;const v=p.vnode.props;p.vnode=d,p.next=null,yc(p,d.props,v,m),Ac(p,d.children,m),lt(),vo(p),st()},W=(p,d,m,v,_,y,O,T,I=!1)=>{const C=p&&p.children,B=p?p.shapeFlag:0,P=d.children,{patchFlag:L,shapeFlag:$}=d;if(L>0){if(L&128){pt(C,P,m,v,_,y,O,T,I);return}else if(L&256){Ze(C,P,m,v,_,y,O,T,I);return}}$&8?(B&16&&Pe(C,_,y),P!==C&&a(m,P)):B&16?$&16?pt(C,P,m,v,_,y,O,T,I):Pe(C,_,y,!0):(B&8&&a(m,""),$&16&&$e(P,m,v,_,y,O,T,I))},Ze=(p,d,m,v,_,y,O,T,I)=>{p=p||Wt,d=d||Wt;const C=p.length,B=d.length,P=Math.min(C,B);let L;for(L=0;L<P;L++){const $=d[L]=I?mt(d[L]):Ye(d[L]);S(p[L],$,m,null,_,y,O,T,I)}C>B?Pe(p,_,y,!0,!1,P):$e(d,m,v,_,y,O,T,I,P)},pt=(p,d,m,v,_,y,O,T,I)=>{let C=0;const B=d.length;let P=p.length-1,L=B-1;for(;C<=P&&C<=L;){const $=p[C],q=d[C]=I?mt(d[C]):Ye(d[C]);if(ln($,q))S($,q,m,null,_,y,O,T,I);else break;C++}for(;C<=P&&C<=L;){const $=p[P],q=d[L]=I?mt(d[L]):Ye(d[L]);if(ln($,q))S($,q,m,null,_,y,O,T,I);else break;P--,L--}if(C>P){if(C<=L){const $=L+1,q=$<B?d[$].el:v;for(;C<=L;)S(null,d[C]=I?mt(d[C]):Ye(d[C]),m,q,_,y,O,T,I),C++}}else if(C>L)for(;C<=P;)_e(p[C],_,y,!0),C++;else{const $=C,q=C,J=new Map;for(C=q;C<=L;C++){const Oe=d[C]=I?mt(d[C]):Ye(d[C]);Oe.key!=null&&J.set(Oe.key,C)}let Q,Ae=0;const Ce=L-q+1;let Ve=!1,qe=0;const on=new Array(Ce);for(C=0;C<Ce;C++)on[C]=0;for(C=$;C<=P;C++){const Oe=p[C];if(Ae>=Ce){_e(Oe,_,y,!0);continue}let We;if(Oe.key!=null)We=J.get(Oe.key);else for(Q=q;Q<=L;Q++)if(on[Q-q]===0&&ln(Oe,d[Q])){We=Q;break}We===void 0?_e(Oe,_,y,!0):(on[We-q]=C+1,We>=qe?qe=We:Ve=!0,S(Oe,d[We],m,null,_,y,O,T,I),Ae++)}const fo=Ve?Ic(on):Wt;for(Q=fo.length-1,C=Ce-1;C>=0;C--){const Oe=q+C,We=d[Oe],po=d[Oe+1],ho=Oe+1<B?po.el||gl(po):v;on[C]===0?S(null,We,m,ho,_,y,O,T,I):Ve&&(Q<0||C!==fo[Q]?Ge(We,m,ho,2):Q--)}}},Ge=(p,d,m,v,_=null)=>{const{el:y,type:O,transition:T,children:I,shapeFlag:C}=p;if(C&6){Ge(p.component.subTree,d,m,v);return}if(C&128){p.suspense.move(d,m,v);return}if(C&64){O.move(p,d,m,D);return}if(O===ne){i(y,d,m);for(let P=0;P<I.length;P++)Ge(I[P],d,m,v);i(p.anchor,d,m);return}if(O===Rn){E(p,d,m);return}if(v!==2&&C&1&&T)if(v===0)T.beforeEnter(y),i(y,d,m),Me(()=>T.enter(y),_);else{const{leave:P,delayLeave:L,afterLeave:$}=T,q=()=>{p.ctx.isUnmounted?o(y):i(y,d,m)},J=()=>{y._isLeaving&&y[Hs](!0),P(y,()=>{q(),$&&$()})};L?L(y,q,J):J()}else i(y,d,m)},_e=(p,d,m,v=!1,_=!1)=>{const{type:y,props:O,ref:T,children:I,dynamicChildren:C,shapeFlag:B,patchFlag:P,dirs:L,cacheIndex:$}=p;if(P===-2&&(_=!1),T!=null&&(lt(),pn(T,null,m,p,!0),st()),$!=null&&(d.renderCache[$]=void 0),B&256){d.ctx.deactivate(p);return}const q=B&1&&L,J=!dn(p);let Q;if(J&&(Q=O&&O.onVnodeBeforeUnmount)&&ze(Q,d,p),B&6)St(p.component,m,v);else{if(B&128){p.suspense.unmount(m,v);return}q&&It(p,null,d,"beforeUnmount"),B&64?p.type.remove(p,d,m,D,v):C&&!C.hasOnce&&(y!==ne||P>0&&P&64)?Pe(C,d,m,!1,!0):(y===ne&&P&384||!_&&B&16)&&Pe(I,d,m),v&&Lt(p)}(J&&(Q=O&&O.onVnodeUnmounted)||q)&&Me(()=>{Q&&ze(Q,d,p),q&&It(p,null,d,"unmounted")},m)},Lt=p=>{const{type:d,el:m,anchor:v,transition:_}=p;if(d===ne){jt(m,v);return}if(d===Rn){x(p);return}const y=()=>{o(m),_&&!_.persisted&&_.afterLeave&&_.afterLeave()};if(p.shapeFlag&1&&_&&!_.persisted){const{leave:O,delayLeave:T}=_,I=()=>O(m,y);T?T(p.el,y,I):I()}else y()},jt=(p,d)=>{let m;for(;p!==d;)m=g(p),o(p),p=m;o(d)},St=(p,d,m)=>{const{bum:v,scope:_,job:y,subTree:O,um:T,m:I,a:C}=p;To(I),To(C),v&&ci(v),_.stop(),y&&(y.flags|=8,_e(O,p,d,m)),T&&Me(T,d),Me(()=>{p.isUnmounted=!0},d)},Pe=(p,d,m,v=!1,_=!1,y=0)=>{for(let O=y;O<p.length;O++)_e(p[O],d,m,v,_)},b=p=>{if(p.shapeFlag&6)return b(p.component.subTree);if(p.shapeFlag&128)return p.suspense.next();const d=g(p.anchor||p.el),m=d&&d[Bs];return m?g(m):d};let N=!1;const M=(p,d,m)=>{let v;p==null?d._vnode&&(_e(d._vnode,null,null,!0),v=d._vnode.component):S(d._vnode||null,p,d,null,null,null,m),d._vnode=p,N||(N=!0,vo(v),Wr(),N=!1)},D={p:S,um:_e,m:Ge,r:Lt,mt:nn,mc:$e,pc:W,pbc:He,n:b,o:e};return{render:M,hydrate:void 0,createApp:uc(M)}}function hi({type:e,props:t},n){return n==="svg"&&e==="foreignObject"||n==="mathml"&&e==="annotation-xml"&&t&&t.encoding&&t.encoding.includes("html")?void 0:n}function Tt({effect:e,job:t},n){n?(e.flags|=32,t.flags|=4):(e.flags&=-33,t.flags&=-5)}function Sc(e,t){return(!e||e&&!e.pendingBranch)&&t&&!t.persisted}function dl(e,t,n=!1){const i=e.children,o=t.children;if(H(i)&&H(o))for(let r=0;r<i.length;r++){const l=i[r];let s=o[r];s.shapeFlag&1&&!s.dynamicChildren&&((s.patchFlag<=0||s.patchFlag===32)&&(s=o[r]=mt(o[r]),s.el=l.el),!n&&s.patchFlag!==-2&&dl(l,s)),s.type===ii&&(s.patchFlag!==-1?s.el=l.el:s.__elIndex=r+(e.type===ne?1:0)),s.type===_t&&!s.el&&(s.el=l.el)}}function Ic(e){const t=e.slice(),n=[0];let i,o,r,l,s;const c=e.length;for(i=0;i<c;i++){const f=e[i];if(f!==0){if(o=n[n.length-1],e[o]<f){t[i]=o,n.push(i);continue}for(r=0,l=n.length-1;r<l;)s=r+l>>1,e[n[s]]<f?r=s+1:l=s;f<e[n[r]]&&(r>0&&(t[i]=n[r-1]),n[r]=i)}}for(r=n.length,l=n[r-1];r-- >0;)n[r]=l,l=t[l];return n}function hl(e){const t=e.subTree.component;if(t)return t.asyncDep&&!t.asyncResolved?t:hl(t)}function To(e){if(e)for(let t=0;t<e.length;t++)e[t].flags|=8}function gl(e){if(e.placeholder)return e.placeholder;const t=e.component;return t?gl(t.subTree):null}const ml=e=>e.__isSuspense;function Tc(e,t){t&&t.pendingBranch?H(e)?t.effects.push(...e):t.effects.push(e):Fs(e)}const ne=Symbol.for("v-fgt"),ii=Symbol.for("v-txt"),_t=Symbol.for("v-cmt"),Rn=Symbol.for("v-stc"),gn=[];let Re=null;function re(e=!1){gn.push(Re=e?null:[])}function Oc(){gn.pop(),Re=gn[gn.length-1]||null}let bn=1;function $n(e,t=!1){bn+=e,e<0&&Re&&t&&(Re.hasOnce=!0)}function wl(e){return e.dynamicChildren=bn>0?Re||Wt:null,Oc(),bn>0&&Re&&Re.push(e),e}function se(e,t,n,i,o,r){return wl(j(e,t,n,i,o,r,!0))}function Mc(e,t,n,i,o){return wl(fe(e,t,n,i,o,!0))}function Hn(e){return e?e.__v_isVNode===!0:!1}function ln(e,t){return e.type===t.type&&e.key===t.key}const vl=({key:e})=>e??null,Pn=({ref:e,ref_key:t,ref_for:n})=>(typeof e=="number"&&(e=""+e),e!=null?ae(e)||me(e)||U(e)?{i:De,r:e,k:t,f:!!n}:e:null);function j(e,t=null,n=null,i=0,o=null,r=e===ne?0:1,l=!1,s=!1){const c={__v_isVNode:!0,__v_skip:!0,type:e,props:t,key:t&&vl(t),ref:t&&Pn(t),scopeId:Kr,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:r,patchFlag:i,dynamicProps:o,dynamicChildren:null,appContext:null,ctx:De};return s?(io(c,n),r&128&&e.normalize(c)):n&&(c.shapeFlag|=ae(n)?8:16),bn>0&&!l&&Re&&(c.patchFlag>0||r&6)&&c.patchFlag!==32&&Re.push(c),c}const fe=Rc;function Rc(e,t=null,n=null,i=0,o=null,r=!1){if((!e||e===tc)&&(e=_t),Hn(e)){const s=Xt(e,t,!0);return n&&io(s,n),bn>0&&!r&&Re&&(s.shapeFlag&6?Re[Re.indexOf(e)]=s:Re.push(s)),s.patchFlag=-2,s}if(Vc(e)&&(e=e.__vccOpts),t){t=Pc(t);let{class:s,style:c}=t;s&&!ae(s)&&(t.class=Mt(s)),te(c)&&(Xi(c)&&!H(c)&&(c=de({},c)),t.style=Ee(c))}const l=ae(e)?1:ml(e)?128:$s(e)?64:te(e)?4:U(e)?2:0;return j(e,t,n,i,o,l,r,!0)}function Pc(e){return e?Xi(e)||sl(e)?de({},e):e:null}function Xt(e,t,n=!1,i=!1){const{props:o,ref:r,patchFlag:l,children:s,transition:c}=e,f=t?Nc(o||{},t):o,a={__v_isVNode:!0,__v_skip:!0,type:e.type,props:f,key:f&&vl(f),ref:t&&t.ref?n&&r?H(r)?r.concat(Pn(t)):[r,Pn(t)]:Pn(t):r,scopeId:e.scopeId,slotScopeIds:e.slotScopeIds,children:s,target:e.target,targetStart:e.targetStart,targetAnchor:e.targetAnchor,staticCount:e.staticCount,shapeFlag:e.shapeFlag,patchFlag:t&&e.type!==ne?l===-1?16:l|16:l,dynamicProps:e.dynamicProps,dynamicChildren:e.dynamicChildren,appContext:e.appContext,dirs:e.dirs,transition:c,component:e.component,suspense:e.suspense,ssContent:e.ssContent&&Xt(e.ssContent),ssFallback:e.ssFallback&&Xt(e.ssFallback),placeholder:e.placeholder,el:e.el,anchor:e.anchor,ctx:e.ctx,ce:e.ce};return c&&i&&Zi(a,c.clone(a)),a}function Un(e=" ",t=0){return fe(ii,null,e,t)}function Oo(e,t){const n=fe(Rn,null,e);return n.staticCount=t,n}function kc(e="",t=!1){return t?(re(),Mc(_t,null,e)):fe(_t,null,e)}function Ye(e){return e==null||typeof e=="boolean"?fe(_t):H(e)?fe(ne,null,e.slice()):Hn(e)?mt(e):fe(ii,null,String(e))}function mt(e){return e.el===null&&e.patchFlag!==-1||e.memo?e:Xt(e)}function io(e,t){let n=0;const{shapeFlag:i}=e;if(t==null)t=null;else if(H(t))n=16;else if(typeof t=="object")if(i&65){const o=t.default;o&&(o._c&&(o._d=!1),io(e,o()),o._c&&(o._d=!0));return}else{n=32;const o=t._;!o&&!sl(t)?t._ctx=De:o===3&&De&&(De.slots._===1?t._=1:(t._=2,e.patchFlag|=1024))}else U(t)?(t={default:t,_ctx:De},n=32):(t=String(t),i&64?(n=16,t=[Un(t)]):n=8);e.children=t,e.shapeFlag|=n}function Nc(...e){const t={};for(let n=0;n<e.length;n++){const i=e[n];for(const o in i)if(o==="class")t.class!==i.class&&(t.class=Mt([t.class,i.class]));else if(o==="style")t.style=Ee([t.style,i.style]);else if(zn(o)){const r=t[o],l=i[o];l&&r!==l&&!(H(r)&&r.includes(l))&&(t[o]=r?[].concat(r,l):l)}else o!==""&&(t[o]=i[o])}return t}function ze(e,t,n,i=null){Je(e,t,7,[n,i])}const Fc=il();let Dc=0;function Lc(e,t,n){const i=e.type,o=(t?t.appContext:e.appContext)||Fc,r={uid:Dc++,vnode:e,type:i,parent:t,appContext:o,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new Cr(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:t?t.provides:Object.create(o.provides),ids:t?t.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:al(i,o),emitsOptions:ol(i,o),emit:null,emitted:null,propsDefaults:ee,inheritAttrs:i.inheritAttrs,ctx:ee,data:ee,props:ee,attrs:ee,slots:ee,refs:ee,setupState:ee,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return r.ctx={_:r},r.root=t?t.root:r,r.emit=pc.bind(null,r),e.ce&&e.ce(r),r}let ge=null;const jc=()=>ge||De;let Gn,Ni;{const e=Xn(),t=(n,i)=>{let o;return(o=e[n])||(o=e[n]=[]),o.push(i),r=>{o.length>1?o.forEach(l=>l(r)):o[0](r)}};Gn=t("__VUE_INSTANCE_SETTERS__",n=>ge=n),Ni=t("__VUE_SSR_SETTERS__",n=>xn=n)}const En=e=>{const t=ge;return Gn(e),e.scope.on(),()=>{e.scope.off(),Gn(t)}},Mo=()=>{ge&&ge.scope.off(),Gn(null)};function yl(e){return e.vnode.shapeFlag&4}let xn=!1;function Bc(e,t=!1,n=!1){t&&Ni(t);const{props:i,children:o}=e.vnode,r=yl(e);vc(e,i,r,t),_c(e,o,n||t);const l=r?$c(e,t):void 0;return t&&Ni(!1),l}function $c(e,t){const n=e.type;e.accessCache=Object.create(null),e.proxy=new Proxy(e.ctx,ic);const{setup:i}=n;if(i){lt();const o=e.setupContext=i.length>1?Uc(e):null,r=En(e),l=Cn(i,e,0,[e.props,o]),s=wr(l);if(st(),r(),(s||e.sp)&&!dn(e)&&Xr(e),s){if(l.then(Mo,Mo),t)return l.then(c=>{Ro(e,c)}).catch(c=>{ei(c,e,0)});e.asyncDep=l}else Ro(e,l)}else bl(e)}function Ro(e,t,n){U(t)?e.type.__ssrInlineRender?e.ssrRender=t:e.render=t:te(t)&&(e.setupState=Ur(t)),bl(e)}function bl(e,t,n){const i=e.type;e.render||(e.render=i.render||Qe);{const o=En(e);lt();try{oc(e)}finally{st(),o()}}}const Hc={get(e,t){return he(e,"get",""),e[t]}};function Uc(e){const t=n=>{e.exposed=n||{}};return{attrs:new Proxy(e.attrs,Hc),slots:e.slots,emit:e.emit,expose:t}}function oo(e){return e.exposed?e.exposeProxy||(e.exposeProxy=new Proxy(Ur($r(e.exposed)),{get(t,n){if(n in t)return t[n];if(n in hn)return hn[n](e)},has(t,n){return n in t||n in hn}})):e.proxy}function Gc(e,t=!0){return U(e)?e.displayName||e.name:e.name||t&&e.__name}function Vc(e){return U(e)&&"__vccOpts"in e}const Fe=(e,t)=>Ms(e,t,xn);function xl(e,t,n){try{$n(-1);const i=arguments.length;return i===2?te(t)&&!H(t)?Hn(t)?fe(e,null,[t]):fe(e,t):fe(e,null,t):(i>3?n=Array.prototype.slice.call(arguments,2):i===3&&Hn(n)&&(n=[n]),fe(e,t,n))}finally{$n(1)}}const qc="3.5.27";let Fi;const Po=typeof window<"u"&&window.trustedTypes;if(Po)try{Fi=Po.createPolicy("vue",{createHTML:e=>e})}catch{}const _l=Fi?e=>Fi.createHTML(e):e=>e,Wc="http://www.w3.org/2000/svg",zc="http://www.w3.org/1998/Math/MathML",nt=typeof document<"u"?document:null,ko=nt&&nt.createElement("template"),Kc={insert:(e,t,n)=>{t.insertBefore(e,n||null)},remove:e=>{const t=e.parentNode;t&&t.removeChild(e)},createElement:(e,t,n,i)=>{const o=t==="svg"?nt.createElementNS(Wc,e):t==="mathml"?nt.createElementNS(zc,e):n?nt.createElement(e,{is:n}):nt.createElement(e);return e==="select"&&i&&i.multiple!=null&&o.setAttribute("multiple",i.multiple),o},createText:e=>nt.createTextNode(e),createComment:e=>nt.createComment(e),setText:(e,t)=>{e.nodeValue=t},setElementText:(e,t)=>{e.textContent=t},parentNode:e=>e.parentNode,nextSibling:e=>e.nextSibling,querySelector:e=>nt.querySelector(e),setScopeId(e,t){e.setAttribute(t,"")},insertStaticContent(e,t,n,i,o,r){const l=n?n.previousSibling:t.lastChild;if(o&&(o===r||o.nextSibling))for(;t.insertBefore(o.cloneNode(!0),n),!(o===r||!(o=o.nextSibling)););else{ko.innerHTML=_l(i==="svg"?`<svg>${e}</svg>`:i==="mathml"?`<math>${e}</math>`:e);const s=ko.content;if(i==="svg"||i==="mathml"){const c=s.firstChild;for(;c.firstChild;)s.appendChild(c.firstChild);s.removeChild(c)}t.insertBefore(s,n)}return[l?l.nextSibling:t.firstChild,n?n.previousSibling:t.lastChild]}},Yc=Symbol("_vtc");function Qc(e,t,n){const i=e[Yc];i&&(t=(t?[t,...i]:[...i]).join(" ")),t==null?e.removeAttribute("class"):n?e.setAttribute("class",t):e.className=t}const No=Symbol("_vod"),Xc=Symbol("_vsh"),Jc=Symbol(""),Zc=/(?:^|;)\s*display\s*:/;function ea(e,t,n){const i=e.style,o=ae(n);let r=!1;if(n&&!o){if(t)if(ae(t))for(const l of t.split(";")){const s=l.slice(0,l.indexOf(":")).trim();n[s]==null&&kn(i,s,"")}else for(const l in t)n[l]==null&&kn(i,l,"");for(const l in n)l==="display"&&(r=!0),kn(i,l,n[l])}else if(o){if(t!==n){const l=i[Jc];l&&(n+=";"+l),i.cssText=n,r=Zc.test(n)}}else t&&e.removeAttribute("style");No in e&&(e[No]=r?i.display:"",e[Xc]&&(i.display="none"))}const Fo=/\s*!important$/;function kn(e,t,n){if(H(n))n.forEach(i=>kn(e,t,i));else if(n==null&&(n=""),t.startsWith("--"))e.setProperty(t,n);else{const i=ta(e,t);Fo.test(n)?e.setProperty(Ft(i),n.replace(Fo,""),"important"):e[i]=n}}const Do=["Webkit","Moz","ms"],gi={};function ta(e,t){const n=gi[t];if(n)return n;let i=Ne(t);if(i!=="filter"&&i in e)return gi[t]=i;i=Qn(i);for(let o=0;o<Do.length;o++){const r=Do[o]+i;if(r in e)return gi[t]=r}return t}const Lo="http://www.w3.org/1999/xlink";function jo(e,t,n,i,o,r=rs(t)){i&&t.startsWith("xlink:")?n==null?e.removeAttributeNS(Lo,t.slice(6,t.length)):e.setAttributeNS(Lo,t,n):n==null||r&&!xr(n)?e.removeAttribute(t):e.setAttribute(t,r?"":Ct(n)?String(n):n)}function Bo(e,t,n,i,o){if(t==="innerHTML"||t==="textContent"){n!=null&&(e[t]=t==="innerHTML"?_l(n):n);return}const r=e.tagName;if(t==="value"&&r!=="PROGRESS"&&!r.includes("-")){const s=r==="OPTION"?e.getAttribute("value")||"":e.value,c=n==null?e.type==="checkbox"?"on":"":String(n);(s!==c||!("_value"in e))&&(e.value=c),n==null&&e.removeAttribute(t),e._value=n;return}let l=!1;if(n===""||n==null){const s=typeof e[t];s==="boolean"?n=xr(n):n==null&&s==="string"?(n="",l=!0):s==="number"&&(n=0,l=!0)}try{e[t]=n}catch{}l&&e.removeAttribute(o||t)}function na(e,t,n,i){e.addEventListener(t,n,i)}function ia(e,t,n,i){e.removeEventListener(t,n,i)}const $o=Symbol("_vei");function oa(e,t,n,i,o=null){const r=e[$o]||(e[$o]={}),l=r[t];if(i&&l)l.value=i;else{const[s,c]=ra(t);if(i){const f=r[t]=ca(i,o);na(e,s,f,c)}else l&&(ia(e,s,l,c),r[t]=void 0)}}const Ho=/(?:Once|Passive|Capture)$/;function ra(e){let t;if(Ho.test(e)){t={};let i;for(;i=e.match(Ho);)e=e.slice(0,e.length-i[0].length),t[i[0].toLowerCase()]=!0}return[e[2]===":"?e.slice(3):Ft(e.slice(2)),t]}let mi=0;const la=Promise.resolve(),sa=()=>mi||(la.then(()=>mi=0),mi=Date.now());function ca(e,t){const n=i=>{if(!i._vts)i._vts=Date.now();else if(i._vts<=n.attached)return;Je(aa(i,n.value),t,5,[i])};return n.value=e,n.attached=sa(),n}function aa(e,t){if(H(t)){const n=e.stopImmediatePropagation;return e.stopImmediatePropagation=()=>{n.call(e),e._stopped=!0},t.map(i=>o=>!o._stopped&&i&&i(o))}else return t}const Uo=e=>e.charCodeAt(0)===111&&e.charCodeAt(1)===110&&e.charCodeAt(2)>96&&e.charCodeAt(2)<123,ua=(e,t,n,i,o,r)=>{const l=o==="svg";t==="class"?Qc(e,i,l):t==="style"?ea(e,n,i):zn(t)?Ui(t)||oa(e,t,n,i,r):(t[0]==="."?(t=t.slice(1),!0):t[0]==="^"?(t=t.slice(1),!1):fa(e,t,i,l))?(Bo(e,t,i),!e.tagName.includes("-")&&(t==="value"||t==="checked"||t==="selected")&&jo(e,t,i,l,r,t!=="value")):e._isVueCE&&(/[A-Z]/.test(t)||!ae(i))?Bo(e,Ne(t),i,r,t):(t==="true-value"?e._trueValue=i:t==="false-value"&&(e._falseValue=i),jo(e,t,i,l))};function fa(e,t,n,i){if(i)return!!(t==="innerHTML"||t==="textContent"||t in e&&Uo(t)&&U(n));if(t==="spellcheck"||t==="draggable"||t==="translate"||t==="autocorrect"||t==="sandbox"&&e.tagName==="IFRAME"||t==="form"||t==="list"&&e.tagName==="INPUT"||t==="type"&&e.tagName==="TEXTAREA")return!1;if(t==="width"||t==="height"){const o=e.tagName;if(o==="IMG"||o==="VIDEO"||o==="CANVAS"||o==="SOURCE")return!1}return Uo(t)&&ae(n)?!1:t in e}const pa=de({patchProp:ua},Kc);let Go;function da(){return Go||(Go=Cc(pa))}const ha=((...e)=>{const t=da().createApp(...e),{mount:n}=t;return t.mount=i=>{const o=ma(i);if(!o)return;const r=t._component;!U(r)&&!r.render&&!r.template&&(r.template=o.innerHTML),o.nodeType===1&&(o.textContent="");const l=n(o,!1,ga(o));return o instanceof Element&&(o.removeAttribute("v-cloak"),o.setAttribute("data-v-app","")),l},t});function ga(e){if(e instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&e instanceof MathMLElement)return"mathml"}function ma(e){return ae(e)?document.querySelector(e):e}const wa=Symbol();var Vo;(function(e){e.direct="direct",e.patchObject="patch object",e.patchFunction="patch function"})(Vo||(Vo={}));function va(){const e=ls(!0),t=e.run(()=>Nn({}));let n=[],i=[];const o=$r({install(r){o._a=r,r.provide(wa,o),r.config.globalProperties.$pinia=o,i.forEach(l=>n.push(l)),i=[]},use(r){return this._a?n.push(r):i.push(r),this},_p:n,_a:null,_e:e,_s:new Map,state:t});return o}const Gt=typeof document<"u";function Al(e){return typeof e=="object"||"displayName"in e||"props"in e||"__vccOpts"in e}function ya(e){return e.__esModule||e[Symbol.toStringTag]==="Module"||e.default&&Al(e.default)}const z=Object.assign;function wi(e,t){const n={};for(const i in t){const o=t[i];n[i]=Be(o)?o.map(e):e(o)}return n}const mn=()=>{},Be=Array.isArray;function qo(e,t){const n={};for(const i in e)n[i]=i in t?t[i]:e[i];return n}const Cl=/#/g,ba=/&/g,xa=/\//g,_a=/=/g,Aa=/\?/g,El=/\+/g,Ca=/%5B/g,Ea=/%5D/g,Sl=/%5E/g,Sa=/%60/g,Il=/%7B/g,Ia=/%7C/g,Tl=/%7D/g,Ta=/%20/g;function ro(e){return e==null?"":encodeURI(""+e).replace(Ia,"|").replace(Ca,"[").replace(Ea,"]")}function Oa(e){return ro(e).replace(Il,"{").replace(Tl,"}").replace(Sl,"^")}function Di(e){return ro(e).replace(El,"%2B").replace(Ta,"+").replace(Cl,"%23").replace(ba,"%26").replace(Sa,"`").replace(Il,"{").replace(Tl,"}").replace(Sl,"^")}function Ma(e){return Di(e).replace(_a,"%3D")}function Ra(e){return ro(e).replace(Cl,"%23").replace(Aa,"%3F")}function Pa(e){return Ra(e).replace(xa,"%2F")}function _n(e){if(e==null)return null;try{return decodeURIComponent(""+e)}catch{}return""+e}const ka=/\/$/,Na=e=>e.replace(ka,"");function vi(e,t,n="/"){let i,o={},r="",l="";const s=t.indexOf("#");let c=t.indexOf("?");return c=s>=0&&c>s?-1:c,c>=0&&(i=t.slice(0,c),r=t.slice(c,s>0?s:t.length),o=e(r.slice(1))),s>=0&&(i=i||t.slice(0,s),l=t.slice(s,t.length)),i=ja(i??t,n),{fullPath:i+r+l,path:i,query:o,hash:_n(l)}}function Fa(e,t){const n=t.query?e(t.query):"";return t.path+(n&&"?")+n+(t.hash||"")}function Wo(e,t){return!t||!e.toLowerCase().startsWith(t.toLowerCase())?e:e.slice(t.length)||"/"}function Da(e,t,n){const i=t.matched.length-1,o=n.matched.length-1;return i>-1&&i===o&&Jt(t.matched[i],n.matched[o])&&Ol(t.params,n.params)&&e(t.query)===e(n.query)&&t.hash===n.hash}function Jt(e,t){return(e.aliasOf||e)===(t.aliasOf||t)}function Ol(e,t){if(Object.keys(e).length!==Object.keys(t).length)return!1;for(var n in e)if(!La(e[n],t[n]))return!1;return!0}function La(e,t){return Be(e)?zo(e,t):Be(t)?zo(t,e):e?.valueOf()===t?.valueOf()}function zo(e,t){return Be(t)?e.length===t.length&&e.every((n,i)=>n===t[i]):e.length===1&&e[0]===t}function ja(e,t){if(e.startsWith("/"))return e;if(!e)return t;const n=t.split("/"),i=e.split("/"),o=i[i.length-1];(o===".."||o===".")&&i.push("");let r=n.length-1,l,s;for(l=0;l<i.length;l++)if(s=i[l],s!==".")if(s==="..")r>1&&r--;else break;return n.slice(0,r).join("/")+"/"+i.slice(l).join("/")}const dt={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};let Li=(function(e){return e.pop="pop",e.push="push",e})({}),yi=(function(e){return e.back="back",e.forward="forward",e.unknown="",e})({});function Ba(e){if(!e)if(Gt){const t=document.querySelector("base");e=t&&t.getAttribute("href")||"/",e=e.replace(/^\w+:\/\/[^\/]+/,"")}else e="/";return e[0]!=="/"&&e[0]!=="#"&&(e="/"+e),Na(e)}const $a=/^[^#]+#/;function Ha(e,t){return e.replace($a,"#")+t}function Ua(e,t){const n=document.documentElement.getBoundingClientRect(),i=e.getBoundingClientRect();return{behavior:t.behavior,left:i.left-n.left-(t.left||0),top:i.top-n.top-(t.top||0)}}const oi=()=>({left:window.scrollX,top:window.scrollY});function Ga(e){let t;if("el"in e){const n=e.el,i=typeof n=="string"&&n.startsWith("#"),o=typeof n=="string"?i?document.getElementById(n.slice(1)):document.querySelector(n):n;if(!o)return;t=Ua(o,e)}else t=e;"scrollBehavior"in document.documentElement.style?window.scrollTo(t):window.scrollTo(t.left!=null?t.left:window.scrollX,t.top!=null?t.top:window.scrollY)}function Ko(e,t){return(history.state?history.state.position-t:-1)+e}const ji=new Map;function Va(e,t){ji.set(e,t)}function qa(e){const t=ji.get(e);return ji.delete(e),t}function Wa(e){return typeof e=="string"||e&&typeof e=="object"}function Ml(e){return typeof e=="string"||typeof e=="symbol"}let le=(function(e){return e[e.MATCHER_NOT_FOUND=1]="MATCHER_NOT_FOUND",e[e.NAVIGATION_GUARD_REDIRECT=2]="NAVIGATION_GUARD_REDIRECT",e[e.NAVIGATION_ABORTED=4]="NAVIGATION_ABORTED",e[e.NAVIGATION_CANCELLED=8]="NAVIGATION_CANCELLED",e[e.NAVIGATION_DUPLICATED=16]="NAVIGATION_DUPLICATED",e})({});const Rl=Symbol("");le.MATCHER_NOT_FOUND+"",le.NAVIGATION_GUARD_REDIRECT+"",le.NAVIGATION_ABORTED+"",le.NAVIGATION_CANCELLED+"",le.NAVIGATION_DUPLICATED+"";function Zt(e,t){return z(new Error,{type:e,[Rl]:!0},t)}function tt(e,t){return e instanceof Error&&Rl in e&&(t==null||!!(e.type&t))}const za=["params","query","hash"];function Ka(e){if(typeof e=="string")return e;if(e.path!=null)return e.path;const t={};for(const n of za)n in e&&(t[n]=e[n]);return JSON.stringify(t,null,2)}function Ya(e){const t={};if(e===""||e==="?")return t;const n=(e[0]==="?"?e.slice(1):e).split("&");for(let i=0;i<n.length;++i){const o=n[i].replace(El," "),r=o.indexOf("="),l=_n(r<0?o:o.slice(0,r)),s=r<0?null:_n(o.slice(r+1));if(l in t){let c=t[l];Be(c)||(c=t[l]=[c]),c.push(s)}else t[l]=s}return t}function Yo(e){let t="";for(let n in e){const i=e[n];if(n=Ma(n),i==null){i!==void 0&&(t+=(t.length?"&":"")+n);continue}(Be(i)?i.map(o=>o&&Di(o)):[i&&Di(i)]).forEach(o=>{o!==void 0&&(t+=(t.length?"&":"")+n,o!=null&&(t+="="+o))})}return t}function Qa(e){const t={};for(const n in e){const i=e[n];i!==void 0&&(t[n]=Be(i)?i.map(o=>o==null?null:""+o):i==null?i:""+i)}return t}const Xa=Symbol(""),Qo=Symbol(""),lo=Symbol(""),Pl=Symbol(""),Bi=Symbol("");function sn(){let e=[];function t(i){return e.push(i),()=>{const o=e.indexOf(i);o>-1&&e.splice(o,1)}}function n(){e=[]}return{add:t,list:()=>e.slice(),reset:n}}function wt(e,t,n,i,o,r=l=>l()){const l=i&&(i.enterCallbacks[o]=i.enterCallbacks[o]||[]);return()=>new Promise((s,c)=>{const f=g=>{g===!1?c(Zt(le.NAVIGATION_ABORTED,{from:n,to:t})):g instanceof Error?c(g):Wa(g)?c(Zt(le.NAVIGATION_GUARD_REDIRECT,{from:t,to:g})):(l&&i.enterCallbacks[o]===l&&typeof g=="function"&&l.push(g),s())},a=r(()=>e.call(i&&i.instances[o],t,n,f));let u=Promise.resolve(a);e.length<3&&(u=u.then(f)),u.catch(g=>c(g))})}function bi(e,t,n,i,o=r=>r()){const r=[];for(const l of e)for(const s in l.components){let c=l.components[s];if(!(t!=="beforeRouteEnter"&&!l.instances[s]))if(Al(c)){const f=(c.__vccOpts||c)[t];f&&r.push(wt(f,n,i,l,s,o))}else{let f=c();r.push(()=>f.then(a=>{if(!a)throw new Error(`Couldn't resolve component "${s}" at "${l.path}"`);const u=ya(a)?a.default:a;l.mods[s]=a,l.components[s]=u;const g=(u.__vccOpts||u)[t];return g&&wt(g,n,i,l,s,o)()}))}}return r}function Ja(e,t){const n=[],i=[],o=[],r=Math.max(t.matched.length,e.matched.length);for(let l=0;l<r;l++){const s=t.matched[l];s&&(e.matched.find(f=>Jt(f,s))?i.push(s):n.push(s));const c=e.matched[l];c&&(t.matched.find(f=>Jt(f,c))||o.push(c))}return[n,i,o]}let Za=()=>location.protocol+"//"+location.host;function kl(e,t){const{pathname:n,search:i,hash:o}=t,r=e.indexOf("#");if(r>-1){let l=o.includes(e.slice(r))?e.slice(r).length:1,s=o.slice(l);return s[0]!=="/"&&(s="/"+s),Wo(s,"")}return Wo(n,e)+i+o}function eu(e,t,n,i){let o=[],r=[],l=null;const s=({state:g})=>{const h=kl(e,location),A=n.value,S=t.value;let k=0;if(g){if(n.value=h,t.value=g,l&&l===A){l=null;return}k=S?g.position-S.position:0}else i(h);o.forEach(R=>{R(n.value,A,{delta:k,type:Li.pop,direction:k?k>0?yi.forward:yi.back:yi.unknown})})};function c(){l=n.value}function f(g){o.push(g);const h=()=>{const A=o.indexOf(g);A>-1&&o.splice(A,1)};return r.push(h),h}function a(){if(document.visibilityState==="hidden"){const{history:g}=window;if(!g.state)return;g.replaceState(z({},g.state,{scroll:oi()}),"")}}function u(){for(const g of r)g();r=[],window.removeEventListener("popstate",s),window.removeEventListener("pagehide",a),document.removeEventListener("visibilitychange",a)}return window.addEventListener("popstate",s),window.addEventListener("pagehide",a),document.addEventListener("visibilitychange",a),{pauseListeners:c,listen:f,destroy:u}}function Xo(e,t,n,i=!1,o=!1){return{back:e,current:t,forward:n,replaced:i,position:window.history.length,scroll:o?oi():null}}function tu(e){const{history:t,location:n}=window,i={value:kl(e,n)},o={value:t.state};o.value||r(i.value,{back:null,current:i.value,forward:null,position:t.length-1,replaced:!0,scroll:null},!0);function r(c,f,a){const u=e.indexOf("#"),g=u>-1?(n.host&&document.querySelector("base")?e:e.slice(u))+c:Za()+e+c;try{t[a?"replaceState":"pushState"](f,"",g),o.value=f}catch(h){console.error(h),n[a?"replace":"assign"](g)}}function l(c,f){r(c,z({},t.state,Xo(o.value.back,c,o.value.forward,!0),f,{position:o.value.position}),!0),i.value=c}function s(c,f){const a=z({},o.value,t.state,{forward:c,scroll:oi()});r(a.current,a,!0),r(c,z({},Xo(i.value,c,null),{position:a.position+1},f),!1),i.value=c}return{location:i,state:o,push:s,replace:l}}function nu(e){e=Ba(e);const t=tu(e),n=eu(e,t.state,t.location,t.replace);function i(r,l=!0){l||n.pauseListeners(),history.go(r)}const o=z({location:"",base:e,go:i,createHref:Ha.bind(null,e)},t,n);return Object.defineProperty(o,"location",{enumerable:!0,get:()=>t.location.value}),Object.defineProperty(o,"state",{enumerable:!0,get:()=>t.state.value}),o}function iu(e){return e=location.host?e||location.pathname+location.search:"",e.includes("#")||(e+="#"),nu(e)}let Rt=(function(e){return e[e.Static=0]="Static",e[e.Param=1]="Param",e[e.Group=2]="Group",e})({});var ue=(function(e){return e[e.Static=0]="Static",e[e.Param=1]="Param",e[e.ParamRegExp=2]="ParamRegExp",e[e.ParamRegExpEnd=3]="ParamRegExpEnd",e[e.EscapeNext=4]="EscapeNext",e})(ue||{});const ou={type:Rt.Static,value:""},ru=/[a-zA-Z0-9_]/;function lu(e){if(!e)return[[]];if(e==="/")return[[ou]];if(!e.startsWith("/"))throw new Error(`Invalid path "${e}"`);function t(h){throw new Error(`ERR (${n})/"${f}": ${h}`)}let n=ue.Static,i=n;const o=[];let r;function l(){r&&o.push(r),r=[]}let s=0,c,f="",a="";function u(){f&&(n===ue.Static?r.push({type:Rt.Static,value:f}):n===ue.Param||n===ue.ParamRegExp||n===ue.ParamRegExpEnd?(r.length>1&&(c==="*"||c==="+")&&t(`A repeatable param (${f}) must be alone in its segment. eg: '/:ids+.`),r.push({type:Rt.Param,value:f,regexp:a,repeatable:c==="*"||c==="+",optional:c==="*"||c==="?"})):t("Invalid state to consume buffer"),f="")}function g(){f+=c}for(;s<e.length;){if(c=e[s++],c==="\\"&&n!==ue.ParamRegExp){i=n,n=ue.EscapeNext;continue}switch(n){case ue.Static:c==="/"?(f&&u(),l()):c===":"?(u(),n=ue.Param):g();break;case ue.EscapeNext:g(),n=i;break;case ue.Param:c==="("?n=ue.ParamRegExp:ru.test(c)?g():(u(),n=ue.Static,c!=="*"&&c!=="?"&&c!=="+"&&s--);break;case ue.ParamRegExp:c===")"?a[a.length-1]=="\\"?a=a.slice(0,-1)+c:n=ue.ParamRegExpEnd:a+=c;break;case ue.ParamRegExpEnd:u(),n=ue.Static,c!=="*"&&c!=="?"&&c!=="+"&&s--,a="";break;default:t("Unknown state");break}}return n===ue.ParamRegExp&&t(`Unfinished custom RegExp for param "${f}"`),u(),l(),o}const Jo="[^/]+?",su={sensitive:!1,strict:!1,start:!0,end:!0};var ye=(function(e){return e[e._multiplier=10]="_multiplier",e[e.Root=90]="Root",e[e.Segment=40]="Segment",e[e.SubSegment=30]="SubSegment",e[e.Static=40]="Static",e[e.Dynamic=20]="Dynamic",e[e.BonusCustomRegExp=10]="BonusCustomRegExp",e[e.BonusWildcard=-50]="BonusWildcard",e[e.BonusRepeatable=-20]="BonusRepeatable",e[e.BonusOptional=-8]="BonusOptional",e[e.BonusStrict=.7000000000000001]="BonusStrict",e[e.BonusCaseSensitive=.25]="BonusCaseSensitive",e})(ye||{});const cu=/[.+*?^${}()[\]/\\]/g;function au(e,t){const n=z({},su,t),i=[];let o=n.start?"^":"";const r=[];for(const f of e){const a=f.length?[]:[ye.Root];n.strict&&!f.length&&(o+="/");for(let u=0;u<f.length;u++){const g=f[u];let h=ye.Segment+(n.sensitive?ye.BonusCaseSensitive:0);if(g.type===Rt.Static)u||(o+="/"),o+=g.value.replace(cu,"\\$&"),h+=ye.Static;else if(g.type===Rt.Param){const{value:A,repeatable:S,optional:k,regexp:R}=g;r.push({name:A,repeatable:S,optional:k});const w=R||Jo;if(w!==Jo){h+=ye.BonusCustomRegExp;try{`${w}`}catch(x){throw new Error(`Invalid custom RegExp for param "${A}" (${w}): `+x.message)}}let E=S?`((?:${w})(?:/(?:${w}))*)`:`(${w})`;u||(E=k&&f.length<2?`(?:/${E})`:"/"+E),k&&(E+="?"),o+=E,h+=ye.Dynamic,k&&(h+=ye.BonusOptional),S&&(h+=ye.BonusRepeatable),w===".*"&&(h+=ye.BonusWildcard)}a.push(h)}i.push(a)}if(n.strict&&n.end){const f=i.length-1;i[f][i[f].length-1]+=ye.BonusStrict}n.strict||(o+="/?"),n.end?o+="$":n.strict&&!o.endsWith("/")&&(o+="(?:/|$)");const l=new RegExp(o,n.sensitive?"":"i");function s(f){const a=f.match(l),u={};if(!a)return null;for(let g=1;g<a.length;g++){const h=a[g]||"",A=r[g-1];u[A.name]=h&&A.repeatable?h.split("/"):h}return u}function c(f){let a="",u=!1;for(const g of e){(!u||!a.endsWith("/"))&&(a+="/"),u=!1;for(const h of g)if(h.type===Rt.Static)a+=h.value;else if(h.type===Rt.Param){const{value:A,repeatable:S,optional:k}=h,R=A in f?f[A]:"";if(Be(R)&&!S)throw new Error(`Provided param "${A}" is an array but it is not repeatable (* or + modifiers)`);const w=Be(R)?R.join("/"):R;if(!w)if(k)g.length<2&&(a.endsWith("/")?a=a.slice(0,-1):u=!0);else throw new Error(`Missing required param "${A}"`);a+=w}}return a||"/"}return{re:l,score:i,keys:r,parse:s,stringify:c}}function uu(e,t){let n=0;for(;n<e.length&&n<t.length;){const i=t[n]-e[n];if(i)return i;n++}return e.length<t.length?e.length===1&&e[0]===ye.Static+ye.Segment?-1:1:e.length>t.length?t.length===1&&t[0]===ye.Static+ye.Segment?1:-1:0}function Nl(e,t){let n=0;const i=e.score,o=t.score;for(;n<i.length&&n<o.length;){const r=uu(i[n],o[n]);if(r)return r;n++}if(Math.abs(o.length-i.length)===1){if(Zo(i))return 1;if(Zo(o))return-1}return o.length-i.length}function Zo(e){const t=e[e.length-1];return e.length>0&&t[t.length-1]<0}const fu={strict:!1,end:!0,sensitive:!1};function pu(e,t,n){const i=au(lu(e.path),n),o=z(i,{record:e,parent:t,children:[],alias:[]});return t&&!o.record.aliasOf==!t.record.aliasOf&&t.children.push(o),o}function du(e,t){const n=[],i=new Map;t=qo(fu,t);function o(u){return i.get(u)}function r(u,g,h){const A=!h,S=tr(u);S.aliasOf=h&&h.record;const k=qo(t,u),R=[S];if("alias"in u){const x=typeof u.alias=="string"?[u.alias]:u.alias;for(const G of x)R.push(tr(z({},S,{components:h?h.record.components:S.components,path:G,aliasOf:h?h.record:S})))}let w,E;for(const x of R){const{path:G}=x;if(g&&G[0]!=="/"){const ie=g.record.path,oe=ie[ie.length-1]==="/"?"":"/";x.path=g.record.path+(G&&oe+G)}if(w=pu(x,g,k),h?h.alias.push(w):(E=E||w,E!==w&&E.alias.push(w),A&&u.name&&!nr(w)&&l(u.name)),Fl(w)&&c(w),S.children){const ie=S.children;for(let oe=0;oe<ie.length;oe++)r(ie[oe],w,h&&h.children[oe])}h=h||w}return E?()=>{l(E)}:mn}function l(u){if(Ml(u)){const g=i.get(u);g&&(i.delete(u),n.splice(n.indexOf(g),1),g.children.forEach(l),g.alias.forEach(l))}else{const g=n.indexOf(u);g>-1&&(n.splice(g,1),u.record.name&&i.delete(u.record.name),u.children.forEach(l),u.alias.forEach(l))}}function s(){return n}function c(u){const g=mu(u,n);n.splice(g,0,u),u.record.name&&!nr(u)&&i.set(u.record.name,u)}function f(u,g){let h,A={},S,k;if("name"in u&&u.name){if(h=i.get(u.name),!h)throw Zt(le.MATCHER_NOT_FOUND,{location:u});k=h.record.name,A=z(er(g.params,h.keys.filter(E=>!E.optional).concat(h.parent?h.parent.keys.filter(E=>E.optional):[]).map(E=>E.name)),u.params&&er(u.params,h.keys.map(E=>E.name))),S=h.stringify(A)}else if(u.path!=null)S=u.path,h=n.find(E=>E.re.test(S)),h&&(A=h.parse(S),k=h.record.name);else{if(h=g.name?i.get(g.name):n.find(E=>E.re.test(g.path)),!h)throw Zt(le.MATCHER_NOT_FOUND,{location:u,currentLocation:g});k=h.record.name,A=z({},g.params,u.params),S=h.stringify(A)}const R=[];let w=h;for(;w;)R.unshift(w.record),w=w.parent;return{name:k,path:S,params:A,matched:R,meta:gu(R)}}e.forEach(u=>r(u));function a(){n.length=0,i.clear()}return{addRoute:r,resolve:f,removeRoute:l,clearRoutes:a,getRoutes:s,getRecordMatcher:o}}function er(e,t){const n={};for(const i of t)i in e&&(n[i]=e[i]);return n}function tr(e){const t={path:e.path,redirect:e.redirect,name:e.name,meta:e.meta||{},aliasOf:e.aliasOf,beforeEnter:e.beforeEnter,props:hu(e),children:e.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in e?e.components||null:e.component&&{default:e.component}};return Object.defineProperty(t,"mods",{value:{}}),t}function hu(e){const t={},n=e.props||!1;if("component"in e)t.default=n;else for(const i in e.components)t[i]=typeof n=="object"?n[i]:n;return t}function nr(e){for(;e;){if(e.record.aliasOf)return!0;e=e.parent}return!1}function gu(e){return e.reduce((t,n)=>z(t,n.meta),{})}function mu(e,t){let n=0,i=t.length;for(;n!==i;){const r=n+i>>1;Nl(e,t[r])<0?i=r:n=r+1}const o=wu(e);return o&&(i=t.lastIndexOf(o,i-1)),i}function wu(e){let t=e;for(;t=t.parent;)if(Fl(t)&&Nl(e,t)===0)return t}function Fl({record:e}){return!!(e.name||e.components&&Object.keys(e.components).length||e.redirect)}function ir(e){const t=rt(lo),n=rt(Pl),i=Fe(()=>{const c=bt(e.to);return t.resolve(c)}),o=Fe(()=>{const{matched:c}=i.value,{length:f}=c,a=c[f-1],u=n.matched;if(!a||!u.length)return-1;const g=u.findIndex(Jt.bind(null,a));if(g>-1)return g;const h=or(c[f-2]);return f>1&&or(a)===h&&u[u.length-1].path!==h?u.findIndex(Jt.bind(null,c[f-2])):g}),r=Fe(()=>o.value>-1&&_u(n.params,i.value.params)),l=Fe(()=>o.value>-1&&o.value===n.matched.length-1&&Ol(n.params,i.value.params));function s(c={}){if(xu(c)){const f=t[bt(e.replace)?"replace":"push"](bt(e.to)).catch(mn);return e.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>f),f}return Promise.resolve()}return{route:i,href:Fe(()=>i.value.href),isActive:r,isExactActive:l,navigate:s}}function vu(e){return e.length===1?e[0]:e}const yu=tn({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:ir,setup(e,{slots:t}){const n=Zn(ir(e)),{options:i}=rt(lo),o=Fe(()=>({[rr(e.activeClass,i.linkActiveClass,"router-link-active")]:n.isActive,[rr(e.exactActiveClass,i.linkExactActiveClass,"router-link-exact-active")]:n.isExactActive}));return()=>{const r=t.default&&vu(t.default(n));return e.custom?r:xl("a",{"aria-current":n.isExactActive?e.ariaCurrentValue:null,href:n.href,onClick:n.navigate,class:o.value},r)}}}),bu=yu;function xu(e){if(!(e.metaKey||e.altKey||e.ctrlKey||e.shiftKey)&&!e.defaultPrevented&&!(e.button!==void 0&&e.button!==0)){if(e.currentTarget&&e.currentTarget.getAttribute){const t=e.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(t))return}return e.preventDefault&&e.preventDefault(),!0}}function _u(e,t){for(const n in t){const i=t[n],o=e[n];if(typeof i=="string"){if(i!==o)return!1}else if(!Be(o)||o.length!==i.length||i.some((r,l)=>r.valueOf()!==o[l].valueOf()))return!1}return!0}function or(e){return e?e.aliasOf?e.aliasOf.path:e.path:""}const rr=(e,t,n)=>e??t??n,Au=tn({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(e,{attrs:t,slots:n}){const i=rt(Bi),o=Fe(()=>e.route||i.value),r=rt(Qo,0),l=Fe(()=>{let f=bt(r);const{matched:a}=o.value;let u;for(;(u=a[f])&&!u.components;)f++;return f}),s=Fe(()=>o.value.matched[l.value]);On(Qo,Fe(()=>l.value+1)),On(Xa,s),On(Bi,o);const c=Nn();return Mn(()=>[c.value,s.value,e.name],([f,a,u],[g,h,A])=>{a&&(a.instances[u]=f,h&&h!==a&&f&&f===g&&(a.leaveGuards.size||(a.leaveGuards=h.leaveGuards),a.updateGuards.size||(a.updateGuards=h.updateGuards))),f&&a&&(!h||!Jt(a,h)||!g)&&(a.enterCallbacks[u]||[]).forEach(S=>S(f))},{flush:"post"}),()=>{const f=o.value,a=e.name,u=s.value,g=u&&u.components[a];if(!g)return lr(n.default,{Component:g,route:f});const h=u.props[a],A=h?h===!0?f.params:typeof h=="function"?h(f):h:null,k=xl(g,z({},A,t,{onVnodeUnmounted:R=>{R.component.isUnmounted&&(u.instances[a]=null)},ref:c}));return lr(n.default,{Component:k,route:f})||k}}});function lr(e,t){if(!e)return null;const n=e(t);return n.length===1?n[0]:n}const Dl=Au;function Cu(e){const t=du(e.routes,e),n=e.parseQuery||Ya,i=e.stringifyQuery||Yo,o=e.history,r=sn(),l=sn(),s=sn(),c=Ss(dt);let f=dt;Gt&&e.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const a=wi.bind(null,b=>""+b),u=wi.bind(null,Pa),g=wi.bind(null,_n);function h(b,N){let M,D;return Ml(b)?(M=t.getRecordMatcher(b),D=N):D=b,t.addRoute(D,M)}function A(b){const N=t.getRecordMatcher(b);N&&t.removeRoute(N)}function S(){return t.getRoutes().map(b=>b.record)}function k(b){return!!t.getRecordMatcher(b)}function R(b,N){if(N=z({},N||c.value),typeof b=="string"){const m=vi(n,b,N.path),v=t.resolve({path:m.path},N),_=o.createHref(m.fullPath);return z(m,v,{params:g(v.params),hash:_n(m.hash),redirectedFrom:void 0,href:_})}let M;if(b.path!=null)M=z({},b,{path:vi(n,b.path,N.path).path});else{const m=z({},b.params);for(const v in m)m[v]==null&&delete m[v];M=z({},b,{params:u(m)}),N.params=u(N.params)}const D=t.resolve(M,N),V=b.hash||"";D.params=a(g(D.params));const p=Fa(i,z({},b,{hash:Oa(V),path:D.path})),d=o.createHref(p);return z({fullPath:p,hash:V,query:i===Yo?Qa(b.query):b.query||{}},D,{redirectedFrom:void 0,href:d})}function w(b){return typeof b=="string"?vi(n,b,c.value.path):z({},b)}function E(b,N){if(f!==b)return Zt(le.NAVIGATION_CANCELLED,{from:N,to:b})}function x(b){return oe(b)}function G(b){return x(z(w(b),{replace:!0}))}function ie(b,N){const M=b.matched[b.matched.length-1];if(M&&M.redirect){const{redirect:D}=M;let V=typeof D=="function"?D(b,N):D;return typeof V=="string"&&(V=V.includes("?")||V.includes("#")?V=w(V):{path:V},V.params={}),z({query:b.query,hash:b.hash,params:V.path!=null?{}:b.params},V)}}function oe(b,N){const M=f=R(b),D=c.value,V=b.state,p=b.force,d=b.replace===!0,m=ie(M,D);if(m)return oe(z(w(m),{state:typeof m=="object"?z({},V,m.state):V,force:p,replace:d}),N||M);const v=M;v.redirectedFrom=N;let _;return!p&&Da(i,D,M)&&(_=Zt(le.NAVIGATION_DUPLICATED,{to:v,from:D}),Ge(D,D,!0,!1)),(_?Promise.resolve(_):He(v,D)).catch(y=>tt(y)?tt(y,le.NAVIGATION_GUARD_REDIRECT)?y:pt(y):W(y,v,D)).then(y=>{if(y){if(tt(y,le.NAVIGATION_GUARD_REDIRECT))return oe(z({replace:d},w(y.to),{state:typeof y.to=="object"?z({},V,y.to.state):V,force:p}),N||v)}else y=Et(v,D,!0,d,V);return ft(v,D,y),y})}function $e(b,N){const M=E(b,N);return M?Promise.reject(M):Promise.resolve()}function ut(b){const N=jt.values().next().value;return N&&typeof N.runWithContext=="function"?N.runWithContext(b):b()}function He(b,N){let M;const[D,V,p]=Ja(b,N);M=bi(D.reverse(),"beforeRouteLeave",b,N);for(const m of D)m.leaveGuards.forEach(v=>{M.push(wt(v,b,N))});const d=$e.bind(null,b,N);return M.push(d),Pe(M).then(()=>{M=[];for(const m of r.list())M.push(wt(m,b,N));return M.push(d),Pe(M)}).then(()=>{M=bi(V,"beforeRouteUpdate",b,N);for(const m of V)m.updateGuards.forEach(v=>{M.push(wt(v,b,N))});return M.push(d),Pe(M)}).then(()=>{M=[];for(const m of p)if(m.beforeEnter)if(Be(m.beforeEnter))for(const v of m.beforeEnter)M.push(wt(v,b,N));else M.push(wt(m.beforeEnter,b,N));return M.push(d),Pe(M)}).then(()=>(b.matched.forEach(m=>m.enterCallbacks={}),M=bi(p,"beforeRouteEnter",b,N,ut),M.push(d),Pe(M))).then(()=>{M=[];for(const m of l.list())M.push(wt(m,b,N));return M.push(d),Pe(M)}).catch(m=>tt(m,le.NAVIGATION_CANCELLED)?m:Promise.reject(m))}function ft(b,N,M){s.list().forEach(D=>ut(()=>D(b,N,M)))}function Et(b,N,M,D,V){const p=E(b,N);if(p)return p;const d=N===dt,m=Gt?history.state:{};M&&(D||d?o.replace(b.fullPath,z({scroll:d&&m&&m.scroll},V)):o.push(b.fullPath,V)),c.value=b,Ge(b,N,M,d),pt()}let Ue;function nn(){Ue||(Ue=o.listen((b,N,M)=>{if(!St.listening)return;const D=R(b),V=ie(D,St.currentRoute.value);if(V){oe(z(V,{replace:!0,force:!0}),D).catch(mn);return}f=D;const p=c.value;Gt&&Va(Ko(p.fullPath,M.delta),oi()),He(D,p).catch(d=>tt(d,le.NAVIGATION_ABORTED|le.NAVIGATION_CANCELLED)?d:tt(d,le.NAVIGATION_GUARD_REDIRECT)?(oe(z(w(d.to),{force:!0}),D).then(m=>{tt(m,le.NAVIGATION_ABORTED|le.NAVIGATION_DUPLICATED)&&!M.delta&&M.type===Li.pop&&o.go(-1,!1)}).catch(mn),Promise.reject()):(M.delta&&o.go(-M.delta,!1),W(d,D,p))).then(d=>{d=d||Et(D,p,!1),d&&(M.delta&&!tt(d,le.NAVIGATION_CANCELLED)?o.go(-M.delta,!1):M.type===Li.pop&&tt(d,le.NAVIGATION_ABORTED|le.NAVIGATION_DUPLICATED)&&o.go(-1,!1)),ft(D,p,d)}).catch(mn)}))}let Dt=sn(),pe=sn(),X;function W(b,N,M){pt(b);const D=pe.list();return D.length?D.forEach(V=>V(b,N,M)):console.error(b),Promise.reject(b)}function Ze(){return X&&c.value!==dt?Promise.resolve():new Promise((b,N)=>{Dt.add([b,N])})}function pt(b){return X||(X=!b,nn(),Dt.list().forEach(([N,M])=>b?M(b):N()),Dt.reset()),b}function Ge(b,N,M,D){const{scrollBehavior:V}=e;if(!Gt||!V)return Promise.resolve();const p=!M&&qa(Ko(b.fullPath,0))||(D||!M)&&history.state&&history.state.scroll||null;return Vr().then(()=>V(b,N,p)).then(d=>d&&Ga(d)).catch(d=>W(d,b,N))}const _e=b=>o.go(b);let Lt;const jt=new Set,St={currentRoute:c,listening:!0,addRoute:h,removeRoute:A,clearRoutes:t.clearRoutes,hasRoute:k,getRoutes:S,resolve:R,options:e,push:x,replace:G,go:_e,back:()=>_e(-1),forward:()=>_e(1),beforeEach:r.add,beforeResolve:l.add,afterEach:s.add,onError:pe.add,isReady:Ze,install(b){b.component("RouterLink",bu),b.component("RouterView",Dl),b.config.globalProperties.$router=St,Object.defineProperty(b.config.globalProperties,"$route",{enumerable:!0,get:()=>bt(c)}),Gt&&!Lt&&c.value===dt&&(Lt=!0,x(o.location).catch(D=>{}));const N={};for(const D in dt)Object.defineProperty(N,D,{get:()=>c.value[D],enumerable:!0});b.provide(lo,St),b.provide(Pl,Br(N)),b.provide(Bi,c);const M=b.unmount;jt.add(b),b.unmount=function(){jt.delete(b),jt.size<1&&(f=dt,Ue&&Ue(),Ue=null,c.value=dt,Lt=!1,X=!1),M()}}};function Pe(b){return b.reduce((N,M)=>N.then(()=>ut(M)),Promise.resolve())}return St}const Eu=""+new URL("images/favicon6.png",import.meta.url).href,Su={class:"header"},Iu={class:"header-content"},Tu={class:"nav"},Ou=tn({__name:"Header",setup(e){return(t,n)=>{const i=ec("RouterLink");return re(),se("header",Su,[j("div",Iu,[n[2]||(n[2]=j("div",{class:"logo-section"},[j("img",{src:Eu,alt:"Logo",class:"logo"}),j("h1",{class:"site-title mixed-pixel-nav"},"Financial Independence")],-1)),j("nav",Tu,[fe(i,{to:"/",class:"nav-link mixed-pixel-nav"},{default:Oi(()=>[...n[0]||(n[0]=[Un("首页",-1)])]),_:1}),fe(i,{to:"/about",class:"nav-link mixed-pixel-nav"},{default:Oi(()=>[...n[1]||(n[1]=[Un("关于",-1)])]),_:1})])])])}}}),ri=(e,t)=>{const n=e.__vccOpts||e;for(const[i,o]of t)n[i]=o;return n},Mu=ri(Ou,[["__scopeId","data-v-8da4e8d7"]]),Ru={class:"app"},Pu=tn({__name:"App",setup(e){return(t,n)=>(re(),se("div",Ru,[fe(Mu),j("main",null,[fe(bt(Dl))])]))}}),ku=ri(Pu,[["__scopeId","data-v-e2a83380"]]),Nu="modulepreload",Fu=function(e,t){return new URL(e,t).href},sr={},Du=function(t,n,i){let o=Promise.resolve();if(n&&n.length>0){let f=function(a){return Promise.all(a.map(u=>Promise.resolve(u).then(g=>({status:"fulfilled",value:g}),g=>({status:"rejected",reason:g}))))};const l=document.getElementsByTagName("link"),s=document.querySelector("meta[property=csp-nonce]"),c=s?.nonce||s?.getAttribute("nonce");o=f(n.map(a=>{if(a=Fu(a,i),a in sr)return;sr[a]=!0;const u=a.endsWith(".css"),g=u?'[rel="stylesheet"]':"";if(i)for(let A=l.length-1;A>=0;A--){const S=l[A];if(S.href===a&&(!u||S.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${a}"]${g}`))return;const h=document.createElement("link");if(h.rel=u?"stylesheet":Nu,u||(h.as="script"),h.crossOrigin="",h.href=a,c&&h.setAttribute("nonce",c),document.head.appendChild(h),u)return new Promise((A,S)=>{h.addEventListener("load",A),h.addEventListener("error",()=>S(new Error(`Unable to preload CSS for ${a}`)))})}))}function r(l){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=l,window.dispatchEvent(s),!s.defaultPrevented)throw l}return o.then(l=>{for(const s of l||[])s.status==="rejected"&&r(s.reason);return t().catch(r)})};function Ll(e){return typeof e>"u"||e===null}function Lu(e){return typeof e=="object"&&e!==null}function ju(e){return Array.isArray(e)?e:Ll(e)?[]:[e]}function Bu(e,t){var n,i,o,r;if(t)for(r=Object.keys(t),n=0,i=r.length;n<i;n+=1)o=r[n],e[o]=t[o];return e}function $u(e,t){var n="",i;for(i=0;i<t;i+=1)n+=e;return n}function Hu(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}var Uu=Ll,Gu=Lu,Vu=ju,qu=$u,Wu=Hu,zu=Bu,xe={isNothing:Uu,isObject:Gu,toArray:Vu,repeat:qu,isNegativeZero:Wu,extend:zu};function jl(e,t){var n="",i=e.reason||"(unknown reason)";return e.mark?(e.mark.name&&(n+='in "'+e.mark.name+'" '),n+="("+(e.mark.line+1)+":"+(e.mark.column+1)+")",!t&&e.mark.snippet&&(n+=`

`+e.mark.snippet),i+" "+n):i}function An(e,t){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=t,this.message=jl(this,!1),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}An.prototype=Object.create(Error.prototype);An.prototype.constructor=An;An.prototype.toString=function(t){return this.name+": "+jl(this,t)};var ot=An;function xi(e,t,n,i,o){var r="",l="",s=Math.floor(o/2)-1;return i-t>s&&(r=" ... ",t=i-s+r.length),n-i>s&&(l=" ...",n=i+s-l.length),{str:r+e.slice(t,n).replace(/\t/g,"→")+l,pos:i-t+r.length}}function _i(e,t){return xe.repeat(" ",t-e.length)+e}function Ku(e,t){if(t=Object.create(t||null),!e.buffer)return null;t.maxLength||(t.maxLength=79),typeof t.indent!="number"&&(t.indent=1),typeof t.linesBefore!="number"&&(t.linesBefore=3),typeof t.linesAfter!="number"&&(t.linesAfter=2);for(var n=/\r?\n|\r|\0/g,i=[0],o=[],r,l=-1;r=n.exec(e.buffer);)o.push(r.index),i.push(r.index+r[0].length),e.position<=r.index&&l<0&&(l=i.length-2);l<0&&(l=i.length-1);var s="",c,f,a=Math.min(e.line+t.linesAfter,o.length).toString().length,u=t.maxLength-(t.indent+a+3);for(c=1;c<=t.linesBefore&&!(l-c<0);c++)f=xi(e.buffer,i[l-c],o[l-c],e.position-(i[l]-i[l-c]),u),s=xe.repeat(" ",t.indent)+_i((e.line-c+1).toString(),a)+" | "+f.str+`
`+s;for(f=xi(e.buffer,i[l],o[l],e.position,u),s+=xe.repeat(" ",t.indent)+_i((e.line+1).toString(),a)+" | "+f.str+`
`,s+=xe.repeat("-",t.indent+a+3+f.pos)+`^
`,c=1;c<=t.linesAfter&&!(l+c>=o.length);c++)f=xi(e.buffer,i[l+c],o[l+c],e.position-(i[l]-i[l+c]),u),s+=xe.repeat(" ",t.indent)+_i((e.line+c+1).toString(),a)+" | "+f.str+`
`;return s.replace(/\n$/,"")}var Yu=Ku,Qu=["kind","multi","resolve","construct","instanceOf","predicate","represent","representName","defaultStyle","styleAliases"],Xu=["scalar","sequence","mapping"];function Ju(e){var t={};return e!==null&&Object.keys(e).forEach(function(n){e[n].forEach(function(i){t[String(i)]=n})}),t}function Zu(e,t){if(t=t||{},Object.keys(t).forEach(function(n){if(Qu.indexOf(n)===-1)throw new ot('Unknown option "'+n+'" is met in definition of "'+e+'" YAML type.')}),this.options=t,this.tag=e,this.kind=t.kind||null,this.resolve=t.resolve||function(){return!0},this.construct=t.construct||function(n){return n},this.instanceOf=t.instanceOf||null,this.predicate=t.predicate||null,this.represent=t.represent||null,this.representName=t.representName||null,this.defaultStyle=t.defaultStyle||null,this.multi=t.multi||!1,this.styleAliases=Ju(t.styleAliases||null),Xu.indexOf(this.kind)===-1)throw new ot('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var we=Zu;function cr(e,t){var n=[];return e[t].forEach(function(i){var o=n.length;n.forEach(function(r,l){r.tag===i.tag&&r.kind===i.kind&&r.multi===i.multi&&(o=l)}),n[o]=i}),n}function ef(){var e={scalar:{},sequence:{},mapping:{},fallback:{},multi:{scalar:[],sequence:[],mapping:[],fallback:[]}},t,n;function i(o){o.multi?(e.multi[o.kind].push(o),e.multi.fallback.push(o)):e[o.kind][o.tag]=e.fallback[o.tag]=o}for(t=0,n=arguments.length;t<n;t+=1)arguments[t].forEach(i);return e}function $i(e){return this.extend(e)}$i.prototype.extend=function(t){var n=[],i=[];if(t instanceof we)i.push(t);else if(Array.isArray(t))i=i.concat(t);else if(t&&(Array.isArray(t.implicit)||Array.isArray(t.explicit)))t.implicit&&(n=n.concat(t.implicit)),t.explicit&&(i=i.concat(t.explicit));else throw new ot("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");n.forEach(function(r){if(!(r instanceof we))throw new ot("Specified list of YAML types (or a single Type object) contains a non-Type object.");if(r.loadKind&&r.loadKind!=="scalar")throw new ot("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");if(r.multi)throw new ot("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.")}),i.forEach(function(r){if(!(r instanceof we))throw new ot("Specified list of YAML types (or a single Type object) contains a non-Type object.")});var o=Object.create($i.prototype);return o.implicit=(this.implicit||[]).concat(n),o.explicit=(this.explicit||[]).concat(i),o.compiledImplicit=cr(o,"implicit"),o.compiledExplicit=cr(o,"explicit"),o.compiledTypeMap=ef(o.compiledImplicit,o.compiledExplicit),o};var tf=$i,nf=new we("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),of=new we("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),rf=new we("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),lf=new tf({explicit:[nf,of,rf]});function sf(e){if(e===null)return!0;var t=e.length;return t===1&&e==="~"||t===4&&(e==="null"||e==="Null"||e==="NULL")}function cf(){return null}function af(e){return e===null}var uf=new we("tag:yaml.org,2002:null",{kind:"scalar",resolve:sf,construct:cf,predicate:af,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"},empty:function(){return""}},defaultStyle:"lowercase"});function ff(e){if(e===null)return!1;var t=e.length;return t===4&&(e==="true"||e==="True"||e==="TRUE")||t===5&&(e==="false"||e==="False"||e==="FALSE")}function pf(e){return e==="true"||e==="True"||e==="TRUE"}function df(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var hf=new we("tag:yaml.org,2002:bool",{kind:"scalar",resolve:ff,construct:pf,predicate:df,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"});function gf(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function mf(e){return 48<=e&&e<=55}function wf(e){return 48<=e&&e<=57}function vf(e){if(e===null)return!1;var t=e.length,n=0,i=!1,o;if(!t)return!1;if(o=e[n],(o==="-"||o==="+")&&(o=e[++n]),o==="0"){if(n+1===t)return!0;if(o=e[++n],o==="b"){for(n++;n<t;n++)if(o=e[n],o!=="_"){if(o!=="0"&&o!=="1")return!1;i=!0}return i&&o!=="_"}if(o==="x"){for(n++;n<t;n++)if(o=e[n],o!=="_"){if(!gf(e.charCodeAt(n)))return!1;i=!0}return i&&o!=="_"}if(o==="o"){for(n++;n<t;n++)if(o=e[n],o!=="_"){if(!mf(e.charCodeAt(n)))return!1;i=!0}return i&&o!=="_"}}if(o==="_")return!1;for(;n<t;n++)if(o=e[n],o!=="_"){if(!wf(e.charCodeAt(n)))return!1;i=!0}return!(!i||o==="_")}function yf(e){var t=e,n=1,i;if(t.indexOf("_")!==-1&&(t=t.replace(/_/g,"")),i=t[0],(i==="-"||i==="+")&&(i==="-"&&(n=-1),t=t.slice(1),i=t[0]),t==="0")return 0;if(i==="0"){if(t[1]==="b")return n*parseInt(t.slice(2),2);if(t[1]==="x")return n*parseInt(t.slice(2),16);if(t[1]==="o")return n*parseInt(t.slice(2),8)}return n*parseInt(t,10)}function bf(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!xe.isNegativeZero(e)}var xf=new we("tag:yaml.org,2002:int",{kind:"scalar",resolve:vf,construct:yf,predicate:bf,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0o"+e.toString(8):"-0o"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),_f=new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function Af(e){return!(e===null||!_f.test(e)||e[e.length-1]==="_")}function Cf(e){var t,n;return t=e.replace(/_/g,"").toLowerCase(),n=t[0]==="-"?-1:1,"+-".indexOf(t[0])>=0&&(t=t.slice(1)),t===".inf"?n===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:t===".nan"?NaN:n*parseFloat(t,10)}var Ef=/^[-+]?[0-9]+e/;function Sf(e,t){var n;if(isNaN(e))switch(t){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(t){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(t){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(xe.isNegativeZero(e))return"-0.0";return n=e.toString(10),Ef.test(n)?n.replace("e",".e"):n}function If(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||xe.isNegativeZero(e))}var Tf=new we("tag:yaml.org,2002:float",{kind:"scalar",resolve:Af,construct:Cf,predicate:If,represent:Sf,defaultStyle:"lowercase"}),Of=lf.extend({implicit:[uf,hf,xf,Tf]}),Mf=Of,Bl=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),$l=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function Rf(e){return e===null?!1:Bl.exec(e)!==null||$l.exec(e)!==null}function Pf(e){var t,n,i,o,r,l,s,c=0,f=null,a,u,g;if(t=Bl.exec(e),t===null&&(t=$l.exec(e)),t===null)throw new Error("Date resolve error");if(n=+t[1],i=+t[2]-1,o=+t[3],!t[4])return new Date(Date.UTC(n,i,o));if(r=+t[4],l=+t[5],s=+t[6],t[7]){for(c=t[7].slice(0,3);c.length<3;)c+="0";c=+c}return t[9]&&(a=+t[10],u=+(t[11]||0),f=(a*60+u)*6e4,t[9]==="-"&&(f=-f)),g=new Date(Date.UTC(n,i,o,r,l,s,c)),f&&g.setTime(g.getTime()-f),g}function kf(e){return e.toISOString()}var Nf=new we("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:Rf,construct:Pf,instanceOf:Date,represent:kf});function Ff(e){return e==="<<"||e===null}var Df=new we("tag:yaml.org,2002:merge",{kind:"scalar",resolve:Ff}),so=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function Lf(e){if(e===null)return!1;var t,n,i=0,o=e.length,r=so;for(n=0;n<o;n++)if(t=r.indexOf(e.charAt(n)),!(t>64)){if(t<0)return!1;i+=6}return i%8===0}function jf(e){var t,n,i=e.replace(/[\r\n=]/g,""),o=i.length,r=so,l=0,s=[];for(t=0;t<o;t++)t%4===0&&t&&(s.push(l>>16&255),s.push(l>>8&255),s.push(l&255)),l=l<<6|r.indexOf(i.charAt(t));return n=o%4*6,n===0?(s.push(l>>16&255),s.push(l>>8&255),s.push(l&255)):n===18?(s.push(l>>10&255),s.push(l>>2&255)):n===12&&s.push(l>>4&255),new Uint8Array(s)}function Bf(e){var t="",n=0,i,o,r=e.length,l=so;for(i=0;i<r;i++)i%3===0&&i&&(t+=l[n>>18&63],t+=l[n>>12&63],t+=l[n>>6&63],t+=l[n&63]),n=(n<<8)+e[i];return o=r%3,o===0?(t+=l[n>>18&63],t+=l[n>>12&63],t+=l[n>>6&63],t+=l[n&63]):o===2?(t+=l[n>>10&63],t+=l[n>>4&63],t+=l[n<<2&63],t+=l[64]):o===1&&(t+=l[n>>2&63],t+=l[n<<4&63],t+=l[64],t+=l[64]),t}function $f(e){return Object.prototype.toString.call(e)==="[object Uint8Array]"}var Hf=new we("tag:yaml.org,2002:binary",{kind:"scalar",resolve:Lf,construct:jf,predicate:$f,represent:Bf}),Uf=Object.prototype.hasOwnProperty,Gf=Object.prototype.toString;function Vf(e){if(e===null)return!0;var t=[],n,i,o,r,l,s=e;for(n=0,i=s.length;n<i;n+=1){if(o=s[n],l=!1,Gf.call(o)!=="[object Object]")return!1;for(r in o)if(Uf.call(o,r))if(!l)l=!0;else return!1;if(!l)return!1;if(t.indexOf(r)===-1)t.push(r);else return!1}return!0}function qf(e){return e!==null?e:[]}var Wf=new we("tag:yaml.org,2002:omap",{kind:"sequence",resolve:Vf,construct:qf}),zf=Object.prototype.toString;function Kf(e){if(e===null)return!0;var t,n,i,o,r,l=e;for(r=new Array(l.length),t=0,n=l.length;t<n;t+=1){if(i=l[t],zf.call(i)!=="[object Object]"||(o=Object.keys(i),o.length!==1))return!1;r[t]=[o[0],i[o[0]]]}return!0}function Yf(e){if(e===null)return[];var t,n,i,o,r,l=e;for(r=new Array(l.length),t=0,n=l.length;t<n;t+=1)i=l[t],o=Object.keys(i),r[t]=[o[0],i[o[0]]];return r}var Qf=new we("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:Kf,construct:Yf}),Xf=Object.prototype.hasOwnProperty;function Jf(e){if(e===null)return!0;var t,n=e;for(t in n)if(Xf.call(n,t)&&n[t]!==null)return!1;return!0}function Zf(e){return e!==null?e:{}}var ep=new we("tag:yaml.org,2002:set",{kind:"mapping",resolve:Jf,construct:Zf}),tp=Mf.extend({implicit:[Nf,Df],explicit:[Hf,Wf,Qf,ep]}),At=Object.prototype.hasOwnProperty,Vn=1,Hl=2,Ul=3,qn=4,Ai=1,np=2,ar=3,ip=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,op=/[\x85\u2028\u2029]/,rp=/[,\[\]\{\}]/,Gl=/^(?:!|!!|![a-z\-]+!)$/i,Vl=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function ur(e){return Object.prototype.toString.call(e)}function Xe(e){return e===10||e===13}function Nt(e){return e===9||e===32}function Te(e){return e===9||e===32||e===10||e===13}function Vt(e){return e===44||e===91||e===93||e===123||e===125}function lp(e){var t;return 48<=e&&e<=57?e-48:(t=e|32,97<=t&&t<=102?t-97+10:-1)}function sp(e){return e===120?2:e===117?4:e===85?8:0}function cp(e){return 48<=e&&e<=57?e-48:-1}function fr(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function ap(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function ql(e,t,n){t==="__proto__"?Object.defineProperty(e,t,{configurable:!0,enumerable:!0,writable:!0,value:n}):e[t]=n}var Wl=new Array(256),zl=new Array(256);for(var $t=0;$t<256;$t++)Wl[$t]=fr($t)?1:0,zl[$t]=fr($t);function up(e,t){this.input=e,this.filename=t.filename||null,this.schema=t.schema||tp,this.onWarning=t.onWarning||null,this.legacy=t.legacy||!1,this.json=t.json||!1,this.listener=t.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.firstTabInLine=-1,this.documents=[]}function Kl(e,t){var n={name:e.filename,buffer:e.input.slice(0,-1),position:e.position,line:e.line,column:e.position-e.lineStart};return n.snippet=Yu(n),new ot(t,n)}function F(e,t){throw Kl(e,t)}function Wn(e,t){e.onWarning&&e.onWarning.call(null,Kl(e,t))}var pr={YAML:function(t,n,i){var o,r,l;t.version!==null&&F(t,"duplication of %YAML directive"),i.length!==1&&F(t,"YAML directive accepts exactly one argument"),o=/^([0-9]+)\.([0-9]+)$/.exec(i[0]),o===null&&F(t,"ill-formed argument of the YAML directive"),r=parseInt(o[1],10),l=parseInt(o[2],10),r!==1&&F(t,"unacceptable YAML version of the document"),t.version=i[0],t.checkLineBreaks=l<2,l!==1&&l!==2&&Wn(t,"unsupported YAML version of the document")},TAG:function(t,n,i){var o,r;i.length!==2&&F(t,"TAG directive accepts exactly two arguments"),o=i[0],r=i[1],Gl.test(o)||F(t,"ill-formed tag handle (first argument) of the TAG directive"),At.call(t.tagMap,o)&&F(t,'there is a previously declared suffix for "'+o+'" tag handle'),Vl.test(r)||F(t,"ill-formed tag prefix (second argument) of the TAG directive");try{r=decodeURIComponent(r)}catch{F(t,"tag prefix is malformed: "+r)}t.tagMap[o]=r}};function xt(e,t,n,i){var o,r,l,s;if(t<n){if(s=e.input.slice(t,n),i)for(o=0,r=s.length;o<r;o+=1)l=s.charCodeAt(o),l===9||32<=l&&l<=1114111||F(e,"expected valid JSON character");else ip.test(s)&&F(e,"the stream contains non-printable characters");e.result+=s}}function dr(e,t,n,i){var o,r,l,s;for(xe.isObject(n)||F(e,"cannot merge mappings; the provided source object is unacceptable"),o=Object.keys(n),l=0,s=o.length;l<s;l+=1)r=o[l],At.call(t,r)||(ql(t,r,n[r]),i[r]=!0)}function qt(e,t,n,i,o,r,l,s,c){var f,a;if(Array.isArray(o))for(o=Array.prototype.slice.call(o),f=0,a=o.length;f<a;f+=1)Array.isArray(o[f])&&F(e,"nested arrays are not supported inside keys"),typeof o=="object"&&ur(o[f])==="[object Object]"&&(o[f]="[object Object]");if(typeof o=="object"&&ur(o)==="[object Object]"&&(o="[object Object]"),o=String(o),t===null&&(t={}),i==="tag:yaml.org,2002:merge")if(Array.isArray(r))for(f=0,a=r.length;f<a;f+=1)dr(e,t,r[f],n);else dr(e,t,r,n);else!e.json&&!At.call(n,o)&&At.call(t,o)&&(e.line=l||e.line,e.lineStart=s||e.lineStart,e.position=c||e.position,F(e,"duplicated mapping key")),ql(t,o,r),delete n[o];return t}function co(e){var t;t=e.input.charCodeAt(e.position),t===10?e.position++:t===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):F(e,"a line break is expected"),e.line+=1,e.lineStart=e.position,e.firstTabInLine=-1}function ce(e,t,n){for(var i=0,o=e.input.charCodeAt(e.position);o!==0;){for(;Nt(o);)o===9&&e.firstTabInLine===-1&&(e.firstTabInLine=e.position),o=e.input.charCodeAt(++e.position);if(t&&o===35)do o=e.input.charCodeAt(++e.position);while(o!==10&&o!==13&&o!==0);if(Xe(o))for(co(e),o=e.input.charCodeAt(e.position),i++,e.lineIndent=0;o===32;)e.lineIndent++,o=e.input.charCodeAt(++e.position);else break}return n!==-1&&i!==0&&e.lineIndent<n&&Wn(e,"deficient indentation"),i}function li(e){var t=e.position,n;return n=e.input.charCodeAt(t),!!((n===45||n===46)&&n===e.input.charCodeAt(t+1)&&n===e.input.charCodeAt(t+2)&&(t+=3,n=e.input.charCodeAt(t),n===0||Te(n)))}function ao(e,t){t===1?e.result+=" ":t>1&&(e.result+=xe.repeat(`
`,t-1))}function fp(e,t,n){var i,o,r,l,s,c,f,a,u=e.kind,g=e.result,h;if(h=e.input.charCodeAt(e.position),Te(h)||Vt(h)||h===35||h===38||h===42||h===33||h===124||h===62||h===39||h===34||h===37||h===64||h===96||(h===63||h===45)&&(o=e.input.charCodeAt(e.position+1),Te(o)||n&&Vt(o)))return!1;for(e.kind="scalar",e.result="",r=l=e.position,s=!1;h!==0;){if(h===58){if(o=e.input.charCodeAt(e.position+1),Te(o)||n&&Vt(o))break}else if(h===35){if(i=e.input.charCodeAt(e.position-1),Te(i))break}else{if(e.position===e.lineStart&&li(e)||n&&Vt(h))break;if(Xe(h))if(c=e.line,f=e.lineStart,a=e.lineIndent,ce(e,!1,-1),e.lineIndent>=t){s=!0,h=e.input.charCodeAt(e.position);continue}else{e.position=l,e.line=c,e.lineStart=f,e.lineIndent=a;break}}s&&(xt(e,r,l,!1),ao(e,e.line-c),r=l=e.position,s=!1),Nt(h)||(l=e.position+1),h=e.input.charCodeAt(++e.position)}return xt(e,r,l,!1),e.result?!0:(e.kind=u,e.result=g,!1)}function pp(e,t){var n,i,o;if(n=e.input.charCodeAt(e.position),n!==39)return!1;for(e.kind="scalar",e.result="",e.position++,i=o=e.position;(n=e.input.charCodeAt(e.position))!==0;)if(n===39)if(xt(e,i,e.position,!0),n=e.input.charCodeAt(++e.position),n===39)i=e.position,e.position++,o=e.position;else return!0;else Xe(n)?(xt(e,i,o,!0),ao(e,ce(e,!1,t)),i=o=e.position):e.position===e.lineStart&&li(e)?F(e,"unexpected end of the document within a single quoted scalar"):(e.position++,o=e.position);F(e,"unexpected end of the stream within a single quoted scalar")}function dp(e,t){var n,i,o,r,l,s;if(s=e.input.charCodeAt(e.position),s!==34)return!1;for(e.kind="scalar",e.result="",e.position++,n=i=e.position;(s=e.input.charCodeAt(e.position))!==0;){if(s===34)return xt(e,n,e.position,!0),e.position++,!0;if(s===92){if(xt(e,n,e.position,!0),s=e.input.charCodeAt(++e.position),Xe(s))ce(e,!1,t);else if(s<256&&Wl[s])e.result+=zl[s],e.position++;else if((l=sp(s))>0){for(o=l,r=0;o>0;o--)s=e.input.charCodeAt(++e.position),(l=lp(s))>=0?r=(r<<4)+l:F(e,"expected hexadecimal character");e.result+=ap(r),e.position++}else F(e,"unknown escape sequence");n=i=e.position}else Xe(s)?(xt(e,n,i,!0),ao(e,ce(e,!1,t)),n=i=e.position):e.position===e.lineStart&&li(e)?F(e,"unexpected end of the document within a double quoted scalar"):(e.position++,i=e.position)}F(e,"unexpected end of the stream within a double quoted scalar")}function hp(e,t){var n=!0,i,o,r,l=e.tag,s,c=e.anchor,f,a,u,g,h,A=Object.create(null),S,k,R,w;if(w=e.input.charCodeAt(e.position),w===91)a=93,h=!1,s=[];else if(w===123)a=125,h=!0,s={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=s),w=e.input.charCodeAt(++e.position);w!==0;){if(ce(e,!0,t),w=e.input.charCodeAt(e.position),w===a)return e.position++,e.tag=l,e.anchor=c,e.kind=h?"mapping":"sequence",e.result=s,!0;n?w===44&&F(e,"expected the node content, but found ','"):F(e,"missed comma between flow collection entries"),k=S=R=null,u=g=!1,w===63&&(f=e.input.charCodeAt(e.position+1),Te(f)&&(u=g=!0,e.position++,ce(e,!0,t))),i=e.line,o=e.lineStart,r=e.position,en(e,t,Vn,!1,!0),k=e.tag,S=e.result,ce(e,!0,t),w=e.input.charCodeAt(e.position),(g||e.line===i)&&w===58&&(u=!0,w=e.input.charCodeAt(++e.position),ce(e,!0,t),en(e,t,Vn,!1,!0),R=e.result),h?qt(e,s,A,k,S,R,i,o,r):u?s.push(qt(e,null,A,k,S,R,i,o,r)):s.push(S),ce(e,!0,t),w=e.input.charCodeAt(e.position),w===44?(n=!0,w=e.input.charCodeAt(++e.position)):n=!1}F(e,"unexpected end of the stream within a flow collection")}function gp(e,t){var n,i,o=Ai,r=!1,l=!1,s=t,c=0,f=!1,a,u;if(u=e.input.charCodeAt(e.position),u===124)i=!1;else if(u===62)i=!0;else return!1;for(e.kind="scalar",e.result="";u!==0;)if(u=e.input.charCodeAt(++e.position),u===43||u===45)Ai===o?o=u===43?ar:np:F(e,"repeat of a chomping mode identifier");else if((a=cp(u))>=0)a===0?F(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):l?F(e,"repeat of an indentation width identifier"):(s=t+a-1,l=!0);else break;if(Nt(u)){do u=e.input.charCodeAt(++e.position);while(Nt(u));if(u===35)do u=e.input.charCodeAt(++e.position);while(!Xe(u)&&u!==0)}for(;u!==0;){for(co(e),e.lineIndent=0,u=e.input.charCodeAt(e.position);(!l||e.lineIndent<s)&&u===32;)e.lineIndent++,u=e.input.charCodeAt(++e.position);if(!l&&e.lineIndent>s&&(s=e.lineIndent),Xe(u)){c++;continue}if(e.lineIndent<s){o===ar?e.result+=xe.repeat(`
`,r?1+c:c):o===Ai&&r&&(e.result+=`
`);break}for(i?Nt(u)?(f=!0,e.result+=xe.repeat(`
`,r?1+c:c)):f?(f=!1,e.result+=xe.repeat(`
`,c+1)):c===0?r&&(e.result+=" "):e.result+=xe.repeat(`
`,c):e.result+=xe.repeat(`
`,r?1+c:c),r=!0,l=!0,c=0,n=e.position;!Xe(u)&&u!==0;)u=e.input.charCodeAt(++e.position);xt(e,n,e.position,!1)}return!0}function hr(e,t){var n,i=e.tag,o=e.anchor,r=[],l,s=!1,c;if(e.firstTabInLine!==-1)return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=r),c=e.input.charCodeAt(e.position);c!==0&&(e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,F(e,"tab characters must not be used in indentation")),!(c!==45||(l=e.input.charCodeAt(e.position+1),!Te(l))));){if(s=!0,e.position++,ce(e,!0,-1)&&e.lineIndent<=t){r.push(null),c=e.input.charCodeAt(e.position);continue}if(n=e.line,en(e,t,Ul,!1,!0),r.push(e.result),ce(e,!0,-1),c=e.input.charCodeAt(e.position),(e.line===n||e.lineIndent>t)&&c!==0)F(e,"bad indentation of a sequence entry");else if(e.lineIndent<t)break}return s?(e.tag=i,e.anchor=o,e.kind="sequence",e.result=r,!0):!1}function mp(e,t,n){var i,o,r,l,s,c,f=e.tag,a=e.anchor,u={},g=Object.create(null),h=null,A=null,S=null,k=!1,R=!1,w;if(e.firstTabInLine!==-1)return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=u),w=e.input.charCodeAt(e.position);w!==0;){if(!k&&e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,F(e,"tab characters must not be used in indentation")),i=e.input.charCodeAt(e.position+1),r=e.line,(w===63||w===58)&&Te(i))w===63?(k&&(qt(e,u,g,h,A,null,l,s,c),h=A=S=null),R=!0,k=!0,o=!0):k?(k=!1,o=!0):F(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,w=i;else{if(l=e.line,s=e.lineStart,c=e.position,!en(e,n,Hl,!1,!0))break;if(e.line===r){for(w=e.input.charCodeAt(e.position);Nt(w);)w=e.input.charCodeAt(++e.position);if(w===58)w=e.input.charCodeAt(++e.position),Te(w)||F(e,"a whitespace character is expected after the key-value separator within a block mapping"),k&&(qt(e,u,g,h,A,null,l,s,c),h=A=S=null),R=!0,k=!1,o=!1,h=e.tag,A=e.result;else if(R)F(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=f,e.anchor=a,!0}else if(R)F(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=f,e.anchor=a,!0}if((e.line===r||e.lineIndent>t)&&(k&&(l=e.line,s=e.lineStart,c=e.position),en(e,t,qn,!0,o)&&(k?A=e.result:S=e.result),k||(qt(e,u,g,h,A,S,l,s,c),h=A=S=null),ce(e,!0,-1),w=e.input.charCodeAt(e.position)),(e.line===r||e.lineIndent>t)&&w!==0)F(e,"bad indentation of a mapping entry");else if(e.lineIndent<t)break}return k&&qt(e,u,g,h,A,null,l,s,c),R&&(e.tag=f,e.anchor=a,e.kind="mapping",e.result=u),R}function wp(e){var t,n=!1,i=!1,o,r,l;if(l=e.input.charCodeAt(e.position),l!==33)return!1;if(e.tag!==null&&F(e,"duplication of a tag property"),l=e.input.charCodeAt(++e.position),l===60?(n=!0,l=e.input.charCodeAt(++e.position)):l===33?(i=!0,o="!!",l=e.input.charCodeAt(++e.position)):o="!",t=e.position,n){do l=e.input.charCodeAt(++e.position);while(l!==0&&l!==62);e.position<e.length?(r=e.input.slice(t,e.position),l=e.input.charCodeAt(++e.position)):F(e,"unexpected end of the stream within a verbatim tag")}else{for(;l!==0&&!Te(l);)l===33&&(i?F(e,"tag suffix cannot contain exclamation marks"):(o=e.input.slice(t-1,e.position+1),Gl.test(o)||F(e,"named tag handle cannot contain such characters"),i=!0,t=e.position+1)),l=e.input.charCodeAt(++e.position);r=e.input.slice(t,e.position),rp.test(r)&&F(e,"tag suffix cannot contain flow indicator characters")}r&&!Vl.test(r)&&F(e,"tag name cannot contain such characters: "+r);try{r=decodeURIComponent(r)}catch{F(e,"tag name is malformed: "+r)}return n?e.tag=r:At.call(e.tagMap,o)?e.tag=e.tagMap[o]+r:o==="!"?e.tag="!"+r:o==="!!"?e.tag="tag:yaml.org,2002:"+r:F(e,'undeclared tag handle "'+o+'"'),!0}function vp(e){var t,n;if(n=e.input.charCodeAt(e.position),n!==38)return!1;for(e.anchor!==null&&F(e,"duplication of an anchor property"),n=e.input.charCodeAt(++e.position),t=e.position;n!==0&&!Te(n)&&!Vt(n);)n=e.input.charCodeAt(++e.position);return e.position===t&&F(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(t,e.position),!0}function yp(e){var t,n,i;if(i=e.input.charCodeAt(e.position),i!==42)return!1;for(i=e.input.charCodeAt(++e.position),t=e.position;i!==0&&!Te(i)&&!Vt(i);)i=e.input.charCodeAt(++e.position);return e.position===t&&F(e,"name of an alias node must contain at least one character"),n=e.input.slice(t,e.position),At.call(e.anchorMap,n)||F(e,'unidentified alias "'+n+'"'),e.result=e.anchorMap[n],ce(e,!0,-1),!0}function en(e,t,n,i,o){var r,l,s,c=1,f=!1,a=!1,u,g,h,A,S,k;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,r=l=s=qn===n||Ul===n,i&&ce(e,!0,-1)&&(f=!0,e.lineIndent>t?c=1:e.lineIndent===t?c=0:e.lineIndent<t&&(c=-1)),c===1)for(;wp(e)||vp(e);)ce(e,!0,-1)?(f=!0,s=r,e.lineIndent>t?c=1:e.lineIndent===t?c=0:e.lineIndent<t&&(c=-1)):s=!1;if(s&&(s=f||o),(c===1||qn===n)&&(Vn===n||Hl===n?S=t:S=t+1,k=e.position-e.lineStart,c===1?s&&(hr(e,k)||mp(e,k,S))||hp(e,S)?a=!0:(l&&gp(e,S)||pp(e,S)||dp(e,S)?a=!0:yp(e)?(a=!0,(e.tag!==null||e.anchor!==null)&&F(e,"alias node should not have any properties")):fp(e,S,Vn===n)&&(a=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):c===0&&(a=s&&hr(e,k))),e.tag===null)e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);else if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&F(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),u=0,g=e.implicitTypes.length;u<g;u+=1)if(A=e.implicitTypes[u],A.resolve(e.result)){e.result=A.construct(e.result),e.tag=A.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else if(e.tag!=="!"){if(At.call(e.typeMap[e.kind||"fallback"],e.tag))A=e.typeMap[e.kind||"fallback"][e.tag];else for(A=null,h=e.typeMap.multi[e.kind||"fallback"],u=0,g=h.length;u<g;u+=1)if(e.tag.slice(0,h[u].tag.length)===h[u].tag){A=h[u];break}A||F(e,"unknown tag !<"+e.tag+">"),e.result!==null&&A.kind!==e.kind&&F(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+A.kind+'", not "'+e.kind+'"'),A.resolve(e.result,e.tag)?(e.result=A.construct(e.result,e.tag),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):F(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")}return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||a}function bp(e){var t=e.position,n,i,o,r=!1,l;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap=Object.create(null),e.anchorMap=Object.create(null);(l=e.input.charCodeAt(e.position))!==0&&(ce(e,!0,-1),l=e.input.charCodeAt(e.position),!(e.lineIndent>0||l!==37));){for(r=!0,l=e.input.charCodeAt(++e.position),n=e.position;l!==0&&!Te(l);)l=e.input.charCodeAt(++e.position);for(i=e.input.slice(n,e.position),o=[],i.length<1&&F(e,"directive name must not be less than one character in length");l!==0;){for(;Nt(l);)l=e.input.charCodeAt(++e.position);if(l===35){do l=e.input.charCodeAt(++e.position);while(l!==0&&!Xe(l));break}if(Xe(l))break;for(n=e.position;l!==0&&!Te(l);)l=e.input.charCodeAt(++e.position);o.push(e.input.slice(n,e.position))}l!==0&&co(e),At.call(pr,i)?pr[i](e,i,o):Wn(e,'unknown document directive "'+i+'"')}if(ce(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,ce(e,!0,-1)):r&&F(e,"directives end mark is expected"),en(e,e.lineIndent-1,qn,!1,!0),ce(e,!0,-1),e.checkLineBreaks&&op.test(e.input.slice(t,e.position))&&Wn(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&li(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,ce(e,!0,-1));return}if(e.position<e.length-1)F(e,"end of the stream or a document separator is expected");else return}function xp(e,t){e=String(e),t=t||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var n=new up(e,t),i=e.indexOf("\0");for(i!==-1&&(n.position=i,F(n,"null byte is not allowed in input")),n.input+="\0";n.input.charCodeAt(n.position)===32;)n.lineIndent+=1,n.position+=1;for(;n.position<n.length-1;)bp(n);return n.documents}function _p(e,t){var n=xp(e,t);if(n.length!==0){if(n.length===1)return n[0];throw new ot("expected a single document in the stream, but found more")}}var Ap=_p,Cp={load:Ap},Ep=Cp.load;const Sp=`- taxonomy: web3
  icon: far fa-star
  list:
    - term: News
      links:
        - title: 经济指标
          logo: tradingeconomics.svg
          url: https://zh.tradingeconomics.com/calendar
          description: 查看196个国家的超过2000万个经济指标。获取免费指标、历史数据、图表、新闻和预测。
        - title: 律动
          logo: www.theblockbeats.info.png
          url: https://www.theblockbeats.info/newsflash
          description: BlockBeats 是一家专业的Crypto、Web3及NFT研究机构及资讯平台，网站内容涵盖海外区块链新闻以及国内行业信息
        - title: 深潮TechFlow
          logo: www.techflowpost.com.png
          url: https://www.techflowpost.com/
          description: 全球资产价值发现平台，洞察 Web3、AI、黄金、美股与宏观趋势 - 科技财经媒体 - 财经新闻资讯 - 投资趋势 - 深潮TechFlow
        - title: Hacker News
          logo: y18.svg
          url: https://news.ycombinator.com/
          description: 骇客新闻
        - title: 金十数据
          logo: www.jin10.com.png
          url: https://www.jin10.com/
          description: 金十网,全球财经资讯,图形化数据解读,闪电资讯 决策先人一步.金十数据为您第一时间发布数据,计算机自动为您解读,数据影响一目了然.非农,失业率看金十网最快!
        - title: 币安研究院
          logo: accounts.binance.me.png
          url: https://research.binance.com/
          description: 各币种详细介绍及twitter
        - title: chainfeeds
          logo: www.chainfeeds.xyz.png
          url: https://www.chainfeeds.xyz/
          description: 加密行业内容精选解读平台
        - title: foresight
          logo: www.foresightnews.pro.png
          url: https://foresightnews.pro/
          description: FN精选 - Foresight News
        - title: marsbit
          logo: www.marsbit.co.png
          url: https://www.marsbit.co/
          description: MarsBit是领先的区块链产业信息服务平台，由资深区块链团队倾力打造，为区块链爱好者提供全球最新的区块链新闻资讯
        - title: dayu.xyz
          logo: www.bookstack.cn.png
          url: https://btcdayu.gitbook.io/dayu/
          description: 币圈dayu导航
        - title: 今日热榜
          logo: www.tophub.today.png
          url: https://tophub.today/
          description: 今日热榜提供各站热榜聚合：微信、今日头条、百度、知乎、V2EX、微博、贴吧、豆瓣、天涯、虎扑、Github、抖音...追踪全网热点、简单高效阅读。
    - term: Crypto Platform
      links:
        - title: hyperliquid
          logo: hyperliquid.gif
          url: https://app.hyperliquid.xyz/
          description: hyperliquid
        - title: coinmarketcap
          logo: coinmarketcap.com.png
          url: https://coinmarketcap.com/zh/
          description: 行情查看软件1
        - title: cmc100
          logo: coinmarketcap.com.png
          url: https://coinmarketcap.com/charts/cmc100/
          description: crypto 100 ETF
        - title: coinglass
          logo: www.coinglass.com.png
          url: https://www.coinglass.com/zh/Grayscale
          description: coinglass 灰度信托
        - title: Hyperbot
          logo: finance.png
          url: https://hyperbot.network/trader/0x5D2F4460Ac3514AdA79f5D9838916E508Ab39Bb7
          description: AI驱动的全链 DEX永续合约入口:数据分析、巨鲸追踪、智能跟单、策略交易
        - title: BTC价格预测
          logo: finance.png
          url: https://shiyu-coder.github.io/Kronos-demo/
          description: 实时BTC/USDT概率预测
        - title: aicoin
          logo: www.aicoin.com.png
          url: https://www.aicoin.com/
          description: 行情查看软件3
        - title: 非小号
          logo: www.feixiaohaozh.info.png
          url: https://www.feixiaohaozh.info/
          description: 行情查看软件2
        - title: binance
          logo: accounts.binance.me.png
          url: https://accounts.binance.me/zh-CN/register?ref=17537672
        # - title: gains network
        #   logo: gains.trade.png
        #   url: https://gains.trade/trading#TSLA-USD
        #   description: 链上交易美股（未验证，自行查阅资料再购买）
        - title: msx
          logo: msx.png
          url: https://msx.com/
          description: 链上交易美股（勿交易，仅用来查看）
        - title: okx
          logo: okx.com.png
          # url: https://www.okx.com/zh-CN/register?invite_code=7yjxq
          url: https://www.okx.com/
        - title: liberty-cats
          logo: libertyCats.png
          url: https://www.libertycatsnfts.com/
          description: liberty-cats
        - title: uniswap
          logo: app.uniswap.org.png
          url: https://app.uniswap.org/#/swap
        - title: opensea.io
          logo: www.opensea.io.png
          url: https://opensea.io/zh-CN
          description: nft平台1
        - title: blur.io
          logo: blur.io.png
          url: https://blur.io/
          description: nft平台2
        - title: sound
          logo: www.sound.xyz.png
          url: https://www.sound.xyz/
          description: 音乐nft平台
    - term: Stock
      links:
        - title: reddit stock
          logo: www.reddit.com.png
          url: https://www.reddit.com/user/maximum_fall5766/m/aaa/
          description: 投资交流社区
        - title: 美投讲美股
          logo: MeiTouJun.png
          url: https://www.youtube.com/@MeiTouJun
          description: 油管美股博主
        - title: go-stock
          logo: finance.png
          url: https://github.com/ArvinLovegood/go-stock
          description: A股各种工具集合
        - title: Yahoo Finance
          logo: finance.png
          url: https://finance.yahoo.com/
          description: 雅虎财经-股市直播、行情、商业与金融新闻
        - title: Google Finance
          logo: finance.png
          url: https://www.google.com/finance/
          description: Google 财经提供实时的市场报价、国际证券交易信息、最新的财经新闻和数据分析，可助您做出更为明智的交易与投资决定。
        - title: Seekingalpha
          logo: finance.png
          url: https://seekingalpha.com/symbol/ONDS
          description: 股市分析和投资者工具
        - title: finviz
          logo: finance.png
          url: https://finviz.com/
          description: 股票筛选器、图表、市场地图和新闻
        - title: businessinsider
          logo: finance.png
          url: https://www.businessinsider.com/
          description: 商业内幕 - 科技、市场、经济和创新的最新消息
        - title: 富途牛牛PC端[SG]
          logo: finance.png
          url: https://www.moomoo.com/sg/hans/download
          description: 看盘软件下载【老虎证券也可以】
        - title: 富途牛牛PC端[HK]
          logo: finance.png
          url: https://apps.microsoft.com/detail/xp99ng92k0k91l?hl=zh-cn&gl=CN
          description: 富途牛牛-股票、基金、债券、期货、期权、保险、ETF、CFD、指数
    - term: AI
      links:
        - title: AI小助手
          logo: finance.png
          url: https://www.higlo.cn
        - title: Ai skills
          logo: https://open-gpt.app/favicon.png
          url: https://skillsmp.com/zh
          description: 扩展AI能力的一套指令、脚本和资源集合【superpowers，】
        - title: AI导航
          logo: https://aigc.cn/wp-content/uploads/2023/02/cropped-512512-192x192.png
          url: https://aigc.cn/
        - title: gpt中文提示词
          logo: https://datafit.ai/v1/images/logo-datafit.png
          url: https://qddmercny4.feishu.cn/sheets/shtcnMklYu0WsXEDUXXanrSEB2m
        - title: ChatGPT 提示词
          logo: https://datafit.ai/v1/images/logo-datafit.png
          url: https://datafit.ai/
        - title: showgpt.co
          logo: https://datafit.ai/v1/images/logo-datafit.png
          url: https://showgpt.co/
        - title: gpt提示2
          logo: https://datafit.ai/v1/images/logo-datafit.png
          url: https://github.com/AdamBear/chat-gpt-prompts-from-aiprm-zh/blob/main/all_titles.txt
    - term: ETH
      links:
        - title: ETH官网
          logo: www.ethereum.org.png
          url: https://ethereum.org
        - title: ETH通缩
          logo: www.ultrasound.money.png
          description: V2通缩量
          url: https://ultrasound.money/
        - title: ETH质押
          logo: www.ethereum.org.png
          url: https://ethereum.org/zh/staking/
          description: 质押总量
        - title: oklink区块链浏览器
          logo: okx.com.png
          url: https://www.oklink.com/
          description: 全球领先的 Web3 数据分析平台（交易查询）
        - title: defillama
          logo: defillama.com.png
          url: https://defillama.com/
          description: DeFi（去中心化金融）TVL 聚合器
        - title: MAGIC
          logo: www.treasure.lol.png
          url: https://link3.to/treasuredao
          description: 号称web3的任天堂
        - title: 币安提现到MetaMask
          logo: accounts.binance.me.png
          url: https://academy.binance.com/zh/articles/connecting-metamask-to-binance-smart-chain?utm_campaign=web_share_link
          description: 在币安智能链中关联MetaMask钱包
        - title: 提现到MetaMask后操作
          logo: accounts.binance.me.png
          url: https://academy.bitechan.red/zh/articles/how-to-recover-crypto-transferred-to-the-wrong-network-on-binance
          description: 如何在币安上找回转账到错误网络的数字货币
    # - term: GameFi
    #   links:
    #     - title: MAGIC
    #       logo: www.treasure.lol.png
    #       url: https://link3.to/treasuredao
    #       description: 号称web3的任天堂
    - term: Social Contact
      links:
        - title: lens
          logo: www.lens.xyz.png
          url: https://www.lens.xyz/
        - title: skiff
          logo: www.skiff.com.png
          description: 邮件
          url: https://skiff.com/
        - title: ens
          logo: ens.domains.png
          url: https://ens.domains/cn/
          description: 域名

- taxonomy: Tool
  icon: fas fa-film fa-lg
  list:
    - term: FE
      links:
        - title: json
          logo: www.json.cn.png
          url: https://www.json.cn/
        - title: 图片压缩
          logo: www.tinify.cn.png
          url: https://tinify.cn/
          description: tinify.cn
        - title: FE Team
          logo: www.alloyteam.com.png
          url: http://www.alloyteam.com/nav/
        - title: 在线工具
          logo: www.tool.lu.png
          url: https://tool.lu/
        - title: 编程导航
          logo: www.code-nav.cn.png
          url: https://www.code-nav.cn/
        - title: 身份证号大全
          logo: list.chineseidcard.com.png
          url: http://list.chineseidcard.com/
        - title: 命名格式
          logo: codelf.png
          url: https://unbug.github.io/codelf/
          description: 程序员代码变量等命名
        - title: 书栈网
          logo: www.bookstack.cn.png
          url: https://www.bookstack.cn/
          description: 程序员书籍教程

    - term: Video & Audio
      links:
        - title: cutcut.top
          logo: https://cutcut.top/icon-48.png
          url: https://cutcut.top/
          description: 精准下载与剪辑全网视频，无需安装任何软件。
        - title: Ai Draw
          logo: www.midjourney.com.png
          url: https://www.midjourney.com/
          description: 作品参考：https://www.midjourney.com/showcase/top/
        - title: Movie
          logo: www.btnull.org.png
          url: https://www.yfsp.tv/
          description: 最新的电影电视剧
        - title: 一帧秒创
          logo: aigc.yizhentv.com.png
          url: https://aigc.yizhentv.com/
    - term: Other
      links:
        # - title: 梯子
        #   logo: www.sctocloud.com.png
        #   # url: https://www.sctocloud.com/auth/register?code=QkR1
        #   url: https://www.scto05.xyz/auth/register?code=QkR1
        #   description: 自由
        - title: 国外AppleId
          logo: www.shenfendaquan.com.png
          url: https://www.shenfendaquan.com/
          description: 自定义生成美国身份
        - title: 免费下载音效
          logo: freesoundcn.html.png
          url: https://taira-komori.jpn.org/freesoundcn.html
        - title: 获取网站图标
          logo: api.iowen.cn.png
          url: https://api.iowen.cn/favicon/www.baidu.com.png
          description: 替换链接中的www.baidu.com
        - title: 极光预测
          logo: www.auroraforecast.is.png
          url: http://auroraforecast.is/
# - taxonomy: 悠闲娱乐
#   icon: fas fa-film fa-lg
#   list:
#     - term: 影音视频
#       links:
#         - title: 腾讯视频
#           logo: 腾讯视频.png
#           url: http://v.qq.com/
#           description: 腾讯视频，海量视频在线观看。
#         - title: 优酷
#           logo: 优酷.png
#           url: http://www.youku.com/
#           description: 优酷 - 这个世界很酷。
#         - title: 爱奇艺
#           logo: 爱奇艺.png
#           url: https://www.iqiyi.com/
#           description: 爱奇艺在线视频。
#         - title: 哔哩哔哩
#           logo: 哔哩哔哩.png
#           url: https://www.bilibili.com/
#           description: Bilibili 视频弹幕网站。
#         - title: QQ 音乐
#           logo: QQ音乐.jpg
#           url: https://y.qq.com/
#           description: QQ 音乐，在线听歌。
#         - title: 网易云音乐
#           logo: 网易云音乐.jpg
#           url: https://music.163.com/
#           description: 163 网易云音乐。
#         - title: 电影天堂（DYTT8）
#           logo: 电影天堂.png
#           url: https://www.dytt8.net/index.htm
#           description: 电影天堂（DYTT8），高清电影下载。
#         - title: 电影天堂（DYGOD）
#           logo: 电影天堂.png
#           url: https://www.dygod.net/
#           description: 电影天堂（DYGOD），高清电影下载。
#     - term: 游戏竞技
#       links:
#         - title: 百度贴吧
#           logo: 百度贴吧.jpg
#           url: ttps://tieba.baidu.com/index.html
#           description: 百度贴吧。
#         - title: 台服战地
#           logo: 战地之王.png
#           url: https://ava.mangot5.com/ava/index
#           description: 台服 AVA 战地之王。

# - taxonomy: 素材资源
#   icon: far fa-folder-open fa-lg
#   list:
#     - term: 网盘资源
#       links:
#         - title: 百度网盘
#           logo: 百度网盘.jpg
#           url: http://pan.baidu.com/
#           description: https://pan.baidu.com/.
#         - title: 阿里云盘
#           logo: 阿里云盘.png
#           url: https://www.aliyundrive.com/
#           description: 阿里云盘，你的数字世界。
#         - title: 天翼云盘
#           logo: 天翼云盘.jpg
#           url: https://cloud.189.cn/
#           description: 家庭云|网盘|文件备份|资源分享。
#         - title: 坚果云
#           logo: 坚果云.png
#           usrl: https://www.jianguoyun.com/
#           description: 坚果云官网。
#     - term: 图标素材
#       links:
#         - title: Iconfinder
#           logo: Iconfinder.png
#           url: https://www.iconfinder.com
#           description: 2,100,000+ free and premium vector icons.
#         - title: iconfont
#           logo: iconfont.png
#           url: http://www.iconfont.cn/
#           description: 阿里巴巴矢量图标库。
#         - title: iconmonstr
#           logo: iconmonstr.png
#           url: https://iconmonstr.com/
#           description: Free simple icons for your next project.
#         - title: Icon Archive
#           logo: iconarchive.png
#           url: http://www.iconarchive.com/
#           description: Search 590,912 free icons.
#         - title: FindIcons
#           logo: FindIcons.png
#           url: https://findicons.com/
#           description: Search through 300,000 free icons.
#         - title: IcoMoonApp
#           logo: IcoMoonApp.png
#           url: https://icomoon.io/app/
#           description: Icon Font, SVG, PDF &amp; PNG Generator.
#         - title: easyicon
#           logo: easyicon.png
#           url: http://www.easyicon.net/
#           description: PNG、ICO、ICNS格式图标搜索、图标下载服务。
#         - title: flaticon
#           logo: flaticon.png
#           url: https://www.flaticon.com/
#           description: 634,000+ Free vector icons in SVG, PSD, PNG, EPS format or as ICON FONT.
#         - title: UICloud
#           logo: UICloud.png
#           url: http://ui-cloud.com/
#           description: The largest user interface design database in the world.
#         - title: Material icons
#           logo: Materialicons.png
#           url: https://material.io/icons/
#           description: Access over 900 material system icons, available in a variety of sizes and densities, and as a web font.
#         - title: Font Awesome Icon
#           logo: fontawesomeicon.png
#           url: https://fontawesome.com/icons/
#           description: The complete set of 675 icons in Font Awesome.
#         - title: ion icons
#           logo: ionicons.png
#           url: http://ionicons.com/
#           description: The premium icon font for Ionic Framework.
#         - title: Simpleline Icons
#           logo: simplelineicons.png
#           url: http://simplelineicons.com/
#           description: Simple line Icons pack.
#     - term: 图标设计
#       links:
#         - title: Iconsfeed
#           logo: iconsfeed.png
#           url: http://www.iconsfeed.com/
#           description: iOS icons gallery.
#         - title: iOS Icon Gallery
#           logo: iosicongallery.png
#           url: http://iosicongallery.com/
#           description: Showcasing beautiful icon designs from the iOS App Store.
#         - title: World Vector Logo
#           logo: worldvectorlogo.png
#           url: https://worldvectorlogo.com/
#           description: Brand logos free to download.
#         - title: Instant Logo Search
#           logo: InstantLogoSearch.png
#           url: http://instantlogosearch.com/
#           description: Search & download thousands of logos instantly.
#     - term: 平面素材
#       links:
#         - title: freepik
#           logo: freepik.png
#           url: https://www.freepik.com/
#           description: More than a million free vectors, PSD, photos and free icons.
#         - title: wallhalla
#           logo: wallhalla.png
#           url: https://wallhalla.com/
#           description: Find awesome high quality wallpapers for desktop and mobile in one place.
#         - title: 365PSD
#           logo: 365PSD.png
#           url: https://365psd.com/
#           description: Free PSD &amp; Graphics, Illustrations.
#         - title: Medialoot
#           logo: Medialoot.png
#           url: https://medialoot.com/
#           description: Free &amp; Premium Design Resources &mdash; Medialoot.
#         - title: 千图网
#           logo: qiantu.png
#           url: http://www.58pic.com/
#           description: 专注免费设计素材下载的网站.
#         - title: 千库网
#           logo: qianku.png
#           url: http://588ku.com/
#           description: 免费 png 图片背景素材下载。
#         - title: 我图网
#           logo: wotu.png
#           url: http://www.ooopic.com/
#           description: 我图网，提供图片素材及模板下载，专注正版设计作品交易。
#         - title: 90 设计
#           logo: 90sheji.png
#           url: http://90sheji.com/
#           description: 电商设计（淘宝美工）千图免费淘宝素材库。
#         - title: 昵图网
#           logo: nipic.png
#           url: http://www.nipic.com/
#           description: 原创素材共享平台。
#         - title: 懒人图库
#           logo: lanrentuku.png
#           url: http://www.lanrentuku.com/
#           description: 懒人图库专注于提供网页素材下载。
#         - title: 素材搜索
#           logo: sousucai.png
#           url: http://so.ui001.com/
#           description: 设计素材搜索聚合。
#         - title: PS 饭团网
#           logo: psefan.png
#           url: http://psefan.com/
#           description: 不一样的设计素材库！让自己的设计与众不同！
#         - title: 素材中国
#           logo: sccnn.png
#           url: http://www.sccnn.com/
#           description: 免费素材共享平台。
#     - term: 字体资源
#       links:
#         - title: Google Font
#           url: https://fonts.google.com/
#           logo: googlefont.png
#           description: Making the web more beautiful, fast, and open through great typography.
#         - title: Typekit
#           url: https://typekit.com/
#           logo: typekit.png
#           description: Quality fonts from the world’s best foundries.
#         - title: 方正字库
#           url: http://www.foundertype.com/
#           logo: Fondertype.png
#           description: 方正字库官方网站。
#         - title: 字体传奇网
#           url: http://ziticq.com/
#           logo: ziticq.png
#           description: 中国首个字体品牌设计师交流网。
#         - title: 私藏字体
#           url: http://sicangziti.com/
#           logo: sicangziti.png
#           description: 优质字体免费下载站。
#         - title: Fontsquirrel
#           url: https://www.fontsquirrel.com/
#           logo: fontsquirrel.png
#           description: FREE fonts for graphic designers.
#         - title: Urban Fonts
#           url: https://www.urbanfonts.com/
#           logo: UrbanFonts.png
#           description: Download Free Fonts and Free Dingbats.
#         - title: Lost Type
#           url: http://www.losttype.com/
#           logo: losttype.png
#           description: Lost Type is a Collaborative Digital Type Foundry.
#         - title: FONTS2U
#           url: https://fonts2u.com/
#           logo: fonts2u.png
#           description: Download free fonts for Windows and Macintosh.
#         - title: Fontex
#           url: http://www.fontex.org/
#           logo: fontex.png
#           description: Free Fonts to Download + Premium Typefaces.
#         - title: FontM
#           url: http://fontm.com/
#           logo: FontM.png
#           description: Free Fonts
#         - title: My Fonts
#           url: http://www.myfonts.com/
#           logo: MyFonts.png
#           description: Fonts for Print, Products & Screens.
#         - title: Da Font
#           url: https://www.dafont.com/
#           logo: dafont.png
#           description: Archive of freely downloadable fonts.
#         - title: OnlineWebFonts
#           url: https://www.onlinewebfonts.com/
#           logo: OnlineWebFonts.png
#           description: WEB Free Fonts for Windows and Mac / Font free Download.
#         - title: Abstract Fonts
#           url: http://www.abstractfonts.com/
#           logo: abstractfonts.png
#           description: Abstract Fonts (13,866 free fonts).
#     - term: PPT资源
#       links:
#         - title: OfficePLUS
#           url: http://www.officeplus.cn/Template/Home.shtml
#           logo: officeplus.png
#           description: OfficePLUS，微软Office官方在线模板网站！
#         - title: 优品PPT
#           url: http://www.ypppt.com/
#           logo: ypppt.png
#           description: 高质量的模版，而且还有PPT图表，PPT背景图等资源。
#         - title: PPT+
#           url: http://www.pptplus.cn/
#           logo: pptplus.png
#           description: PPT加直播、录制和分享—PPT+语音内容分享平台。
#         - title: PPTMind
#           url: http://www.pptmind.com/
#           logo: pptmind.png
#           description: 分享高端 ppt 模板与 keynote 模板的数字作品交易平台。
#         - title: tretars
#           url: http://www.tretars.com/ppt-templates
#           logo: tretars.png
#           description: The best free Mockups from the Web.
#         - title: 5百丁
#           url: http://ppt.500d.me/
#           logo: 500d.png
#           description: 中国领先的PPT模板共享平台。

# - taxonomy: 开发设计
#   icon: fas fa-tools fa-lg
#   list:
#     - term: 图形创意
#       links:
#         - title: photoshop
#           url: https://www.adobe.com/cn/products/photoshop.html
#           logo: photoshop.png
#           description: Photoshop不需要解释
#         - title: Affinity Designer
#           url: https://affinity.serif.com/
#           logo: AffinityDesigner.png
#           description: 专业创意软件
#         - title: Illustrator
#           url: https://www.adobe.com/cn/products/illustrator/
#           logo: Illustrator.png
#           description: 矢量图形和插图。
#         - title: indesign
#           url: http://www.adobe.com/cn/products/indesign.html
#           logo: INDESIGN .png
#           description: 页面设计、布局和出版。
#         - title: cinema-4d
#           url: https://www.maxon.net/en/products/cinema-4d/overview/
#           logo: cinema4d.png
#           description: Cinema 4D is the perfect package for all 3D artists who want to achieve breathtaking results fast and hassle-free.
#         - title: 3ds-max
#           url: https://www.autodesk.com/products/3ds-max/overview
#           logo: 3dsmax.png
#           description: 3D modeling, animation, and rendering software
#         - title: Blender
#           url: https://www.blender.org/
#           logo: blender.png
#           description: Blender is the free and open source 3D creation suite.
#     - term: 界面设计
#       links:
#         - title: Sketch
#           url: https://sketchapp.com/
#           logo: sketchapp.png
#           description: The digital design toolkit
#         - title: Adobe XD
#           url: http://www.adobe.com/products/xd.html
#           logo: ADOBEXDCC.png
#           description: Introducing Adobe XD. Design. Prototype. Experience.
#         - title: invisionapp
#           url: https://www.invisionapp.com/
#           logo: invisionapp.png
#           description: Powerful design prototyping tools
#         - title: marvelapp
#           url: https://marvelapp.com/
#           logo: marvelapp.png
#           description: Simple design, prototyping and collaboration
#         - title: Muse CC
#           url: https://creative.adobe.com/zh-cn/products/download/muse
#           logo: MuseCC.png
#           description: 无需利用编码即可进行网站设计。
#         - title: figma
#           url: https://www.figma.com/
#           logo: figma.png
#           description: Design, prototype, and gather feedback all in one place with Figma.
#     - term: 在线配色
#       links:
#         - title: khroma
#           url: http://khroma.co/generator/
#           logo: khroma.png
#           description: Khroma is the fastest way to discover, search, and save color combos you'll want to use.
#         - title: uigradients
#           url: https://uigradients.com
#           logo: uigradients.png
#           description: Beautiful colored gradients.
#         - title: gradients
#           url: http://gradients.io/
#           logo: gradients.png
#           description: Curated gradients for designers and developers.
#         - title: Coolest
#           url: https://webkul.github.io/coolhue/
#           logo: Coolest.png
#           description: Coolest handpicked Gradient Hues for your next super ⚡ amazing stuff.
#         - title: webgradients
#           url: https://webgradients.com/
#           logo: webgradients.png
#           description: WebGradients is a free collection of 180 linear gradients that you can use as content backdrops in any part of your website.
#         - title: grabient
#           url: https://www.grabient.com/
#           logo: grabient.png
#           description: 2017 Grabient by unfold.
#         - title: thedayscolor
#           url: http://www.thedayscolor.com/
#           logo: thedayscolor.png
#           description: The daily color digest
#         - title: flatuicolors
#           url: http://flatuicolors.com/
#           logo: flatuicolors.png
#           description: Copy Paste Color Pallette from Flat UI Theme.
#         - title: coolors
#           url: https://coolors.co/
#           logo: coolors.png
#           description: The super fast color schemes generator!
#         - title: colorhunt
#           url: http://www.colorhunt.co/
#           logo: colorhunt.png
#           description: Beautiful Color Palettes.
#         - title: Adobe Color CC
#           url: https://color.adobe.com/zh/create/color-wheel
#           logo: AdobeColorCC.png
#           description: Create color schemes with the color wheel or browse thousands of color combinations from the Color community.
#         - title: flatuicolorpicker
#           url: http://www.flatuicolorpicker.com/
#           logo: flatuicolorpicker.png
#           description: Best Flat Colors For UI Design.
#         - title: trianglify
#           url: http://qrohlf.com/trianglify-generator/
#           logo: trianglify.png
#           description: Trianglify Generator.
#         - title: klart
#           url: https://klart.co/colors/
#           logo: klart.png
#           description: Beautiful colors and designs to your inbox every week.
#         - title: vanschneider
#           url: http://www.vanschneider.com/colors
#           logo: vanschneider.png
#           description: Color Claim was created in 2012 by Tobias van Schneider with the goal to collect & combine unique colors for my future projects.
#     - term: 在线工具
#       links:
#         - title: tinypng
#           url: https://tinypng.com/
#           logo: tinypng.png
#           description: Optimize your images with a perfect balance in quality and file size.
#         - title: goqr
#           url: http://goqr.me/
#           logo: goqr.png
#           description: create QR codes for free (Logo, T-Shirt, vCard, EPS).
#         - title: ezgif
#           url: https://ezgif.com
#           logo: ezgif.png
#           description: simple online GIF maker and toolset for basic animated GIF editing.
#         - title: Android 9 patch
#           url: http://inloop.github.io/shadow4android/
#           logo: Android9patch.png
#           description: Android 9-patch shadow generator fully customizable shadows.
#         - title: screen sizes
#           url: http://screensiz.es/
#           logo: screensizes.png
#           description: Viewport Sizes and Pixel Densities for Popular Devices.
#         - title: svgomg
#           url: https://jakearchibald.github.io/svgomg/
#           logo: svgomg.png
#           description: SVG 在线压缩平台。
#         - title: 稿定抠图
#           url: https://www.gaoding.com
#           logo: gaoding.png
#           description: 免费在线抠图软件,图片快速换背景-抠白底图。

#     - term: 谷歌插件
#       links:
#         - title: wappalyzer
#           url: https://www.wappalyzer.com/
#           logo: wappalyzer.png
#           description: Identify technology on websites.
#         - title: Panda
#           url: http://usepanda.com/
#           logo: usepanda.png
#           description: A smart news reader built for productivity.
#         - title: sizzy
#           url: https://sizzy.co/
#           logo: sizzy.png
#           description: A tool for developing responsive websites crazy-fast.
#         - title: csspeeper
#           url: https://csspeeper.com/
#           logo: csspeeper.png
#           description: Smart CSS viewer tailored for Designers.
#         - title: insight
#           url: http://insight.io/
#           logo: insight.png
#           description: IDE-like code search and navigation, on the cloud.
#         - title: mustsee
#           url: http://mustsee.earth/
#           logo: mustsee.png
#           description: Discover the world's most beautiful places at every opened tab.

# - taxonomy: 资讯学习
#   icon: fas fa-pencil-alt fa-lg
#   list:
#     - term: 资讯书籍
#       links:
#         - title: 微信读书
#           url: https://weread.qq.com/
#           logo: 微信读书.jpg
#           description: 微信读书电脑版。
#         - title: 书栈网
#           url: https://www.bookstack.cn/
#           logo: 书栈网.jpg
#           description: IT 互联网开源编程书籍免费阅读与下载。
#     - term: 博客论坛
#       links:
#         - title: Inoreader
#           url: https://www.inoreader.com/
#           logo: inoreader.jpg
#           description: 重新掌控你的新闻订阅源。
#         - title: Hacker News
#           url: https://news.ycombinator.com/
#           logo: hacker-news.jpg
#           description: 一家关于计算机黑客和创业公司的社会化新闻网站。
#         - title: 经管之家
#           url: https://bbs.pinggu.org/
#           logo: 经管之家.jpg
#           description: 国内活跃的经济、管理、金融、统计在线教育和咨询网站。
#         - title: 阮一峰的网络日志
#           url: http://www.ruanyifeng.com/blog/
#           logo: 阮一峰.png
#           description: 阮一峰，科技爱好者周刊。
#         - title: 酷壳
#           url: https://www.coolshell.cn/
#           logo: ''
#           description: 酷 壳 – CoolShell。
#     - term: 设计规范
#       links:
#         - title: Design Guidelines
#           url: http://designguidelines.co/
#           logo: designguidelines.png
#           description: Design Guidelines &mdash; The way products are built.
#         - title: Awesome design systems
#           url: https://github.com/alexpate/awesome-design-systems
#           logo: awesome_design_systems.png
#           description:  A collection of awesome design systems.
#         - title: Material Design
#           url: https://material.io/guidelines/
#           logo: Material_Design.png
#           description: Introduction - Material Design.
#         - title: Human Interface Guidelines
#           url: https://developer.apple.com/ios/human-interface-guidelines
#           logo: human_interface_guidelines.png
#           description: Human Interface Guidelines iOS.
#         - title: Photoshop Etiquette
#           url: http://viggoz.com/photoshopetiquette/
#           logo: photoshopetiquette.png
#           description: PS礼仪-WEB设计指南。
#     - term: 视频教程
#       links:
#         - title: Photoshop Lady
#           url: http://www.photoshoplady.com/
#           logo: PhotoshopLady.png
#           description: Your Favourite Photoshop Tutorials in One Place.
#         - title: doyoudo
#           url: http://doyoudo.com/
#           logo: doyoudo.png
#           description: 创意设计软件学习平台。
#         - title: 没位道
#           url: http://www.c945.com/web-ui-tutorial/
#           logo: web_ui_tutorial.png
#           description: WEB UI免费视频公开课。
#         - title: 慕课网
#           url: https://www.imooc.com/
#           logo: imooc.png
#           description: 程序员的梦工厂（有UI课程）。
`,Ip=Ep(Sp),Tp={class:"navigation-container"},Op={class:"pixel-icon"},Mp={class:"links-grid"},Rp=["href"],Pp={class:"link-logo"},kp=["src","alt"],Np={class:"link-info"},Fp=tn({__name:"Navigation",setup(e){const t=r=>{const l=r.target;l.src="/assets/images/logos/default.webp"},n=r=>{const l={"bi-globe":"🌐","bi-code-slash":"⌨️","bi-palette":"🎨","bi-graph-up":"📈","bi-book":"📚","bi-tools":"🔧","bi-music-note":"🎵","bi-camera":"📷","bi-controller":"🎮","bi-heart":"❤️","bi-star":"⭐","bi-lightning":"⚡","bi-cloud":"☁️","bi-shield":"🛡️","bi-rocket":"🚀"},s=r.toLowerCase();for(const[c,f]of Object.entries(l))if(s.includes(c.toLowerCase())||s.includes(c.replace("bi-","")))return f;return"⭐"},i=r=>/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(r),o=r=>i(r)?/[a-zA-Z]/.test(r)?"mixed-pixel chinese-pixel":"chinese-pixel mixed-pixel":"";return(r,l)=>(re(),se("div",Tp,[(re(!0),se(ne,null,Se(bt(Ip),s=>(re(),se("div",{key:s.taxonomy,class:"taxonomy-section"},[j("h2",{class:Mt(["taxonomy-title",o(s.taxonomy)])},[j("span",Op,Ht(n(s.icon)),1),Un(" "+Ht(s.taxonomy),1)],2),(re(!0),se(ne,null,Se(s.list,c=>(re(),se("div",{key:c.term,class:"term-section"},[j("h3",{class:Mt(["term-title",o(c.term)])},Ht(c.term),3),j("div",Mp,[(re(!0),se(ne,null,Se(c.links,f=>(re(),se("div",{key:f.title,class:"link-card"},[j("a",{href:f.url,target:"_blank",rel:"noopener noreferrer",class:"link-content"},[j("div",Pp,[j("img",{src:`/assets/images/logos/${f.logo}`,alt:f.title,onError:t},null,40,kp)]),j("div",Np,[j("h4",{class:Mt(["link-title",o(f.title)])},Ht(f.title),3),f.description?(re(),se("p",{key:0,class:Mt(["link-description",o(f.description)])},Ht(f.description),3)):kc("",!0)])],8,Rp)]))),128))])]))),128))]))),128))]))}}),Dp=ri(Fp,[["__scopeId","data-v-584b4391"]]),Lp={class:"cyberpunk-bg"},jp={class:"neon-matrix"},Bp={class:"binary-waterfall"},$p={class:"neon-particles"},Hp={class:"data-streams"},Up={class:"lightning-layer"},Gp={class:"pixel-stars"},Vp={class:"floating-geometry"},qp={class:"audio-visualizer"},Wp={class:"circuit-board"},zp={class:"data-blocks"},Kp={class:"pulse-network"},Yp={class:"cyber-container"},Qp={class:"neon-frame"},Xp=tn({__name:"HomeView",setup(e){const t=Nn(null),n=Nn(null),i=w=>{const E='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()+=[]{}|\\;:"<>,.?/~',x=20+Math.floor(Math.random()*30);let G="";for(let ie=0;ie<x;ie++)G+=E[Math.floor(Math.random()*E.length)];return{left:`${(w-1)*(100/25)}%`,animationDelay:`${Math.random()*12}s`,animationDuration:`${8+Math.random()*20}s`,"--neon-text":`"${G}"`,"--neon-length":x,"--neon-color":s()}},o=w=>{const x=25+Math.floor(Math.random()*40);let G="";for(let ie=0;ie<x;ie++)G+="01"[Math.floor(Math.random()*2)];return{left:`${(w-1)*(100/20)}%`,animationDelay:`${Math.random()*15}s`,animationDuration:`${10+Math.random()*25}s`,"--binary-text":`"${G}"`,"--binary-length":x}},r=()=>{const w=["#ff00ff","#00ffff","#ffff00","#ff00aa","#00ff00","#ff6600"],E=w[Math.floor(Math.random()*w.length)],x=Math.random()*4+1;return{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:`${x}px`,height:`${x}px`,backgroundColor:E,boxShadow:`0 0 ${x*2}px ${E}`,animationDelay:`${Math.random()*10}s`,animationDuration:`${5+Math.random()*15}s`}},l=()=>{const w=["#ffffff","#ffaa00","#00aaff","#ff00aa","#00ffaa"],E=w[Math.floor(Math.random()*w.length)];return{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:`${1+Math.random()*2}px`,height:`${1+Math.random()*2}px`,backgroundColor:E,boxShadow:`0 0 ${Math.random()*6}px ${E}`,animationDelay:`${Math.random()*20}s`,animationDuration:`${2+Math.random()*8}s`,opacity:Math.random()*.9+.1}},s=()=>{const w=["#ff00ff","#00ffff","#ffff00","#ff00aa","#00ff00","#ff6600","#00ff88","#ff3366","#9966ff"];return w[Math.floor(Math.random()*w.length)]},c=w=>{const E=["#00ffff","#ff00ff","#ffff00","#00ff00","#ff0088"],x=E[Math.floor(Math.random()*E.length)];return{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:`${20+Math.random()*40}px`,height:"2px",backgroundColor:x,animationDelay:`${Math.random()*8}s`,animationDuration:`${3+Math.random()*7}s`,transform:`rotate(${Math.random()*360}deg)`}},f=()=>{const w=["triangle","square","hexagon"],E=w[Math.floor(Math.random()*w.length)],x=["#ff00ff","#00ffff","#ffff00","#ff6600","#9933ff"],G=x[Math.floor(Math.random()*x.length)];return{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:`${10+Math.random()*20}px`,height:`${10+Math.random()*20}px`,backgroundColor:"transparent",border:`2px solid ${G}`,clipPath:E==="triangle"?"polygon(50% 0%, 0% 100%, 100% 100%)":E==="hexagon"?"polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)":"none",animationDelay:`${Math.random()*10}s`,animationDuration:`${15+Math.random()*25}s`,opacity:Math.random()*.6+.2}},a=w=>{const E=Math.random()*60+10,x=["#00ffff","#ff00ff","#ffff00","#00ff00","#ff6600"],G=x[Math.floor(Math.random()*x.length)];return{left:`${(w-1)*(100/32)}%`,bottom:"0",width:"2px",height:`${E}px`,backgroundColor:G,boxShadow:`0 0 ${E/2}px ${G}`,animationDelay:`${Math.random()*2}s`,animationDuration:`${.5+Math.random()*1.5}s`}},u=w=>{const E=["#00ff00","#ff00ff","#00ffff"],x=E[Math.floor(Math.random()*E.length)];return{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:`${10+Math.random()*50}px`,height:"1px",backgroundColor:x,opacity:Math.random()*.6+.2,animationDelay:`${Math.random()*5}s`,animationDuration:`${3+Math.random()*7}s`}},g=()=>{const w=["#00ff00","#ff00ff","#00ffff","#ffff00"],E=w[Math.floor(Math.random()*w.length)];return{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:"4px",height:"4px",backgroundColor:E,borderRadius:"50%",boxShadow:`0 0 8px ${E}`,animationDelay:`${Math.random()*8}s`,animationDuration:`${2+Math.random()*4}s`}},h=w=>{const E=["#ff00ff","#00ffff","#ffff00","#00ff00","#ff6600"],x=E[Math.floor(Math.random()*E.length)];return{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:`${20+Math.random()*30}px`,height:`${20+Math.random()*30}px`,backgroundColor:"rgba(0, 0, 0, 0.8)",border:`1px solid ${x}`,boxShadow:`0 0 10px ${x}`,animationDelay:`${Math.random()*10}s`,animationDuration:`${15+Math.random()*25}s`}},A=()=>{const w=["#00ffff","#ff00ff","#ffff00","#00ff00"],E=w[Math.floor(Math.random()*w.length)];return{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:"8px",height:"8px",backgroundColor:E,borderRadius:"50%",boxShadow:`0 0 15px ${E}`,animationDelay:`${Math.random()*12}s`,animationDuration:`${4+Math.random()*8}s`}};let S=null,k=null,R=null;return el(()=>{const w=document.querySelectorAll(".glitch-red, .glitch-green, .glitch-blue");S=setInterval(()=>{w.forEach(E=>{E.classList.add("active"),setTimeout(()=>{E.classList.remove("active")},100+Math.random()*200)})},2e3+Math.random()*3e3),k=setInterval(()=>{t.value&&(t.value.style.left=`${Math.random()*100}%`,t.value.style.opacity="1",setTimeout(()=>{t.value&&(t.value.style.opacity="0")},100+Math.random()*200))},4e3+Math.random()*6e3),R=setInterval(()=>{n.value&&(n.value.style.left=`${Math.random()*100}%`,n.value.style.top=`${Math.random()*100}%`,n.value.style.transform="scale(1)",setTimeout(()=>{n.value&&(n.value.style.transform="scale(0)")},300+Math.random()*400))},5e3+Math.random()*7e3)}),eo(()=>{S&&clearInterval(S),k&&clearInterval(k),R&&clearInterval(R)}),(w,E)=>(re(),se("div",Lp,[E[0]||(E[0]=j("div",{class:"deep-space"},[j("div",{class:"nebula-effect"}),j("div",{class:"cosmic-dust"})],-1)),j("div",jp,[(re(),se(ne,null,Se(25,x=>j("div",{key:x,class:"neon-rain",style:Ee(i(x))},null,4)),64))]),j("div",Bp,[(re(),se(ne,null,Se(20,x=>j("div",{key:x,class:"binary-stream",style:Ee(o(x))},null,4)),64))]),E[1]||(E[1]=Oo('<div class="holographic-layer" data-v-80172b76><div class="hologram-lines" data-v-80172b76></div><div class="hologram-flare" data-v-80172b76></div></div><div class="energy-grid" data-v-80172b76><div class="grid-lines-h" data-v-80172b76></div><div class="grid-lines-v" data-v-80172b76></div><div class="grid-pulse" data-v-80172b76></div><div class="energy-rings" data-v-80172b76></div></div>',2)),j("div",$p,[(re(),se(ne,null,Se(40,x=>j("div",{key:x,class:"neon-particle",style:Ee(r())},null,4)),64))]),E[2]||(E[2]=j("div",{class:"quantum-beams"},[j("div",{class:"beam beam-1"}),j("div",{class:"beam beam-2"}),j("div",{class:"beam beam-3"})],-1)),j("div",Hp,[(re(),se(ne,null,Se(8,x=>j("div",{key:x,class:"data-pipe",style:Ee(c())},null,4)),64))]),j("div",Up,[j("div",{class:"lightning-bolt",ref_key:"lightning",ref:t},null,512),j("div",{class:"plasma-burst",ref_key:"plasma",ref:n},null,512)]),E[3]||(E[3]=Oo('<div class="glitch-art" data-v-80172b76><div class="glitch-red" data-v-80172b76></div><div class="glitch-green" data-v-80172b76></div><div class="glitch-blue" data-v-80172b76></div><div class="static-noise" data-v-80172b76></div><div class="digital-glitch" data-v-80172b76></div></div><div class="crt-effect" data-v-80172b76><div class="crt-curve" data-v-80172b76></div><div class="scanlines" data-v-80172b76></div><div class="screen-flicker" data-v-80172b76></div><div class="phosphor-glow" data-v-80172b76></div></div>',2)),j("div",Gp,[(re(),se(ne,null,Se(60,x=>j("div",{key:x,class:"pixel-star",style:Ee(l())},null,4)),64))]),j("div",Vp,[(re(),se(ne,null,Se(12,x=>j("div",{key:x,class:"geo-shape",style:Ee(f())},null,4)),64))]),j("div",qp,[(re(),se(ne,null,Se(32,x=>j("div",{key:x,class:"audio-bar",style:Ee(a(x))},null,4)),64))]),j("div",Wp,[(re(),se(ne,null,Se(30,x=>j("div",{key:x,class:"circuit-line",style:Ee(u())},null,4)),64)),(re(),se(ne,null,Se(20,x=>j("div",{key:x,class:"circuit-node",style:Ee(g())},null,4)),64))]),E[4]||(E[4]=j("div",{class:"hologram-scan"},[j("div",{class:"scan-line"}),j("div",{class:"scan-line-2"})],-1)),j("div",zp,[(re(),se(ne,null,Se(25,x=>j("div",{key:x,class:"data-block",style:Ee(h())},null,4)),64))]),j("div",Kp,[(re(),se(ne,null,Se(15,x=>j("div",{key:x,class:"pulse-node",style:Ee(A())},null,4)),64))]),j("div",Yp,[j("div",Qp,[fe(Dp)])])]))}}),Jp=ri(Xp,[["__scopeId","data-v-80172b76"]]),Zp=Cu({history:iu("./"),routes:[{path:"/",name:"home",component:Jp},{path:"/about",name:"about",component:()=>Du(()=>import("./AboutView-CKt4LVBw.js"),__vite__mapDeps([0,1]),import.meta.url)}]}),uo=ha(ku);uo.use(va());uo.use(Zp);uo.mount("#app");export{ri as _,Oo as a,se as c,re as o};
//# sourceMappingURL=index-CL4vonAE.js.map
