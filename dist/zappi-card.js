function t(t,e,i,s){var r,o=arguments.length,n=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(n=(o<3?r(n):o>3?r(e,i,n):r(e,i))||n);return o>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let o=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new o(i,t,s)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:c,defineProperty:l,getOwnPropertyDescriptor:h,getOwnPropertyNames:d,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,g=globalThis,_=g.trustedTypes,m=_?_.emptyScript:"",v=g.reactiveElementPolyfillSupport,y=(t,e)=>t,f={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},b=(t,e)=>!c(t,e),$={attribute:!0,type:String,converter:f,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&l(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const o=s?.call(this);r?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...d(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),r=e.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:f).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:f;this._$Em=s;const o=r.fromAttribute(e,t.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(void 0!==t){const o=this.constructor;if(!1===s&&(r=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??b)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==r||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[y("elementProperties")]=new Map,w[y("finalized")]=new Map,v?.({ReactiveElement:w}),(g.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,k=t=>t,S=x.trustedTypes,A=S?S.createPolicy("lit-html",{createHTML:t=>t}):void 0,P="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,z="?"+E,C=`<${z}>`,M=document,O=()=>M.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,T=Array.isArray,N="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,W=/-->/g,B=/>/g,H=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,j=/"/g,F=/^(?:script|style|textarea|title)$/i,I=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),L=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),V=new WeakMap,J=M.createTreeWalker(M,129);function K(t,e){if(!T(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}const Z=(t,e)=>{const i=t.length-1,s=[];let r,o=2===e?"<svg>":3===e?"<math>":"",n=R;for(let e=0;e<i;e++){const i=t[e];let a,c,l=-1,h=0;for(;h<i.length&&(n.lastIndex=h,c=n.exec(i),null!==c);)h=n.lastIndex,n===R?"!--"===c[1]?n=W:void 0!==c[1]?n=B:void 0!==c[2]?(F.test(c[2])&&(r=RegExp("</"+c[2],"g")),n=H):void 0!==c[3]&&(n=H):n===H?">"===c[0]?(n=r??R,l=-1):void 0===c[1]?l=-2:(l=n.lastIndex-c[2].length,a=c[1],n=void 0===c[3]?H:'"'===c[3]?j:D):n===j||n===D?n=H:n===W||n===B?n=R:(n=H,r=void 0);const d=n===H&&t[e+1].startsWith("/>")?" ":"";o+=n===R?i+C:l>=0?(s.push(a),i.slice(0,l)+P+i.slice(l)+E+d):i+E+(-2===l?e:d)}return[K(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class G{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,o=0;const n=t.length-1,a=this.parts,[c,l]=Z(t,e);if(this.el=G.createElement(c,i),J.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=J.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(P)){const e=l[o++],i=s.getAttribute(t).split(E),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:n[2],strings:i,ctor:"."===n[1]?et:"?"===n[1]?it:"@"===n[1]?st:tt}),s.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:r}),s.removeAttribute(t));if(F.test(s.tagName)){const t=s.textContent.split(E),e=t.length-1;if(e>0){s.textContent=S?S.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],O()),J.nextNode(),a.push({type:2,index:++r});s.append(t[e],O())}}}else if(8===s.nodeType)if(s.data===z)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(E,t+1));)a.push({type:7,index:r}),t+=E.length-1}r++}}static createElement(t,e){const i=M.createElement("template");return i.innerHTML=t,i}}function X(t,e,i=t,s){if(e===L)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const o=U(e)?void 0:e._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(t),r._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=X(t,r._$AS(t,e.values),r,s)),e}class Y{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??M).importNode(e,!0);J.currentNode=s;let r=J.nextNode(),o=0,n=0,a=i[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new Q(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new rt(r,this,t)),this._$AV.push(e),a=i[++n]}o!==a?.index&&(r=J.nextNode(),o++)}return J.currentNode=M,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=X(this,t,e),U(t)?t===q||null==t||""===t?(this._$AH!==q&&this._$AR(),this._$AH=q):t!==this._$AH&&t!==L&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>T(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==q&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=G.createElement(K(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new Y(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=V.get(t.strings);return void 0===e&&V.set(t.strings,e=new G(t)),e}k(t){T(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new Q(this.O(O()),this.O(O()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=q,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(t,e=this,i,s){const r=this.strings;let o=!1;if(void 0===r)t=X(this,t,e,0),o=!U(t)||t!==this._$AH&&t!==L,o&&(this._$AH=t);else{const s=t;let n,a;for(t=r[0],n=0;n<r.length-1;n++)a=X(this,s[i+n],e,n),a===L&&(a=this._$AH[n]),o||=!U(a)||a!==this._$AH[n],a===q?t=q:t!==q&&(t+=(a??"")+r[n+1]),this._$AH[n]=a}o&&!s&&this.j(t)}j(t){t===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===q?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==q)}}class st extends tt{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=X(this,t,e,0)??q)===L)return;const i=this._$AH,s=t===q&&i!==q||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==q&&(i===q||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){X(this,t)}}const ot=x.litHtmlPolyfillSupport;ot?.(G,Q),(x.litHtmlVersions??=[]).push("3.3.3");const nt=globalThis;class at extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let r=s._$litPart$;if(void 0===r){const t=i?.renderBefore??null;s._$litPart$=r=new Q(e.insertBefore(O(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return L}}at._$litElement$=!0,at.finalized=!0,nt.litElementHydrateSupport?.({LitElement:at});const ct=nt.litElementPolyfillSupport;ct?.({LitElement:at}),(nt.litElementVersions??=[]).push("4.2.2");const lt=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},ht={attribute:!0,type:String,converter:f,reflect:!1,hasChanged:b},dt=(t=ht,e,i)=>{const{kind:s,metadata:r}=i;let o=globalThis.litPropertyMetadata.get(r);if(void 0===o&&globalThis.litPropertyMetadata.set(r,o=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),o.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const r=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,r,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];e.call(this,i),this.requestUpdate(s,r,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function pt(t){return(e,i)=>"object"==typeof i?dt(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function ut(t){return pt({...t,state:!0,attribute:!1})}function gt(t){return"number"==typeof t&&Number.isFinite(t)}function _t(t){const{start_percent:e,kwh:i,end_percent:s}=t??{},r=[e,i,s].filter(gt).length;return 0===r?{status:"empty"}:r<3?{status:"incomplete"}:e<0||s>100?{status:"invalid",reason:"Percentages must be 0–100"}:s<=e?{status:"invalid",reason:"After must be higher than before"}:i<=0?{status:"invalid",reason:"kWh must be positive"}:{status:"ok",kwhPerPercent:i/(s-e)}}function mt(t=[]){const e=t.map(_t).flatMap(t=>"ok"===t.status?[t.kwhPerPercent]:[]);return e.length?{kwhPerPercent:e.reduce((t,e)=>t+e,0)/e.length,samples:e.length}:{samples:0}}function vt(t,e,i){return Math.max(0,i-e)*t}const yt=["_status"],ft=["_plug_status"],bt=["_power_ct_internal_load"],$t=["_charge_added_session"],wt=["_power_ct_grid"],xt=["_power_ct_generation"],kt=["_power_grid"],St=["_power_generation"],At=["_home_consumption"];function Pt(t,e,i=[]){for(const s of e){const e=t.find(t=>t.endsWith(s)&&!i.some(e=>t.endsWith(e)));if(e)return e}}function Et(t){return Object.values(t.entities??{}).find(t=>"zappistant"===t.platform&&t.entity_id.startsWith("sensor."))?.entity_id}function zt(t){return Object.keys(t.states).find(e=>e.startsWith("select.")&&e.endsWith("_charge_mode")&&"myenergi"===t.entities?.[e]?.platform)}const Ct=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];function Mt(t,e){return Math.min(100,Math.max(5,Math.ceil(t/e*100-1e-9)))}function Ot(t){const e=30*t;return`${String(Math.floor(e/60)).padStart(2,"0")}:${e%60?"30":"00"}`}function Ut(t){const[e,i]=t.split(":").map(Number);return 2*e+(i>=30?1:0)}function Tt(t){const e=Array(48).fill(!1);for(const i of t)for(let t=Ut(i.start);t<Ut(i.end);t++)e[t]=!0;return e}function Nt(t,e){const i=[];let s;for(let r=0;r<=48;r++)if(t[r]&&void 0===s&&(s=r),!t[r]&&void 0!==s){const t=r,o=e.find(e=>Ut(e.start)<t&&Ut(e.end)>s);i.push({start:Ot(s),end:Ot(t),overrun:o?.overrun??!1}),s=void 0}return i}function Rt(t,e="zappi"){const i="octopus"===e?!!t.ready_by:t.intervals.length>0;return t.enabled&&i&&!!t.kwh}function Wt(t){const e=t.intervals[t.intervals.length-1];return Rt(t)&&"24:00"===e.end&&"00:00"!==e.start}function Bt(t,e){const i=t.days[e],s=t.days[(e+Ct.length-1)%Ct.length];return i.enabled&&"00:00"===i.intervals[0]?.start&&Wt(s)}const Ht=n`
  :host {
    display: block;
    --zappi-accent: var(--primary-color);
    --zappi-solar: var(--energy-solar-color, #ff9800);
    --zappi-grid: var(--energy-grid-consumption-color, #488fc2);
    --zappi-export: var(--energy-grid-return-color, #8353d1);
    --zappi-home: var(--primary-text-color);
    --zappi-car: var(--success-color, #43a047);
    /* Surfaces: a faint wash of the text colour reads as raised in both light and dark themes. */
    --zappi-surface: color-mix(in srgb, var(--primary-text-color) 4%, transparent);
    --zappi-control: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
    --zappi-control-hover: color-mix(in srgb, var(--zappi-accent) 14%, var(--zappi-control));
    --zappi-radius: 14px;
    --zappi-control-height: 36px;
  }
  ha-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* Header */
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }
  .heading {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .title {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.2;
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .subtitle {
    font-size: 0.85rem;
    color: var(--secondary-text-color);
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 500;
    background: var(--zappi-control);
    color: var(--primary-text-color);
    white-space: nowrap;
    cursor: pointer;
  }
  .chip ha-icon {
    --mdc-icon-size: 16px;
  }
  .chip.active {
    background: color-mix(in srgb, var(--zappi-car) 16%, transparent);
    color: var(--zappi-car);
  }
  .chip.fault {
    background: color-mix(in srgb, var(--error-color) 16%, transparent);
    color: var(--error-color);
  }
  .chip .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: pulse 1.6s ease-in-out infinite;
  }

  /* Stat tiles, each tinted with its own colour (--tile-color). */
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
    gap: 8px;
  }
  .stat {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 10px 12px;
    border-radius: var(--zappi-radius);
    background: color-mix(in srgb, var(--tile-color) 9%, transparent);
    cursor: pointer;
    transition: background 0.2s;
  }
  .stat:hover {
    background: color-mix(in srgb, var(--tile-color) 15%, transparent);
  }
  .icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--tile-color) 18%, transparent);
    color: var(--tile-color);
  }
  .icon-wrap ha-icon {
    --mdc-icon-size: 18px;
  }
  .stat.live .icon-wrap {
    animation: glow 2s ease-in-out infinite;
  }
  .stat .value {
    font-size: 1.15rem;
    font-weight: 600;
    line-height: 1.1;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }
  .stat .label {
    font-size: 0.75rem;
    color: var(--secondary-text-color);
  }

  .section-label {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--secondary-text-color);
    margin-bottom: 8px;
  }

  /* Buttons */
  button {
    font: inherit;
    font-weight: 500;
    border: none;
    border-radius: 10px;
    padding: 0 14px;
    min-height: var(--zappi-control-height);
    cursor: pointer;
    background: var(--zappi-control);
    color: var(--primary-text-color);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.15s, color 0.15s, box-shadow 0.15s, transform 0.1s;
  }
  button:hover:not(:disabled) {
    background: var(--zappi-control-hover);
  }
  button:active:not(:disabled) {
    transform: scale(0.97);
  }
  button:focus-visible {
    outline: 2px solid var(--zappi-accent);
    outline-offset: 2px;
  }
  button:disabled {
    opacity: 0.45;
    cursor: default;
  }
  button ha-icon {
    --mdc-icon-size: 18px;
  }
  button.selected,
  button.primary {
    background: var(--zappi-accent);
    color: var(--text-primary-color, #fff);
  }
  button.primary:hover:not(:disabled),
  button.selected:hover:not(:disabled) {
    background: color-mix(in srgb, var(--zappi-accent) 85%, #000);
  }
  button.danger {
    background: color-mix(in srgb, var(--error-color) 12%, transparent);
    color: var(--error-color);
  }
  button.danger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--error-color) 20%, transparent);
  }
  button.pill {
    border-radius: 999px;
    min-height: 32px;
    padding: 0 12px;
    font-size: 0.85rem;
  }

  /* Charge mode: a segmented control. */
  .modes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
    gap: 4px;
    padding: 4px;
    border-radius: var(--zappi-radius);
    background: var(--zappi-surface);
  }
  .modes button {
    flex-direction: column;
    gap: 2px;
    padding: 8px 4px;
    border-radius: 10px;
    background: transparent;
    font-size: 0.85rem;
  }
  .modes button ha-icon {
    --mdc-icon-size: 20px;
  }
  .modes button.selected {
    background: var(--zappi-accent);
    box-shadow: 0 2px 8px color-mix(in srgb, var(--zappi-accent) 35%, transparent);
  }

  /* Panels grouping related controls, e.g. Boost or the upcoming charge. */
  .block {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: var(--zappi-radius);
    background: var(--zappi-surface);
    container-type: inline-size;
  }
  .block-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--secondary-text-color);
  }
  .block-title ha-icon {
    --mdc-icon-size: 16px;
  }
  .boost-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  /* Ready by, Smart boost, Boost now and Stop share one row; the buttons shrink to fit. */
  .boost-row.actions {
    flex-wrap: nowrap;
    gap: 6px;
  }
  .boost-row.actions button {
    flex: 1 1 0;
    min-width: 0;
    padding: 0 6px;
    white-space: nowrap;
  }
  .boost-row.actions .field {
    flex-shrink: 0;
  }
  /* On a narrow card (e.g. a phone) the actions keep to one row as icons; tooltips name them. */
  @container (max-width: 440px) {
    .boost-row.actions .label {
      display: none;
    }
  }

  /* Upcoming charge: one line, tinted with the accent; wraps only when the card is too narrow. */
  .block.upcoming {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 8px;
    padding: 8px 10px 8px 12px;
    background: color-mix(in srgb, var(--zappi-accent) 9%, transparent);
    color: var(--primary-text-color);
    font-size: 0.9rem;
  }
  .upcoming > * {
    white-space: nowrap;
  }
  .upcoming ha-icon {
    --mdc-icon-size: 20px;
    color: var(--zappi-accent);
  }
  .upcoming button {
    min-height: 30px;
    padding: 0 12px;
  }
  .upcoming .field {
    gap: 4px;
  }
  .upcoming button.skip {
    padding: 0 8px;
    background: transparent;
    color: var(--secondary-text-color);
  }
  .upcoming button.skip:hover:not(:disabled) {
    background: var(--zappi-control);
    color: var(--primary-text-color);
  }
  .upcoming button.skip ha-icon {
    color: inherit;
    --mdc-icon-size: 18px;
  }
  /* A skipped charge is shown muted, with Undo. */
  .block.upcoming.skipped {
    background: var(--zappi-surface);
  }
  .upcoming.skipped ha-icon {
    color: var(--secondary-text-color);
  }
  .spacer {
    flex: 1;
  }

  /* Inputs */
  .field {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--secondary-text-color);
    font-size: 0.9rem;
  }
  input {
    font: inherit;
    width: 72px;
    height: 32px;
    box-sizing: border-box;
    padding: 0 8px;
    border-radius: 8px;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  input:focus {
    outline: none;
    border-color: var(--zappi-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--zappi-accent) 22%, transparent);
  }
  input[type="number"] {
    width: 52px;
    text-align: center;
    /* No spinner arrows: they eat the room "100" needs, and the keypad or typing is quicker. */
    -moz-appearance: textfield;
    appearance: textfield;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="time"] {
    width: auto;
  }
  input:disabled {
    opacity: 0.6;
  }

  /* Messages */
  .estimate {
    font-size: 0.9rem;
    color: var(--primary-text-color);
  }
  .estimate strong {
    font-weight: 600;
  }
  .estimate.problem {
    color: var(--secondary-text-color);
  }
  .note {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 0.85rem;
    color: var(--secondary-text-color);
  }
  .note ha-icon {
    --mdc-icon-size: 18px;
    flex-shrink: 0;
  }
  .note.warn {
    color: var(--warning-color);
  }
  .error {
    color: var(--error-color);
    font-size: 0.85rem;
  }
  .warning {
    padding: 8px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--warning-color) 20%, transparent);
    color: var(--primary-text-color);
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.4;
      transform: scale(0.75);
    }
  }
  @keyframes glow {
    0%,
    100% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--tile-color) 35%, transparent);
    }
    50% {
      box-shadow: 0 0 0 6px color-mix(in srgb, var(--tile-color) 0%, transparent);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    .chip .dot,
    .stat.live .icon-wrap {
      animation: none !important;
      transition: none !important;
    }
  }
