function t(t,e,s,i){var r,o=arguments.length,n=o<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,s,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(n=(o<3?r(n):o>3?r(e,s,n):r(e,s))||n);return o>3&&n&&Object.defineProperty(e,s,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,s=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),r=new WeakMap;let o=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(s&&void 0===t){const s=void 0!==e&&1===e.length;s&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&r.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1],t[0]);return new o(s,t,i)},a=s?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:c,defineProperty:h,getOwnPropertyDescriptor:l,getOwnPropertyNames:d,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,_=globalThis,m=_.trustedTypes,g=m?m.emptyScript:"",f=_.reactiveElementPolyfillSupport,y=(t,e)=>t,$={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},v=(t,e)=>!c(t,e),b={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:v};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&h(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:r}=l(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const o=i?.call(this);r?.call(this,e),this.requestUpdate(t,o,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...d(t),...p(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{if(s)t.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const s of i){const i=document.createElement("style"),r=e.litNonce;void 0!==r&&i.setAttribute("nonce",r),i.textContent=s.cssText,t.appendChild(i)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const r=(void 0!==s.converter?.toAttribute?s.converter:$).toAttribute(e,s.type);this._$Em=t,null==r?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:$;this._$Em=i;const o=r.fromAttribute(e,t.type);this[i]=o??this._$Ej?.get(i)??o,this._$Em=null}}requestUpdate(t,e,s,i=!1,r){if(void 0!==t){const o=this.constructor;if(!1===i&&(r=this[t]),s??=o.getPropertyOptions(t),!((s.hasChanged??v)(r,e)||s.useDefault&&s.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,s))))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:r},o){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==r||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t){const{wrapped:t}=s,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,s,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[y("elementProperties")]=new Map,w[y("finalized")]=new Map,f?.({ReactiveElement:w}),(_.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,A=t=>t,S=x.trustedTypes,E=S?S.createPolicy("lit-html",{createHTML:t=>t}):void 0,P="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+k,z=`<${C}>`,O=document,M=()=>O.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,N=Array.isArray,H="[ \t\n\f\r]",T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,B=/-->/g,R=/>/g,j=RegExp(`>|${H}(?:([^\\s"'>=/]+)(${H}*=${H}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),W=/'/g,D=/"/g,I=/^(?:script|style|textarea|title)$/i,F=(t=>(e,...s)=>({_$litType$:t,strings:e,values:s}))(1),L=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),q=new WeakMap,Z=O.createTreeWalker(O,129);function J(t,e){if(!N(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(e):e}const K=(t,e)=>{const s=t.length-1,i=[];let r,o=2===e?"<svg>":3===e?"<math>":"",n=T;for(let e=0;e<s;e++){const s=t[e];let a,c,h=-1,l=0;for(;l<s.length&&(n.lastIndex=l,c=n.exec(s),null!==c);)l=n.lastIndex,n===T?"!--"===c[1]?n=B:void 0!==c[1]?n=R:void 0!==c[2]?(I.test(c[2])&&(r=RegExp("</"+c[2],"g")),n=j):void 0!==c[3]&&(n=j):n===j?">"===c[0]?(n=r??T,h=-1):void 0===c[1]?h=-2:(h=n.lastIndex-c[2].length,a=c[1],n=void 0===c[3]?j:'"'===c[3]?D:W):n===D||n===W?n=j:n===B||n===R?n=T:(n=j,r=void 0);const d=n===j&&t[e+1].startsWith("/>")?" ":"";o+=n===T?s+z:h>=0?(i.push(a),s.slice(0,h)+P+s.slice(h)+k+d):s+k+(-2===h?e:d)}return[J(t,o+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class G{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let r=0,o=0;const n=t.length-1,a=this.parts,[c,h]=K(t,e);if(this.el=G.createElement(c,s),Z.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=Z.nextNode())&&a.length<n;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(P)){const e=h[o++],s=i.getAttribute(t).split(k),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:n[2],strings:s,ctor:"."===n[1]?et:"?"===n[1]?st:"@"===n[1]?it:tt}),i.removeAttribute(t)}else t.startsWith(k)&&(a.push({type:6,index:r}),i.removeAttribute(t));if(I.test(i.tagName)){const t=i.textContent.split(k),e=t.length-1;if(e>0){i.textContent=S?S.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],M()),Z.nextNode(),a.push({type:2,index:++r});i.append(t[e],M())}}}else if(8===i.nodeType)if(i.data===C)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=i.data.indexOf(k,t+1));)a.push({type:7,index:r}),t+=k.length-1}r++}}static createElement(t,e){const s=O.createElement("template");return s.innerHTML=t,s}}function Q(t,e,s=t,i){if(e===L)return e;let r=void 0!==i?s._$Co?.[i]:s._$Cl;const o=U(e)?void 0:e._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(t),r._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=r:s._$Cl=r),void 0!==r&&(e=Q(t,r._$AS(t,e.values),r,i)),e}class X{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??O).importNode(e,!0);Z.currentNode=i;let r=Z.nextNode(),o=0,n=0,a=s[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new Y(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new rt(r,this,t)),this._$AV.push(e),a=s[++n]}o!==a?.index&&(r=Z.nextNode(),o++)}return Z.currentNode=O,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class Y{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),U(t)?t===V||null==t||""===t?(this._$AH!==V&&this._$AR(),this._$AH=V):t!==this._$AH&&t!==L&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>N(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==V&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(O.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=G.createElement(J(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new X(i,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new G(t)),e}k(t){N(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const r of t)i===e.length?e.push(s=new Y(this.O(M()),this.O(M()),this,this.options)):s=e[i],s._$AI(r),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=A(t).nextSibling;A(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,r){this.type=1,this._$AH=V,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=r,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=V}_$AI(t,e=this,s,i){const r=this.strings;let o=!1;if(void 0===r)t=Q(this,t,e,0),o=!U(t)||t!==this._$AH&&t!==L,o&&(this._$AH=t);else{const i=t;let n,a;for(t=r[0],n=0;n<r.length-1;n++)a=Q(this,i[s+n],e,n),a===L&&(a=this._$AH[n]),o||=!U(a)||a!==this._$AH[n],a===V?t=V:t!==V&&(t+=(a??"")+r[n+1]),this._$AH[n]=a}o&&!i&&this.j(t)}j(t){t===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===V?void 0:t}}class st extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==V)}}class it extends tt{constructor(t,e,s,i,r){super(t,e,s,i,r),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??V)===L)return;const s=this._$AH,i=t===V&&s!==V||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==V&&(s===V||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const ot=x.litHtmlPolyfillSupport;ot?.(G,Y),(x.litHtmlVersions??=[]).push("3.3.3");const nt=globalThis;class at extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let r=i._$litPart$;if(void 0===r){const t=s?.renderBefore??null;i._$litPart$=r=new Y(e.insertBefore(M(),t),t,void 0,s??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return L}}at._$litElement$=!0,at.finalized=!0,nt.litElementHydrateSupport?.({LitElement:at});const ct=nt.litElementPolyfillSupport;ct?.({LitElement:at}),(nt.litElementVersions??=[]).push("4.2.2");const ht=t=>(e,s)=>{void 0!==s?s.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},lt={attribute:!0,type:String,converter:$,reflect:!1,hasChanged:v},dt=(t=lt,e,s)=>{const{kind:i,metadata:r}=s;let o=globalThis.litPropertyMetadata.get(r);if(void 0===o&&globalThis.litPropertyMetadata.set(r,o=new Map),"setter"===i&&((t=Object.create(t)).wrapped=!0),o.set(s.name,t),"accessor"===i){const{name:i}=s;return{set(s){const r=e.get.call(this);e.set.call(this,s),this.requestUpdate(i,r,t,!0,s)},init(e){return void 0!==e&&this.C(i,void 0,t,e),e}}}if("setter"===i){const{name:i}=s;return function(s){const r=this[i];e.call(this,s),this.requestUpdate(i,r,t,!0,s)}}throw Error("Unsupported decorator location: "+i)};function pt(t){return(e,s)=>"object"==typeof s?dt(t,e,s):((t,e,s)=>{const i=e.hasOwnProperty(s);return e.constructor.createProperty(s,t),i?Object.getOwnPropertyDescriptor(e,s):void 0})(t,e,s)}function ut(t){return pt({...t,state:!0,attribute:!1})}function _t(t){return"number"==typeof t&&Number.isFinite(t)}function mt(t){const{start_percent:e,kwh:s,end_percent:i}=t??{},r=[e,s,i].filter(_t).length;return 0===r?{status:"empty"}:r<3?{status:"incomplete"}:e<0||i>100?{status:"invalid",reason:"Percentages must be 0–100"}:i<=e?{status:"invalid",reason:"After must be higher than before"}:s<=0?{status:"invalid",reason:"kWh must be positive"}:{status:"ok",kwhPerPercent:s/(i-e)}}function gt(t=[]){const e=t.map(mt).flatMap(t=>"ok"===t.status?[t.kwhPerPercent]:[]);return e.length?{kwhPerPercent:e.reduce((t,e)=>t+e,0)/e.length,samples:e.length}:{samples:0}}const ft=["_status"],yt=["_plug_status"],$t=["_power_ct_internal_load"],vt=["_charge_added_session"],bt=["_power_ct_grid"],wt=["_power_ct_generation"],xt=["_power_grid"],At=["_power_generation"],St=["_home_consumption"];function Et(t,e,s=[]){for(const i of e){const e=t.find(t=>t.endsWith(i)&&!s.some(e=>t.endsWith(e)));if(e)return e}}function Pt(t){return Object.keys(t.states).find(e=>e.startsWith("select.")&&e.endsWith("_charge_mode")&&"myenergi"===t.entities?.[e]?.platform)}const kt=n`
  :host {
    --zappi-accent: var(--primary-color);
    --zappi-solar: var(--energy-solar-color, #ff9800);
    --zappi-grid: var(--energy-grid-consumption-color, #488fc2);
    --zappi-export: var(--energy-grid-return-color, #8353d1);
    --zappi-home: var(--primary-text-color);
    --zappi-car: var(--success-color, #43a047);
  }
  ha-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .title {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 0.85rem;
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
    white-space: nowrap;
  }
  .chip ha-icon {
    --mdc-icon-size: 18px;
  }
  .chip.active {
    background: color-mix(in srgb, var(--zappi-car) 20%, transparent);
    color: var(--zappi-car);
  }
  .chip.fault {
    background: color-mix(in srgb, var(--error-color) 20%, transparent);
    color: var(--error-color);
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 8px;
  }
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px;
    border-radius: 12px;
    background: var(--secondary-background-color);
    cursor: pointer;
  }
  .stat ha-icon {
    --mdc-icon-size: 22px;
  }
  .stat .value {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .stat .label {
    font-size: 0.75rem;
    color: var(--secondary-text-color);
  }
  .section-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--secondary-text-color);
    margin-bottom: 6px;
  }
  .modes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
    gap: 8px;
  }
  button {
    font: inherit;
    border: none;
    border-radius: 12px;
    padding: 10px 8px;
    cursor: pointer;
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    transition: background 0.15s, color 0.15s;
  }
  button:hover:not(:disabled) {
    background: color-mix(in srgb, var(--zappi-accent) 15%, var(--secondary-background-color));
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  button.selected {
    background: var(--zappi-accent);
    color: var(--text-primary-color, #fff);
  }
  button.danger {
    color: var(--error-color);
  }
  button ha-icon {
    --mdc-icon-size: 22px;
  }
  .boost {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .boost-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .boost-row button {
    flex-direction: row;
    padding: 8px 14px;
  }
  .field {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--secondary-text-color);
    font-size: 0.9rem;
  }
  input {
    font: inherit;
    width: 72px;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
    color: var(--primary-text-color);
  }
  input[type="number"] {
    width: 56px;
  }
  input[type="time"] {
    width: auto;
  }
  input:disabled {
    opacity: 0.6;
  }
  .estimate {
    font-size: 0.9rem;
    color: var(--primary-text-color);
  }
  .estimate.problem {
    color: var(--secondary-text-color);
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
`,Ct=(t,e)=>({name:t,selector:{entity:{filter:{domain:"sensor",integration:"myenergi",...e&&{device_class:e}}}}}),zt=[{name:"entity",required:!0,selector:{entity:{filter:{domain:"select",integration:"myenergi"}}}},{type:"expandable",name:"",flatten:!0,title:"Entity overrides (auto-detected when empty)",schema:[Ct("status_entity"),Ct("plug_status_entity"),Ct("charge_power_entity","power"),Ct("session_energy_entity","energy"),Ct("grid_power_entity","power"),Ct("solar_power_entity","power"),Ct("home_power_entity","power")]}],Ot=[{name:"name",selector:{text:{}}},{type:"grid",name:"",schema:[{name:"show_power_flow",selector:{boolean:{}}},{name:"show_boost",selector:{boolean:{}}}]}],Mt={entity:"Charge mode entity",name:"Name",show_power_flow:"Show solar / grid / home power",show_boost:"Show boost controls",status_entity:"Status",plug_status_entity:"Plug status",charge_power_entity:"Charge power",session_energy_entity:"Session energy",grid_power_entity:"Grid power",solar_power_entity:"Solar power",home_power_entity:"Home power"};let Ut=class extends at{setConfig(t){this._config={show_power_flow:!0,show_boost:!0,...t}}render(){return this.hass&&this._config?F`
      <div class="section">
        <h3>Charger</h3>
        ${this._renderForm(zt)}
      </div>
      <div class="section">
        <h3>Display</h3>
        ${this._renderForm(Ot)}
      </div>
      ${this._renderBatteryHealth()} ${this._renderCalibration()}
    `:V}_renderBatteryHealth(){const t=(t,e,s)=>F`
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
        <span class="hint">${s}</span>
      </label>
    `;return F`
      <div class="section">
        <h3>Battery health</h3>
        <div class="health">
          ${t("battery_soh_percent","Last read SOH","From the car or an OBD reader. Stored for later calculations.")}
          ${t("max_charge_percent","Max charge allowed","Charges stop here unless you pick 100% on the card.")}
        </div>
      </div>
    `}_percentChanged(t,e){const s=""===e?void 0:Number(e),i=void 0!==s&&Number.isFinite(s)&&s>=1&&s<=100;this._emit({...this._config,[t]:i?s:void 0})}_renderForm(t){return F`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${t}
        .computeLabel=${t=>Mt[t.name]??t.title??t.name}
        @value-changed=${t=>this._emit(t.detail.value)}
      ></ha-form>
    `}_renderCalibration(){const t=this._config.calibration??[],e=gt(t);return F`
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
          ${Array.from({length:5},(e,s)=>this._renderSlot(s,t[s]))}
        </div>
        <div class="summary">
          ${void 0!==e.kwhPerPercent?F`
                <strong>${e.kwhPerPercent.toFixed(3)} kWh per %</strong>
                from ${e.samples} ${1===e.samples?"charge":"charges"}
                · ≈ ${(100*e.kwhPerPercent).toFixed(1)} kWh for 0–100%
              `:F`Fill in at least one complete row to calibrate.`}
        </div>
      </div>
    `}_renderSlot(t,e={}){const s=mt(e),i=(s,i,r)=>F`
      <input
        type="number"
        inputmode="decimal"
        min="0"
        max=${r}
        step=${i}
        .value=${void 0===e[s]?"":String(e[s])}
        @change=${e=>this._slotChanged(t,s,e.target.value)}
      />
    `;return F`
      <span class="index">${t+1}</span>
      ${i("start_percent","1","100")} ${i("kwh","0.1","200")} ${i("end_percent","1","100")}
      <span class="result ${s.status}" title=${"invalid"===s.status?s.reason:""}>
        ${"ok"===s.status?s.kwhPerPercent.toFixed(3):"invalid"===s.status?"⚠":"–"}
      </span>
    `}_slotChanged(t,e,s){const i=Array.from({length:5},(t,e)=>({...this._config.calibration?.[e]})),r=""===s?void 0:Number(s);void 0!==r&&Number.isFinite(r)?i[t][e]=r:delete i[t][e];const o=i.filter(t=>Object.keys(t).length>0);this._emit({...this._config,calibration:o.length?o:void 0})}_emit(t){const e={...t};for(const[t,s]of Object.entries(e))""!==s&&void 0!==s||delete e[t];this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}};Ut.styles=n`
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
  `,t([pt({attribute:!1})],Ut.prototype,"hass",void 0),t([ut()],Ut.prototype,"_config",void 0),Ut=t([ht("zappi-card-editor")],Ut);const Nt={Fast:"mdi:lightning-bolt",Eco:"mdi:leaf","Eco+":"mdi:solar-power",Stopped:"mdi:stop-circle-outline"},Ht=["unavailable","unknown"];console.info("%c ZAPPI-CARD %c 0.1.0 ","color: white; background: #43a047","");let Tt=class extends at{constructor(){super(...arguments),this._currentPercent="",this._targetPercent="",this._preset="custom",this._boostBy="07:00"}static getConfigElement(){return document.createElement("zappi-card-editor")}static getStubConfig(t){return{entity:Pt(t)??""}}setConfig(t){if(!t.entity)throw new Error("Set 'entity' to the myenergi zappi charge mode select entity");this._config={show_power_flow:!0,show_boost:!0,...t},this._kwhPerPercent=gt(t.calibration).kwhPerPercent,"max"===this._preset&&void 0===t.max_charge_percent&&(this._preset="custom"),this._entities=void 0}getCardSize(){return 6}willUpdate(t){this.hass&&(t.has("hass")||t.has("_config"))&&(this._entities&&this.hass.entities===this._registry||(this._registry=this.hass.entities,this._entities=function(t,e){const s=t.entities??{},i=s[e.entity]?.device_id,r=Object.values(s).filter(t=>"myenergi"===t.platform&&t.entity_id.startsWith("sensor.")).filter(e=>e.entity_id in t.states),o=r.filter(t=>i&&t.device_id===i).map(t=>t.entity_id),n=r.filter(t=>!i||t.device_id!==i).map(t=>t.entity_id),a={status:Et(o,ft,["_plug_status"]),plug_status:Et(o,yt),charge_power:Et(o,$t),session_energy:Et(o,vt),grid_power:Et(n,xt)??Et(o,bt),solar_power:Et(n,At)??Et(o,wt),home_power:Et(n,St)};return{mode:e.entity,status:e.status_entity??a.status,plug_status:e.plug_status_entity??a.plug_status,charge_power:e.charge_power_entity??a.charge_power,session_energy:e.session_energy_entity??a.session_energy,grid_power:e.grid_power_entity??a.grid_power,solar_power:e.solar_power_entity??a.solar_power,home_power:e.home_power_entity??a.home_power}}(this.hass,this._config)))}_state(t){if(!t)return;const e=this.hass.states[t]?.state;return void 0===e||Ht.includes(e)?void 0:e}_number(t){const e=Number(this._state(t));return Number.isFinite(e)?e:void 0}async _call(t,e){this._pending=t,this._error=void 0;try{await e()}catch(t){this._error=t?.message??String(t)}finally{this._pending=void 0}}_setMode(t){this._call(`mode-${t}`,()=>this.hass.callService("select","select_option",{option:t},{entity_id:this._config.entity}))}_parsePercent(t){if(""===t.trim())return;const e=Number(t);return Number.isFinite(e)?e:void 0}_targetValue(){const t=this._config.max_charge_percent;return"max"===this._preset?t:"full"===this._preset?100:this._parsePercent(this._targetPercent)??t??100}_boostPlan(){const t=this._config.max_charge_percent,e=this._parsePercent(this._currentPercent),s=this._targetValue();if(void 0===this._kwhPerPercent)return{problem:"Add calibration charges in the card settings to estimate kWh."};if(void 0===e)return{problem:"Enter the current battery %."};if(e<0||e>100||void 0===s||s<0||s>100)return{problem:"Percentages must be between 0 and 100."};if("custom"===this._preset&&void 0!==t&&s>t)return{problem:`Target is above the max allowed (${t}%).`};if(s<=e)return{problem:"Target must be higher than the current %."};const i=Math.ceil((r=this._kwhPerPercent,o=e,n=s,Math.max(0,n-o)*r));var r,o,n;return{kwh:Math.min(99,Math.max(1,i)),from:e,to:s}}_togglePreset(t){this._preset=this._preset===t?"custom":t}_boost(t){this._call("boost",()=>this.hass.callService("myenergi","myenergi_boost",{amount:t},{entity_id:this._config.entity}))}_smartBoost(t){this._call("smart-boost",()=>this.hass.callService("myenergi","myenergi_smart_boost",{amount:t,when:this._boostBy.slice(0,5)},{entity_id:this._config.entity}))}_stopBoost(){this._call("stop-boost",()=>this.hass.callService("myenergi","myenergi_stop_boost",{},{entity_id:this._config.entity}))}_moreInfo(t){t&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}render(){if(!this._config||!this.hass||!this._entities)return V;const t=this.hass.states[this._config.entity];if(!t)return F`<ha-card><div class="warning">Entity not found: ${this._config.entity}</div></ha-card>`;const e=this._config.name??t.attributes.friendly_name?.replace(/ charge mode$/i,"")??"Zappi";return F`
      <ha-card>
        <div class="header">
          <span class="title">${e}</span>
          ${this._renderStatusChip()}
        </div>
        ${this._renderStats()}
        ${this._renderModes(t.state,t.attributes.options)}
        ${this._config.show_boost?this._renderBoost():V}
        ${this._error?F`<div class="error">${this._error}</div>`:V}
      </ha-card>
    `}_renderStatusChip(){const t=this._entities,e=this._state(t.status),s=this._state(t.plug_status),i="Charging"===e||"Boosting"===e,r="Fault"===s;return F`
      <span
        class="chip ${i?"active":""} ${r?"fault":""}"
        @click=${()=>this._moreInfo(t.plug_status??t.status)}
      >
        <ha-icon .icon=${r?"mdi:alert-circle":"Boosting"===e?"mdi:rocket-launch":i?"mdi:ev-station":"EV Disconnected"===s?"mdi:power-plug-off":"mdi:power-plug"}></ha-icon>${i||!s?e??"Unknown":s}
      </span>
    `}_formatPower(t){return Math.abs(t)>=1e3?`${(t/1e3).toFixed(2)} kW`:`${Math.round(t)} W`}_renderStat(t,e,s,i,r){return F`
      <div class="stat" @click=${()=>this._moreInfo(t)}>
        <ha-icon .icon=${e} style="color: ${r}"></ha-icon>
        <span class="value">${i}</span>
        <span class="label">${s}</span>
      </div>
    `}_renderStats(){const t=this._entities,e=this._number(t.charge_power),s=this._number(t.session_energy),i=this._number(t.grid_power),r=this._number(t.solar_power),o=this._number(t.home_power),n=this._config.show_power_flow;return F`
      <div class="stats">
        ${void 0!==e?this._renderStat(t.charge_power,"mdi:car-electric","Charging",this._formatPower(e),"var(--zappi-car)"):V}
        ${void 0!==s?this._renderStat(t.session_energy,"mdi:battery-charging","Session",`${s.toFixed(1)} kWh`,"var(--zappi-car)"):V}
        ${n&&void 0!==r?this._renderStat(t.solar_power,"mdi:solar-power-variant","Solar",this._formatPower(r),"var(--zappi-solar)"):V}
        ${n&&void 0!==i?this._renderStat(t.grid_power,i<0?"mdi:transmission-tower-import":"mdi:transmission-tower-export",i<0?"Exporting":"Importing",this._formatPower(Math.abs(i)),i<0?"var(--zappi-export)":"var(--zappi-grid)"):V}
        ${n&&void 0!==o?this._renderStat(t.home_power,"mdi:home-lightning-bolt","Home",this._formatPower(o),"var(--zappi-home)"):V}
      </div>
    `}_renderModes(t,e=Object.keys(Nt)){return F`
      <div>
        <div class="section-label">Charge mode</div>
        <div class="modes">
          ${e.map(e=>F`
              <button
                class=${e===t?"selected":""}
                ?disabled=${void 0!==this._pending}
                @click=${()=>e!==t&&this._setMode(e)}
              >
                <ha-icon .icon=${Nt[e]??"mdi:ev-station"}></ha-icon>
                ${e}
              </button>
            `)}
        </div>
      </div>
    `}_renderBoost(){const t=void 0!==this._pending,e=this._config.max_charge_percent,s=this._boostPlan(),i="kwh"in s?s.kwh:void 0,r="custom"===this._preset?void 0:this._targetValue(),o=(t,e,s="",i=!1)=>F`
      <input
        type="number"
        inputmode="numeric"
        min="0"
        max="100"
        step="1"
        placeholder=${s}
        ?disabled=${i}
        .value=${t}
        @input=${t=>e(t.target.value)}
      />
    `;return F`
      <div class="boost">
        <div class="section-label">Boost</div>
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
            class=${"max"===this._preset?"selected":""}
            ?disabled=${void 0===e}
            title=${void 0===e?"Set the max charge % in the card settings":`Charge to ${e}%`}
            @click=${()=>this._togglePreset("max")}
          >
            Max allowed${void 0!==e?` (${e}%)`:""}
          </button>
          <button class=${"full"===this._preset?"selected":""} @click=${()=>this._togglePreset("full")}>
            100%
          </button>
        </div>
        <div class="estimate ${"problem"in s?"problem":""}">
          ${"problem"in s?s.problem:F`≈ <strong>${s.kwh} kWh</strong> to charge from ${s.from}% to ${s.to}%`}
        </div>
        <div class="boost-row">
          <button ?disabled=${t||void 0===i} @click=${()=>i&&this._boost(i)}>
            <ha-icon icon="mdi:rocket-launch"></ha-icon>Boost now
          </button>
        </div>
        <div class="boost-row">
          <label class="field">
            Ready by
            <input
              type="time"
              step="900"
              .value=${this._boostBy}
              @change=${t=>this._boostBy=t.target.value}
            />
          </label>
          <button
            ?disabled=${t||void 0===i||!this._boostBy}
            @click=${()=>i&&this._smartBoost(i)}
          >
            <ha-icon icon="mdi:clock-fast"></ha-icon>Smart boost
          </button>
          <!-- Always offered: a scheduled smart boost reports "Paused", not "Boosting". -->
          <button class="danger" ?disabled=${t} @click=${this._stopBoost}>
            <ha-icon icon="mdi:stop"></ha-icon>Stop boost
          </button>
        </div>
      </div>
    `}};Tt.styles=kt,t([pt({attribute:!1})],Tt.prototype,"hass",void 0),t([ut()],Tt.prototype,"_config",void 0),t([ut()],Tt.prototype,"_currentPercent",void 0),t([ut()],Tt.prototype,"_targetPercent",void 0),t([ut()],Tt.prototype,"_preset",void 0),t([ut()],Tt.prototype,"_boostBy",void 0),t([ut()],Tt.prototype,"_pending",void 0),t([ut()],Tt.prototype,"_error",void 0),Tt=t([ht("zappi-card")],Tt),window.customCards=window.customCards||[],window.customCards.push({type:"zappi-card",name:"Zappi Card",description:"Control a myenergi zappi EV charger: charge mode, boost and live status.",preview:!0});export{Tt as ZappiCard};