`;let Dt=class extends at{constructor(){super(...arguments),this._day=((new Date).getDay()+6)%7,this._saving=!1,this._savedJson="",this._loadRequested=!1}updated(){this.hass&&!this._loadRequested&&(this._loadRequested=!0,this._load())}async _load(){try{const{schedule:e,status:i}=await(t=this.hass,t.callWS({type:"zappistant/schedule/get"}));this._status=i,this._setSaved(e)}catch(t){this._error=`Couldn't load the schedule: ${t?.message??t}`,this._schedule={enabled:!1,days:Ct.map(()=>({enabled:!1,start_percent:null,target_percent:null,kwh:null,kwh_manual:!1,intervals:[],ready_by:null}))}}var t}_setSaved(t){this._schedule=t,this._savedJson=JSON.stringify(t)}get _octopus(){return"octopus"===this._status?.mode}get _dirty(){return JSON.stringify(this._schedule)!==this._savedJson}async _save(){this._saving=!0,this._error=void 0;try{this._setSaved((await(t=this.hass,e=this._schedule,t.callWS({type:"zappistant/schedule/save",schedule:e}))).schedule)}catch(t){this._error=`Couldn't save: ${t?.message??t}`}finally{this._saving=!1}var t,e}_revert(){this._schedule=JSON.parse(this._savedJson),this._error=void 0}_autoKwh(t){const{start_percent:e,target_percent:i}=t;return void 0===this.kwhPerPercent||null===e||null===i||i<=e?null:Math.ceil((i-e)*this.kwhPerPercent)}_updateDay(t,e){const i=[...this._schedule.days],s={...i[t],...e};!s.kwh_manual&&("start_percent"in e||"target_percent"in e||"kwh_manual"in e)&&(s.kwh=this._autoKwh(s)),i[t]=s,this._schedule={...this._schedule,days:i}}_copyTo(t){const e=[...this._schedule.days];e[t]=structuredClone(e[this._day]),this._schedule={...this._schedule,days:e}}_slotAt(t){const e=this.renderRoot.elementFromPoint(t.clientX,t.clientY),i=e?.dataset.slot;return void 0===i?void 0:Number(i)}_paintSlot(t){const e=this._schedule.days[this._day],i=Tt(e.intervals);i[t]!==this._paint&&(i[t]=this._paint,function(t){return t.filter((e,i)=>e&&!t[i-1]).length}(i)>5?this._error="At most 5 charging intervals per day.":(this._error=void 0,this._updateDay(this._day,{intervals:Nt(i,e.intervals)})))}_pointerDown(t){const e=this._slotAt(t);void 0!==e&&(t.currentTarget.setPointerCapture(t.pointerId),this._paint=!Tt(this._schedule.days[this._day].intervals)[e],this._paintSlot(e))}_pointerMove(t){if(void 0===this._paint)return;const e=this._slotAt(t);void 0!==e&&this._paintSlot(e)}_pointerUp(){this._paint=void 0}render(){return this._schedule?I`
      <div class="head">
        <label class="check">
          <input
            type="checkbox"
            .checked=${this._schedule.enabled}
            @change=${t=>this._schedule={...this._schedule,enabled:t.target.checked}}
          />
          Schedule on
        </label>
        <span class="spacer"></span>
        ${this._dirty?I`
              <button ?disabled=${this._saving} @click=${this._revert}>Revert</button>
              <button class="primary" ?disabled=${this._saving} @click=${this._save}>
                ${this._saving?"Saving…":"Save"}
              </button>
            `:I`<span class="hint">Saved</span>`}
      </div>
      <div class="week">${this._schedule.days.map((t,e)=>this._renderWeekRow(t,e))}</div>
      ${this._renderDay(this._schedule.days[this._day])}
      ${this._error?I`<div class="error">${this._error}</div>`:q}
    `:I`<div class="hint">Loading schedule…</div>`}_renderWeekRow(t,e){const i=Tt(t.intervals);return I`
      <button class="week-row ${e===this._day?"selected":""}" @click=${()=>this._day=e}>
        <span class="week-day">${Ct[e].slice(0,3)}</span>
        ${this._octopus?I`<span class="week-ready ${t.enabled?"":"off"}">
              ${t.ready_by?`Ready by ${t.ready_by} next morning`:""}
            </span>`:I`<span class="strip ${t.enabled?"":"off"}">
              ${i.map(t=>I`<span class=${t?"on":""}></span>`)}
            </span>`}
        <span class="week-kwh">${Rt(t,this._status?.mode)?`${t.kwh} kWh`:"–"}</span>
      </button>
    `}_overnightNote(t,e){const i=this._schedule,s=(this._day+Ct.length-1)%Ct.length,r=(this._day+1)%Ct.length;return 0===e&&Bt(i,this._day)?`Ends ${Ct[s]}'s overnight charge, using ${Ct[s]}'s kWh`:e===t.intervals.length-1&&Wt(t)&&Bt(i,r)?`Continues until ${i.days[r].intervals[0].end} on ${Ct[r]} as one charge`:void 0}_renderDay(t){const e=Ct[this._day],i=(t,e,i,s)=>I`
      <input
        type="number"
        inputmode="decimal"
        min="0"
        max=${e}
        step=${i}
        .value=${null===t?"":String(t)}
        @change=${t=>{const e=t.target.value,i=""===e?null:Number(e);s(null!==i&&Number.isFinite(i)?i:null)}}
      />
    `;return I`
      <div class="day">
        <label class="check">
          <input
            type="checkbox"
            .checked=${t.enabled}
            @change=${t=>this._updateDay(this._day,{enabled:t.target.checked})}
          />
          Charge on ${e}s
        </label>

        ${this._octopus?this._renderReadyBy(t):this._renderSlots(t)}

        <div class="amounts">
          <label class="field">
            Expected start ${i(t.start_percent,100,"1",t=>this._updateDay(this._day,{start_percent:t}))} %
          </label>
          <label class="field">
            Target ${i(t.target_percent,100,"1",t=>this._updateDay(this._day,{target_percent:t}))} %
          </label>
          <label class="field">
            ${i(t.kwh,200,"0.1",t=>this._updateDay(this._day,{kwh:t,kwh_manual:null!==t}))} kWh
          </label>
          ${t.kwh_manual?I`<button class="small" @click=${()=>this._updateDay(this._day,{kwh_manual:!1})}>
                Calculate
              </button>`:I`<span class="hint">calculated</span>`}
        </div>
        ${t.kwh_manual||void 0!==this.kwhPerPercent?q:I`<div class="hint">Add calibration charges in the card settings to calculate kWh, or type it in.</div>`}
        ${this._octopus&&t.kwh&&this._status?.octopus_battery_kwh?I`<div class="hint">
              Octopus will be asked to add ${Mt(t.kwh,this._status.octopus_battery_kwh)}% of its
              ${this._status.octopus_battery_kwh} kWh battery.
            </div>`:q}

        <div class="copy">
          <span class="hint">Copy ${e} to</span>
          ${Ct.map((t,e)=>e===this._day?q:I`<button class="small" @click=${()=>this._copyTo(e)}>${t.slice(0,3)}</button>`)}
        </div>
      </div>
    `}_renderReadyBy(t){return I`
      <label class="field">
        Ready by (next morning)
        <select
          .value=${t.ready_by??""}
          @change=${t=>this._updateDay(this._day,{ready_by:t.target.value||null})}
        >
          <option value="" ?selected=${!t.ready_by}>–</option>
          ${Array.from({length:48},(t,e)=>Ot(e)).map(e=>I`<option value=${e} ?selected=${t.ready_by===e}>${e}</option>`)}
        </select>
      </label>
      <div class="hint">
        Plug in in the evening and Octopus picks the cheapest slots overnight. Zappistant sets Octopus's charge
        target and ready-by time for each evening's charge.
      </div>
    `}_renderSlots(t){const e=Tt(t.intervals);return I`
        <div
          class="grid"
          @pointerdown=${this._pointerDown}
          @pointermove=${this._pointerMove}
          @pointerup=${this._pointerUp}
          @pointercancel=${this._pointerUp}
        >
          ${Array.from({length:4},(t,i)=>I`
            <div class="grid-row">
              ${Array.from({length:6},(t,s)=>{const r=6*i+s;return I`
                  <div class="hour">
                    <span class="hour-label">${String(r).padStart(2,"0")}</span>
                    <div class="cells">
                      ${[0,1].map(t=>{const i=2*r+t;return I`<div
                          class="cell ${e[i]?"on":""}"
                          data-slot=${i}
                          title=${`${String(r).padStart(2,"0")}:${t?"30":"00"}`}
                        ></div>`})}
                    </div>
                  </div>
                `})}
            </div>
          `)}
        </div>

        ${t.intervals.length?I`<div class="intervals">
              ${t.intervals.map((e,i)=>I`
                  <div class="interval">
                    <span class="interval-time">${e.start}–${e.end}</span>
                    <label class="check small">
                      <input
                        type="checkbox"
                        .checked=${e.overrun}
                        @change=${e=>{const s=t.intervals.map((t,s)=>s===i?{...t,overrun:e.target.checked}:t);this._updateDay(this._day,{intervals:s})}}
                      />
                      Keep charging after until the kWh is reached
                    </label>
                    ${this._overnightNote(t,i)?I`<span class="overnight">
                          <ha-icon icon="mdi:weather-night"></ha-icon>${this._overnightNote(t,i)}
                        </span>`:q}
                  </div>
                `)}
            </div>`:I`<div class="hint">Tap or drag on the grid to pick charging slots (up to ${5} intervals).</div>`}
    `}};Dt.styles=n`
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    button {
      font: inherit;
      border: none;
      border-radius: 10px;
      padding: 8px 14px;
      cursor: pointer;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }
    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
    button.primary {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    button.small {
      padding: 4px 10px;
      font-size: 0.85rem;
    }
    input[type="number"] {
      font: inherit;
      width: 56px;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }
    .head {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .spacer {
      flex: 1;
    }
    .check {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--primary-text-color);
    }
    .check.small {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }
    .hint {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }
    .error {
      font-size: 0.85rem;
      color: var(--error-color);
    }
    .week {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .week-row {
      display: grid;
      grid-template-columns: 36px 1fr 56px;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      background: none;
      border-radius: 8px;
    }
    .week-row.selected {
      background: var(--secondary-background-color);
    }
    .week-day {
      font-size: 0.85rem;
      text-align: left;
    }
    .week-kwh {
      font-size: 0.85rem;
      text-align: right;
      color: var(--secondary-text-color);
    }
    .strip {
      display: grid;
      grid-template-columns: repeat(${48}, 1fr);
      gap: 1px;
      height: 10px;
    }
    .week-ready {
      font-size: 0.85rem;
      text-align: left;
      color: var(--primary-text-color);
    }
    .week-ready.off {
      opacity: 0.4;
    }
    select {
      font: inherit;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }
    .strip span {
      background: var(--divider-color);
      border-radius: 1px;
    }
    .strip span.on {
      background: var(--primary-color);
    }
    .strip.off span.on {
      opacity: 0.35;
    }
    .day {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
    }
    .grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
      touch-action: none;
      user-select: none;
    }
    .grid-row {
      display: grid;
      grid-template-columns: repeat(${6}, 1fr);
      gap: 4px;
    }
    .hour {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .hour-label {
      font-size: 0.7rem;
      color: var(--secondary-text-color);
    }
    .cells {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px;
    }
    .cell {
      height: 28px;
      border-radius: 4px;
      background: var(--secondary-background-color);
      cursor: pointer;
    }
    .cell.on {
      background: var(--primary-color);
    }
    .intervals {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .interval {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 12px;
    }
    .interval-time {
      font-variant-numeric: tabular-nums;
      min-width: 96px;
    }
    .overnight {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-basis: 100%;
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }
    .overnight ha-icon {
      --mdc-icon-size: 16px;
    }
    .amounts,
    .copy {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .field {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.9rem;
      color: var(--secondary-text-color);
    }
  `,t([pt({attribute:!1})],Dt.prototype,"hass",void 0),t([pt({attribute:!1})],Dt.prototype,"kwhPerPercent",void 0),t([ut()],Dt.prototype,"_schedule",void 0),t([ut()],Dt.prototype,"_status",void 0),t([ut()],Dt.prototype,"_day",void 0),t([ut()],Dt.prototype,"_error",void 0),t([ut()],Dt.prototype,"_saving",void 0),Dt=t([lt("zappi-schedule-editor")],Dt);const jt=(t,e)=>({name:t,selector:{entity:{filter:{domain:"sensor",integration:"myenergi",...e&&{device_class:e}}}}}),Ft=[{name:"entity",required:!0,selector:{entity:{filter:{domain:"select",integration:"myenergi"}}}},{type:"expandable",name:"",flatten:!0,title:"Entity overrides (auto-detected when empty)",schema:[jt("status_entity"),jt("plug_status_entity"),jt("charge_power_entity","power"),jt("session_energy_entity","energy"),jt("grid_power_entity","power"),jt("solar_power_entity","power"),jt("home_power_entity","power")]}],It=[{name:"name",selector:{text:{}}},{type:"grid",name:"",schema:[{name:"show_stats",selector:{boolean:{}}},{name:"show_power_flow",selector:{boolean:{}}},{name:"show_boost",selector:{boolean:{}}},{name:"show_upcoming",selector:{boolean:{}}}]}],Lt={entity:"Charge mode entity",name:"Name",show_stats:"Show charging figures (power, session)",show_power_flow:"Show solar / grid / home power",show_boost:"Show boost controls",show_upcoming:"Show upcoming scheduled charge",status_entity:"Status",plug_status_entity:"Plug status",charge_power_entity:"Charge power",session_energy_entity:"Session energy",grid_power_entity:"Grid power",solar_power_entity:"Solar power",home_power_entity:"Home power"};let qt=class extends at{setConfig(t){this._config={show_stats:!0,show_power_flow:!0,show_boost:!0,show_upcoming:!0,...t}}render(){return this.hass&&this._config?I`
      <div class="section">
        <h3>Charger</h3>
        ${this._renderForm(Ft)}
      </div>
      <div class="section">
        <h3>Display</h3>
        ${this._renderForm(It)}
      </div>
      ${this._renderBatteryHealth()} ${this._renderTargetCharging()} ${this._renderCalibration()}
      ${this._renderSchedule()}
    `:q}_renderSchedule(){const t=void 0!==Et(this.hass);return I`
      <div class="section">
        <h3>Weekly schedule</h3>
        ${t?I`
              <p class="hint">
                Saved straight to Home Assistant with the schedule's own Save button, separately from this card's
                settings. kWh is calculated from the battery calibration above.
              </p>
              <zappi-schedule-editor
                .hass=${this.hass}
                .kwhPerPercent=${mt(this._config.calibration).kwhPerPercent}
              ></zappi-schedule-editor>
            `:I`<p class="hint">
              Install the
              <a href="https://github.com/adamkcs/ha-zappistant-integration" target="_blank" rel="noreferrer"
                >Zappistant integration</a
              >
              (through HACS) to plan charging for each day of the week.
            </p>`}
      </div>
    `}_renderTargetCharging(){const t=this._config;return I`
      <div class="section">
        <h3>Target charging</h3>
        <div class="health">
          <label class="health-field">
            <span>Default "Ready by" time</span>
            <span class="with-unit">
              <input
                type="time"
                step="900"
                .value=${t.default_ready_by??"07:00"}
                @change=${e=>this._emit({...t,default_ready_by:e.target.value||void 0})}
              />
            </span>
            <span class="hint">Pre-filled for smart boost on the card.</span>
          </label>
          <label class="health-field">
            <span class="with-unit">
              <input
                type="checkbox"
                .checked=${!1!==t.switch_to_stopped}
                @change=${e=>this._emit({...t,switch_to_stopped:!!e.target.checked&&void 0})}
              />
              Switch to Stopped after a target boost
            </span>
            <span class="hint">
              A zappi only boosts in Eco or Eco+ and returns to that mode afterwards. Switching to Stopped once
              the boost is done makes charging end at the target. Needs the Zappistant integration; not
              applied to 100% charges.
            </span>
          </label>
        </div>
      </div>
    `}_renderBatteryHealth(){const t=(t,e,i)=>I`
      <label class="health-field">
        <span>${e}</span>
        <span class="with-unit">
          <input
            type="number"
            inputmode="numeric"
            min="1"
            max="100"
            step="1"
            .value=${void 0===this._config[t]?"":String(this._config[t])}
            @change=${e=>this._percentChanged(t,e.target.value)}
          />
          %
        </span>
        <span class="hint">${i}</span>
      </label>
    `;return I`
      <div class="section">
        <h3>Battery health</h3>
        <div class="health">
          ${t("battery_soh_percent","Last read SOH","From the car or an OBD reader. Stored for later calculations.")}
          ${t("max_charge_percent","Max charge allowed","Charges stop here unless you pick 100% on the card.")}
        </div>
      </div>
    `}_percentChanged(t,e){const i=""===e?void 0:Number(e),s=void 0!==i&&Number.isFinite(i)&&i>=1&&i<=100;this._emit({...this._config,[t]:s?i:void 0})}_renderForm(t){return I`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${t}
        .computeLabel=${t=>Lt[t.name]??t.title??t.name}
        @value-changed=${t=>this._emit(t.detail.value)}
      ></ha-form>
    `}_renderCalibration(){const t=this._config.calibration??[],e=mt(t);return I`
      <div class="section">
        <h3>Battery calibration</h3>
        <p class="hint">
          Enter past charges: battery % when you plugged in, kWh the zappi added, and battery % afterwards.
          The card averages them to estimate how many kWh one percent takes, including charging losses.
        </p>
        <div class="slots">
          <span class="head">#</span>
          <span class="head">Before %</span>
          <span class="head">kWh charged</span>
          <span class="head">After %</span>
          <span class="head">kWh / %</span>
          ${Array.from({length:5},(e,i)=>this._renderSlot(i,t[i]))}
        </div>
        <div class="summary">
          ${void 0!==e.kwhPerPercent?I`
                <strong>${e.kwhPerPercent.toFixed(3)} kWh per %</strong>
                from ${e.samples} ${1===e.samples?"charge":"charges"}
                · ≈ ${(100*e.kwhPerPercent).toFixed(1)} kWh for 0–100%
              `:I`Fill in at least one complete row to calibrate.`}
        </div>
      </div>
    `}_renderSlot(t,e={}){const i=_t(e),s=(i,s,r)=>I`
      <input
        type="number"
        inputmode="decimal"
        min="0"
        max=${r}
        step=${s}
        .value=${void 0===e[i]?"":String(e[i])}
        @change=${e=>this._slotChanged(t,i,e.target.value)}
      />
    `;return I`
      <span class="index">${t+1}</span>
      ${s("start_percent","1","100")} ${s("kwh","0.1","200")} ${s("end_percent","1","100")}
      <span class="result ${i.status}" title=${"invalid"===i.status?i.reason:""}>
        ${"ok"===i.status?i.kwhPerPercent.toFixed(3):"invalid"===i.status?"⚠":"–"}
      </span>
    `}_slotChanged(t,e,i){const s=Array.from({length:5},(t,e)=>({...this._config.calibration?.[e]})),r=""===i?void 0:Number(i);void 0!==r&&Number.isFinite(r)?s[t][e]=r:delete s[t][e];const o=s.filter(t=>Object.keys(t).length>0);this._emit({...this._config,calibration:o.length?o:void 0})}_emit(t){const e={...t};for(const[t,i]of Object.entries(e))""!==i&&void 0!==i||delete e[t];this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}};qt.styles=n`
    .section {
      margin-bottom: 24px;
    }
    h3 {
      margin: 0 0 8px;
      font-size: 1rem;
      font-weight: 500;
    }
    .hint {
      margin: 0 0 12px;
      font-size: 0.875rem;
      color: var(--secondary-text-color);
    }
    .health {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
    }
    .health-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .health-field .hint {
      margin: 0;
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }
    .with-unit {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .with-unit input {
      width: 80px;
    }
    .with-unit input[type="time"] {
      width: auto;
    }
    .with-unit input[type="checkbox"] {
      width: auto;
      margin: 0;
    }
    .slots {
      display: grid;
      grid-template-columns: 24px repeat(3, minmax(0, 1fr)) 64px;
      gap: 8px;
      align-items: center;
    }
    .head {
      font-size: 0.75rem;
      color: var(--secondary-text-color);
    }
    .index {
      color: var(--secondary-text-color);
      text-align: center;
    }
    input {
      font: inherit;
      width: 100%;
      box-sizing: border-box;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }
    .result {
      font-variant-numeric: tabular-nums;
      text-align: right;
    }
    .result.invalid {
      color: var(--error-color);
      cursor: help;
    }
    .result.empty,
    .result.incomplete {
      color: var(--secondary-text-color);
    }
    .summary {
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--secondary-background-color);
      font-size: 0.9rem;
    }
  `,t([pt({attribute:!1})],qt.prototype,"hass",void 0),t([ut()],qt.prototype,"_config",void 0),qt=t([lt("zappi-card-editor")],qt);const Vt={Fast:"mdi:lightning-bolt",Eco:"mdi:leaf","Eco+":"mdi:solar-power",Stopped:"mdi:stop-circle-outline"},Jt=["unavailable","unknown"],Kt="07:00",Zt={waiting:"Waiting for next slot",charging:"Charging",overrun:"Charging past slot"};console.info("%c ZAPPI-CARD %c 0.1.3 ","color: white; background: #43a047","");let Gt=class extends at{constructor(){super(...arguments),this._currentPercent="",this._targetPercent="",this._preset="custom",this._boostBy=Kt,this._switchingMode=!1,this._upcomingStart="",this._upcomingTarget=""}static getConfigElement(){return document.createElement("zappi-card-editor")}static getStubConfig(t){return{entity:zt(t)??""}}setConfig(t){if(!t.entity)throw new Error("Set 'entity' to the myenergi zappi charge mode select entity");t.default_ready_by!==this._config?.default_ready_by&&(this._boostBy=t.default_ready_by??Kt),this._config={show_stats:!0,show_power_flow:!0,show_boost:!0,show_upcoming:!0,switch_to_stopped:!0,...t},this._kwhPerPercent=mt(t.calibration).kwhPerPercent,"max"===this._preset&&void 0===t.max_charge_percent&&(this._preset="custom"),this._entities=void 0}getCardSize(){return 6}willUpdate(t){if(!this.hass||!t.has("hass")&&!t.has("_config"))return;const e=this._scheduleStatus()?.upcoming,i=e?`${e.date}|${e.start_percent}|${e.target_percent}`:void 0;e&&i!==this._upcomingKey&&(this._upcomingStart=null===e.start_percent?"":String(e.start_percent),this._upcomingTarget=null===e.target_percent?"":String(e.target_percent)),this._upcomingKey=i,this._entities&&this.hass.entities===this._registry||(this._registry=this.hass.entities,this._entities=function(t,e){const i=t.entities??{},s=i[e.entity]?.device_id,r=Object.values(i).filter(t=>"myenergi"===t.platform&&t.entity_id.startsWith("sensor.")).filter(e=>e.entity_id in t.states),o=r.filter(t=>s&&t.device_id===s).map(t=>t.entity_id),n=r.filter(t=>!s||t.device_id!==s).map(t=>t.entity_id),a={status:Pt(o,yt,["_plug_status"]),plug_status:Pt(o,ft),charge_power:Pt(o,bt),session_energy:Pt(o,$t),grid_power:Pt(n,kt)??Pt(o,wt),solar_power:Pt(n,St)??Pt(o,xt),home_power:Pt(n,At)};return{mode:e.entity,status:e.status_entity??a.status,plug_status:e.plug_status_entity??a.plug_status,charge_power:e.charge_power_entity??a.charge_power,session_energy:e.session_energy_entity??a.session_energy,grid_power:e.grid_power_entity??a.grid_power,solar_power:e.solar_power_entity??a.solar_power,home_power:e.home_power_entity??a.home_power}}(this.hass,this._config))}_state(t){if(!t)return;const e=this.hass.states[t]?.state;return void 0===e||Jt.includes(e)?void 0:e}_number(t){const e=Number(this._state(t));return Number.isFinite(e)?e:void 0}async _call(t,e){this._pending=t,this._error=void 0;try{await e()}catch(t){this._error=t?.message??String(t)}finally{this._pending=void 0}}_setMode(t){this._call(`mode-${t}`,()=>this.hass.callService("select","select_option",{option:t},{entity_id:this._config.entity}))}_parsePercent(t){if(""===t.trim())return;const e=Number(t);return Number.isFinite(e)?e:void 0}_targetValue(){const t=this._config.max_charge_percent;return"max"===this._preset?t:"full"===this._preset?100:this._parsePercent(this._targetPercent)??t??100}_boostPlan(){const t=this._config.max_charge_percent,e=this._parsePercent(this._currentPercent),i=this._targetValue();if("full"===this._preset)return{kwh:99,to:100};if(void 0===this._kwhPerPercent)return{problem:"Add calibration charges in the card settings to estimate kWh."};if(void 0===e)return{problem:""};if(e<0||e>100||void 0===i||i<0||i>100)return{problem:"Percentages must be between 0 and 100."};if("custom"===this._preset&&void 0!==t&&i>t)return{problem:`Target is above the max allowed (${t}%).`};if(i<=e)return{problem:"Target must be higher than the current %."};const s=Math.ceil(vt(this._kwhPerPercent,e,i));return{kwh:Math.min(99,Math.max(1,s)),from:e,to:i}}_togglePreset(t){this._preset=this._preset===t?"custom":t}_mode(){return this._state(this._config.entity)}_willStopAfter(){return!!this._config.switch_to_stopped&&!!Et(this.hass)&&!this._octopusMode()&&"full"!==this._preset}_needsEcoPlus(){const t=this._mode();return"Eco"!==t&&"Eco+"!==t}_octopusMode(){return"octopus"===this._scheduleStatus()?.mode}_startBoost(t,e){const i={entity_id:this._config.entity};this._call(t,async()=>{if(Et(this.hass))await(s=this.hass,r={kind:"boost"===t?"manual":"smart",kwh:e,ready_by:"boost"===t?void 0:this._boostBy.slice(0,5),switch_to_stopped:this._willStopAfter()},s.callWS({type:"zappistant/boost",...r}));else{var s,r;if(this._needsEcoPlus()){await this.hass.callService("select","select_option",{option:"Eco+"},i),this._switchingMode=!0;try{await new Promise(t=>setTimeout(t,75e3))}finally{this._switchingMode=!1}}"boost"===t?await this.hass.callService("myenergi","myenergi_boost",{amount:e},i):await this.hass.callService("myenergi","myenergi_smart_boost",{amount:e,when:this._boostBy.slice(0,5)},i)}})}_stopBoost(){this._call("stop-boost",()=>Et(this.hass)?this.hass.callWS({type:"zappistant/boost/stop"}):this.hass.callService("myenergi","myenergi_stop_boost",{},{entity_id:this._config.entity}))}_moreInfo(t){t&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}render(){if(!this._config||!this.hass||!this._entities)return q;const t=this.hass.states[this._config.entity];if(!t)return I`<ha-card><div class="warning">Entity not found: ${this._config.entity}</div></ha-card>`;const e=this._config.name??t.attributes.friendly_name?.replace(/ charge mode$/i,"")??"Zappi";return I`
      <ha-card>
        <div class="header">
          <div class="heading">
            <span class="title">${e}</span>
            <span class="subtitle">${t.state} mode</span>
          </div>
          ${this._renderStatusChip()}
        </div>
        ${this._renderStats()}
        ${this._renderModes(t.state,t.attributes.options)}
        ${this._config.show_boost?this._renderBoost():q}
        ${this._config.show_upcoming?this._renderUpcoming():q}
        ${this._error?I`<div class="error">${this._error}</div>`:q}
      </ha-card>
    `}_renderStatusChip(){const t=this._entities,e=this._state(t.status),i=this._state(t.plug_status),s="Charging"===e||"Boosting"===e,r="Fault"===i;return I`
      <span
        class="chip ${s?"active":""} ${r?"fault":""}"
        @click=${()=>this._moreInfo(t.plug_status??t.status)}
      >
        ${s?I`<span class="dot"></span>`:I`<ha-icon .icon=${r?"mdi:alert-circle":"Boosting"===e?"mdi:rocket-launch":s?"mdi:ev-station":"EV Disconnected"===i?"mdi:power-plug-off":"mdi:power-plug"}></ha-icon>`}${s||!i?e??"Unknown":i}
      </span>
    `}_formatPower(t){return Math.abs(t)>=1e3?`${(t/1e3).toFixed(2)} kW`:`${Math.round(t)} W`}_renderStat(t,e,i,s,r,o=!1){return I`
      <div class="stat ${o?"live":""}" style="--tile-color: ${r}" @click=${()=>this._moreInfo(t)}>
        <span class="icon-wrap"><ha-icon .icon=${e}></ha-icon></span>
        <span class="value">${s}</span>
        <span class="label">${i}</span>
      </div>
    `}_renderStats(){const t=this._entities,e=this._number(t.charge_power),i=this._number(t.session_energy),s=this._number(t.grid_power),r=this._number(t.solar_power),o=this._number(t.home_power),n=this._config.show_stats,a=this._config.show_power_flow;return n||a?I`
      <div class="stats">
        ${n&&void 0!==e?this._renderStat(t.charge_power,"mdi:car-electric","Charging",this._formatPower(e),"var(--zappi-car)",e>50):q}
        ${n&&void 0!==i?this._renderStat(t.session_energy,"mdi:battery-charging","Session",`${i.toFixed(1)} kWh`,"var(--zappi-car)"):q}
        ${a&&void 0!==r?this._renderStat(t.solar_power,"mdi:solar-power-variant","Solar",this._formatPower(r),"var(--zappi-solar)"):q}
        ${a&&void 0!==s?this._renderStat(t.grid_power,s<0?"mdi:transmission-tower-import":"mdi:transmission-tower-export",s<0?"Exporting":"Importing",this._formatPower(Math.abs(s)),s<0?"var(--zappi-export)":"var(--zappi-grid)"):q}
        ${a&&void 0!==o?this._renderStat(t.home_power,"mdi:home-lightning-bolt","Home",this._formatPower(o),"var(--zappi-home)"):q}
      </div>
    `:q}_renderModes(t,e=Object.keys(Vt)){return I`
      <div>
        <div class="section-label">Charge mode</div>
        <div class="modes">
          ${e.map(e=>I`
              <button
                class=${e===t?"selected":""}
                ?disabled=${void 0!==this._pending}
                @click=${()=>e!==t&&this._setMode(e)}
              >
                <ha-icon .icon=${Vt[e]??"mdi:ev-station"}></ha-icon>
                ${e}
              </button>
            `)}
        </div>
      </div>
    `}_renderBoost(){const t=void 0!==this._pending,e=this._config.max_charge_percent,i=this._boostPlan(),s="kwh"in i?i.kwh:void 0,r="custom"===this._preset?void 0:this._targetValue(),o=(t,e,i="",s=!1)=>I`
      <input
        type="number"
        inputmode="numeric"
        min="0"
        max="100"
        step="1"
        placeholder=${i}
        ?disabled=${s}
        .value=${t}
        @input=${t=>e(t.target.value)}
      />
    `;return I`
      <div class="block">
        <div class="block-title"><ha-icon icon="mdi:rocket-launch-outline"></ha-icon>Boost</div>
        <div class="boost-row">
          <label class="field">
            Now ${o(this._currentPercent,t=>this._currentPercent=t)} %
          </label>
          <label class="field">
            Target
            ${o(void 0!==r?String(r):this._targetPercent,t=>this._targetPercent=t,String(e??100),void 0!==r)}
            %
          </label>
          <button
            class="pill ${"max"===this._preset?"selected":""}"
            ?disabled=${void 0===e}
            title=${void 0===e?"Set the max charge % in the card settings":`Charge to ${e}%`}
            @click=${()=>this._togglePreset("max")}
          >
            Max allowed${void 0!==e?` (${e}%)`:""}
          </button>
          <button class="pill ${"full"===this._preset?"selected":""}" @click=${()=>this._togglePreset("full")}>
            100%
          </button>
        </div>
        ${"problem"in i?i.problem?I`<div class="estimate problem">${i.problem}</div>`:q:I`<div class="estimate">
              ${void 0===i.from?I`Full charge: <strong>${i.kwh} kWh</strong>, the car stops when it's full`:I`≈ <strong>${i.kwh} kWh</strong> to charge from ${i.from}% to ${i.to}%`}
            </div>`}
        ${this._switchingMode?I`<div class="note">
              <ha-icon icon="mdi:timer-sand"></ha-icon>Switching to Eco+… the boost starts in about a minute. Keep this
              page open until it does.
            </div>`:void 0!==s?this._renderModeNote():q}
        <div class="boost-row actions">
          <label class="field" title="Ready by (smart boost)">
            <span class="label">Ready by</span>
            <input
              type="time"
              step="900"
              .value=${this._boostBy}
              @change=${t=>this._boostBy=t.target.value}
            />
          </label>
          <button
            class="primary"
            title="Smart boost"
            ?disabled=${t||void 0===s||!this._boostBy}
            @click=${()=>s&&this._startBoost("smart-boost",s)}
          >
            <ha-icon icon="mdi:clock-fast"></ha-icon><span class="label">Smart boost</span>
          </button>
          <button
            title="Boost now"
            ?disabled=${t||void 0===s}
            @click=${()=>s&&this._startBoost("boost",s)}
          >
            <ha-icon icon="mdi:rocket-launch"></ha-icon><span class="label">Boost now</span>
          </button>
          <!-- Always offered: a scheduled smart boost reports "Paused", not "Boosting". -->
          <button class="danger" title="Stop boost" ?disabled=${t} @click=${this._stopBoost}>
            <ha-icon icon="mdi:stop"></ha-icon><span class="label">Stop</span>
          </button>
        </div>
      </div>
    `}_scheduleStatus(){const t=Et(this.hass),e=t?this.hass.states[t]:void 0;return e?{...e.attributes,state:e.state}:void 0}_dayLabel(t){const[e,i,s]=t.split("-").map(Number),r=new Date(e,i-1,s),o=new Date;o.setHours(0,0,0,0);const n=Math.round((r.getTime()-o.getTime())/864e5);return-1===n?"Last night":0===n?"Today":1===n?"Tomorrow":`${Ct[(r.getDay()+6)%7]} ${s}/${i}`}_upcomingPlan(){const t=this._parsePercent(this._upcomingStart),e=this._parsePercent(this._upcomingTarget);return void 0===this._kwhPerPercent?{problem:"needs calibration"}:void 0===t||void 0===e?{problem:""}:t<0||t>100||e<0||e>100?{problem:"0–100%"}:e<=t?{problem:"target ≤ start, use Skip"}:{kwh:Math.ceil(vt(this._kwhPerPercent,t,e)),start:t,target:e}}_applyUpcoming(t,e){this._call("upcoming",()=>((t,e,i)=>t.callWS({type:"zappistant/override/set",date:e,...i}))(this.hass,t.date,e))}_skipUpcoming(t){this._applyUpcoming(t,{kwh:0,start_percent:t.start_percent,target_percent:t.target_percent})}_renderUpcoming(){const t=this._scheduleStatus();if(!t)return q;const e=t.upcoming;if(!e)return I`<div class="block upcoming">
        <ha-icon icon="mdi:calendar-clock"></ha-icon>
        <span class="estimate problem">
          ${"disabled"===t.state?"Schedule is off":"Nothing scheduled in the next week"}
        </span>
      </div>`;const i=void 0!==this._pending,s=e.ready_by?`by ${e.ready_by}`:e.intervals.map(t=>`${t.start}–${t.end}`).join(", "),r="octopus"===t.mode?t.octopus_battery_kwh:void 0;if(e.skipped)return I`
        <div class="block upcoming skipped">
          <ha-icon icon="mdi:calendar-remove"></ha-icon>
          <span><strong>${this._dayLabel(e.date)}</strong> ${s}</span>
          <span class="estimate problem">Skipped</span>
          <span class="spacer"></span>
          <button ?disabled=${i} @click=${()=>this._applyUpcoming(e,null)}>Undo</button>
        </div>
      `;const o=this._upcomingPlan(),n="kwh"in o&&(o.kwh!==e.kwh||o.start!==e.start_percent||o.target!==e.target_percent),a=t.run_date===e.date&&["charging","overrun","waiting"].includes(t.state),c=t.octopus?.date===e.date?t.octopus:void 0,l=(t,e)=>I`
      <input
        type="number"
        inputmode="numeric"
        min="0"
        max="100"
        step="1"
        .value=${t}
        @input=${t=>e(t.target.value)}
      />
    `,h=c?`Octopus is set to add ${c.percent}% by ${c.ready_by}.`:e.overridden?`Adjusted for this charge: ${e.kwh} kWh instead of ${e.planned_kwh} kWh.`:`Planned: ${e.kwh} kWh. Change the percentages to adjust just this charge.`;return I`
      <div class="block upcoming" title=${h}>
        <ha-icon icon="mdi:calendar-clock"></ha-icon>
        <span><strong>${this._dayLabel(e.date)}</strong> ${s}</span>
        <label class="field">from ${l(this._upcomingStart,t=>this._upcomingStart=t)} %</label>
        <label class="field">to ${l(this._upcomingTarget,t=>this._upcomingTarget=t)} %</label>
        <span class="estimate ${"problem"in o?"problem":""}">
          ${"problem"in o?o.problem:I`→ <strong>${o.kwh} kWh</strong>${r?I` ·
                    <span title="Octopus is asked to add this % of its ${r} kWh battery">
                      +${Mt(o.kwh,r)}%
                    </span>`:""}`}
        </span>
        ${a?I`<span class="estimate problem">
              ${Zt[t.state]} ${(t.delivered_kwh??0).toFixed(1)}/${e.kwh} kWh
            </span>`:q}
        <span class="spacer"></span>
        ${n?I`<button
              class="primary"
              ?disabled=${i}
              @click=${()=>"kwh"in o&&this._applyUpcoming(e,{kwh:o.kwh,start_percent:o.start,target_percent:o.target})}
            >
              Apply
            </button>`:q}
        ${e.overridden?I`<button
              ?disabled=${i}
              title="Use the weekly plan again"
              @click=${()=>this._applyUpcoming(e,null)}
            >
              Reset
            </button>`:q}
        <button
          class="skip"
          ?disabled=${i}
          title=${r?"Skip this charge. Octopus can't be set below 5%, so it may still add a little; turn smart charging off in the Octopus app to skip completely.":"Skip this charge"}
          @click=${()=>this._skipUpcoming(e)}
        >
          <ha-icon icon="mdi:debug-step-over"></ha-icon>Skip
        </button>
      </div>
    `}_renderModeNote(){const t=this._mode();if(this._octopusMode())return I`<div class="note">
        <ha-icon icon="mdi:information-outline"></ha-icon>Intelligent Octopus Go is in control: a boost from here charges
        at the normal rate, and the zappi stays in ${t??"Eco+"}.
      </div>`;if(void 0===t)return q;const e=this._needsEcoPlus()?"Eco+":t,i=this._needsEcoPlus()?`Switches from ${t} to Eco+ first, then boosts about a minute later. `:"";return"full"===this._preset?i?I`<div class="note"><ha-icon icon="mdi:information-outline"></ha-icon>${i}</div>`:q:this._willStopAfter()?I`<div class="note">
        <ha-icon icon="mdi:information-outline"></ha-icon>${i}Switches to Stopped when it's done, so charging ends at
        the target.
      </div>`:I`<div class="note ${"Eco"===e?"warn":""}">
      <ha-icon icon=${"Eco"===e?"mdi:alert-outline":"mdi:information-outline"}></ha-icon>${i}
      ${"Eco+"===e?"Afterwards it stays in Eco+, so it only carries on from surplus solar.":"Afterwards it carries on charging in Eco, so it won't stop at the target."}
    </div>`}};Gt.styles=Ht,t([pt({attribute:!1})],Gt.prototype,"hass",void 0),t([ut()],Gt.prototype,"_config",void 0),t([ut()],Gt.prototype,"_currentPercent",void 0),t([ut()],Gt.prototype,"_targetPercent",void 0),t([ut()],Gt.prototype,"_preset",void 0),t([ut()],Gt.prototype,"_boostBy",void 0),t([ut()],Gt.prototype,"_pending",void 0),t([ut()],Gt.prototype,"_switchingMode",void 0),t([ut()],Gt.prototype,"_error",void 0),t([ut()],Gt.prototype,"_upcomingStart",void 0),t([ut()],Gt.prototype,"_upcomingTarget",void 0),Gt=t([lt("zappi-card")],Gt),window.customCards=window.customCards||[],window.customCards.push({type:"zappi-card",name:"Zappi Card",description:"Control a myenergi zappi EV charger: charge mode, boost and live status.",preview:!0});export{Gt as ZappiCard};
