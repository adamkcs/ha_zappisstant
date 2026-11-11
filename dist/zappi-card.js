function t(t,e,s,i){var o,r=arguments.length,n=r<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,s,i);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(n=(r<3?o(n):r>3?o(e,s,n):o(e,s))||n);return r>3&&n&&Object.defineProperty(e,s,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,s=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),o=new WeakMap;let r=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(s&&void 0===t){const s=void 0!==e&&1===e.length;s&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&o.set(e,t))}return t}toString(){return this.cssText}};const n=s?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:a,defineProperty:c,getOwnPropertyDescriptor:h,getOwnPropertyNames:l,getOwnPropertySymbols:d,getPrototypeOf:p}=Object,_=globalThis,u=_.trustedTypes,g=u?u.emptyScript:"",m=_.reactiveElementPolyfillSupport,f=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},$=(t,e)=>!a(t,e),b={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let v=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&c(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:o}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const r=i?.call(this);o?.call(this,e),this.requestUpdate(t,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const t=this.properties,e=[...l(t),...d(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(n(t))}else void 0!==t&&e.push(n(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{if(s)t.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const s of i){const i=document.createElement("style"),o=e.litNonce;void 0!==o&&i.setAttribute("nonce",o),i.textContent=s.cssText,t.appendChild(i)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const o=(void 0!==s.converter?.toAttribute?s.converter:y).toAttribute(e,s.type);this._$Em=t,null==o?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=i;const r=o.fromAttribute(e,t.type);this[i]=r??this._$Ej?.get(i)??r,this._$Em=null}}requestUpdate(t,e,s,i=!1,o){if(void 0!==t){const r=this.constructor;if(!1===i&&(o=this[t]),s??=r.getPropertyOptions(t),!((s.hasChanged??$)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,s))))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:o},r){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==o||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t){const{wrapped:t}=s,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,s,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[f("elementProperties")]=new Map,v[f("finalized")]=new Map,m?.({ReactiveElement:v}),(_.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,A=t=>t,x=w.trustedTypes,S=x?x.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,P="?"+C,k=`<${P}>`,z=document,O=()=>z.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,M=Array.isArray,H="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,T=/>/g,B=RegExp(`>|${H}(?:([^\\s"'>=/]+)(${H}*=${H}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,D=/"/g,I=/^(?:script|style|textarea|title)$/i,W=(t=>(e,...s)=>({_$litType$:t,strings:e,values:s}))(1),L=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),q=new WeakMap,V=z.createTreeWalker(z,129);function F(t,e){if(!M(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const Z=(t,e)=>{const s=t.length-1,i=[];let o,r=2===e?"<svg>":3===e?"<math>":"",n=N;for(let e=0;e<s;e++){const s=t[e];let a,c,h=-1,l=0;for(;l<s.length&&(n.lastIndex=l,c=n.exec(s),null!==c);)l=n.lastIndex,n===N?"!--"===c[1]?n=R:void 0!==c[1]?n=T:void 0!==c[2]?(I.test(c[2])&&(o=RegExp("</"+c[2],"g")),n=B):void 0!==c[3]&&(n=B):n===B?">"===c[0]?(n=o??N,h=-1):void 0===c[1]?h=-2:(h=n.lastIndex-c[2].length,a=c[1],n=void 0===c[3]?B:'"'===c[3]?D:j):n===D||n===j?n=B:n===R||n===T?n=N:(n=B,o=void 0);const d=n===B&&t[e+1].startsWith("/>")?" ":"";r+=n===N?s+k:h>=0?(i.push(a),s.slice(0,h)+E+s.slice(h)+C+d):s+C+(-2===h?e:d)}return[F(t,r+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class J{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let o=0,r=0;const n=t.length-1,a=this.parts,[c,h]=Z(t,e);if(this.el=J.createElement(c,s),V.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=V.nextNode())&&a.length<n;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(E)){const e=h[r++],s=i.getAttribute(t).split(C),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:o,name:n[2],strings:s,ctor:"."===n[1]?tt:"?"===n[1]?et:"@"===n[1]?st:Y}),i.removeAttribute(t)}else t.startsWith(C)&&(a.push({type:6,index:o}),i.removeAttribute(t));if(I.test(i.tagName)){const t=i.textContent.split(C),e=t.length-1;if(e>0){i.textContent=x?x.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],O()),V.nextNode(),a.push({type:2,index:++o});i.append(t[e],O())}}}else if(8===i.nodeType)if(i.data===P)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=i.data.indexOf(C,t+1));)a.push({type:7,index:o}),t+=C.length-1}o++}}static createElement(t,e){const s=z.createElement("template");return s.innerHTML=t,s}}function G(t,e,s=t,i){if(e===L)return e;let o=void 0!==i?s._$Co?.[i]:s._$Cl;const r=U(e)?void 0:e._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(!1),void 0===r?o=void 0:(o=new r(t),o._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=o:s._$Cl=o),void 0!==o&&(e=G(t,o._$AS(t,e.values),o,i)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??z).importNode(e,!0);V.currentNode=i;let o=V.nextNode(),r=0,n=0,a=s[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new X(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new it(o,this,t)),this._$AV.push(e),a=s[++n]}r!==a?.index&&(o=V.nextNode(),r++)}return V.currentNode=z,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=G(this,t,e),U(t)?t===K||null==t||""===t?(this._$AH!==K&&this._$AR(),this._$AH=K):t!==this._$AH&&t!==L&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>M(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==K&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(z.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=J.createElement(F(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new Q(i,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new J(t)),e}k(t){M(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const o of t)i===e.length?e.push(s=new X(this.O(O()),this.O(O()),this,this.options)):s=e[i],s._$AI(o),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=A(t).nextSibling;A(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class Y{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,o){this.type=1,this._$AH=K,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=K}_$AI(t,e=this,s,i){const o=this.strings;let r=!1;if(void 0===o)t=G(this,t,e,0),r=!U(t)||t!==this._$AH&&t!==L,r&&(this._$AH=t);else{const i=t;let n,a;for(t=o[0],n=0;n<o.length-1;n++)a=G(this,i[s+n],e,n),a===L&&(a=this._$AH[n]),r||=!U(a)||a!==this._$AH[n],a===K?t=K:t!==K&&(t+=(a??"")+o[n+1]),this._$AH[n]=a}r&&!i&&this.j(t)}j(t){t===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class tt extends Y{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===K?void 0:t}}class et extends Y{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==K)}}class st extends Y{constructor(t,e,s,i,o){super(t,e,s,i,o),this.type=5}_$AI(t,e=this){if((t=G(this,t,e,0)??K)===L)return;const s=this._$AH,i=t===K&&s!==K||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==K&&(s===K||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class it{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}const ot=w.litHtmlPolyfillSupport;ot?.(J,X),(w.litHtmlVersions??=[]).push("3.3.3");const rt=globalThis;class nt extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let o=i._$litPart$;if(void 0===o){const t=s?.renderBefore??null;i._$litPart$=o=new X(e.insertBefore(O(),t),t,void 0,s??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return L}}nt._$litElement$=!0,nt.finalized=!0,rt.litElementHydrateSupport?.({LitElement:nt});const at=rt.litElementPolyfillSupport;at?.({LitElement:nt}),(rt.litElementVersions??=[]).push("4.2.2");const ct=t=>(e,s)=>{void 0!==s?s.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},ht={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:$},lt=(t=ht,e,s)=>{const{kind:i,metadata:o}=s;let r=globalThis.litPropertyMetadata.get(o);if(void 0===r&&globalThis.litPropertyMetadata.set(o,r=new Map),"setter"===i&&((t=Object.create(t)).wrapped=!0),r.set(s.name,t),"accessor"===i){const{name:i}=s;return{set(s){const o=e.get.call(this);e.set.call(this,s),this.requestUpdate(i,o,t,!0,s)},init(e){return void 0!==e&&this.C(i,void 0,t,e),e}}}if("setter"===i){const{name:i}=s;return function(s){const o=this[i];e.call(this,s),this.requestUpdate(i,o,t,!0,s)}}throw Error("Unsupported decorator location: "+i)};function dt(t){return(e,s)=>"object"==typeof s?lt(t,e,s):((t,e,s)=>{const i=e.hasOwnProperty(s);return e.constructor.createProperty(s,t),i?Object.getOwnPropertyDescriptor(e,s):void 0})(t,e,s)}function pt(t){return dt({...t,state:!0,attribute:!1})}const _t=["_status"],ut=["_plug_status"],gt=["_power_ct_internal_load"],mt=["_charge_added_session"],ft=["_power_ct_grid"],yt=["_power_ct_generation"],$t=["_power_grid"],bt=["_power_generation"],vt=["_home_consumption"];function wt(t,e,s=[]){for(const i of e){const e=t.find(t=>t.endsWith(i)&&!s.some(e=>t.endsWith(e)));if(e)return e}}function At(t){return Object.keys(t.states).find(e=>e.startsWith("select.")&&e.endsWith("_charge_mode")&&"myenergi"===t.entities?.[e]?.platform)}const xt=((t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1],t[0]);return new r(s,t,i)})`
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
  input[type="time"] {
    width: auto;
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
`,St=(t,e)=>({name:t,selector:{entity:{filter:{domain:"sensor",integration:"myenergi",...e&&{device_class:e}}}}}),Et=[{name:"entity",required:!0,selector:{entity:{filter:{domain:"select",integration:"myenergi"}}}},{name:"name",selector:{text:{}}},{type:"grid",name:"",schema:[{name:"show_power_flow",selector:{boolean:{}}},{name:"show_boost",selector:{boolean:{}}}]},{name:"default_boost_kwh",selector:{number:{min:1,max:99,mode:"box",unit_of_measurement:"kWh"}}},{type:"expandable",name:"",flatten:!0,title:"Entity overrides (auto-detected when empty)",schema:[St("status_entity"),St("plug_status_entity"),St("charge_power_entity","power"),St("session_energy_entity","energy"),St("grid_power_entity","power"),St("solar_power_entity","power"),St("home_power_entity","power")]}],Ct={entity:"Charge mode entity",name:"Name",show_power_flow:"Show solar / grid / home power",show_boost:"Show boost controls",default_boost_kwh:"Default boost amount",status_entity:"Status",plug_status_entity:"Plug status",charge_power_entity:"Charge power",session_energy_entity:"Session energy",grid_power_entity:"Grid power",solar_power_entity:"Solar power",home_power_entity:"Home power"};let Pt=class extends nt{setConfig(t){this._config={show_power_flow:!0,show_boost:!0,...t}}render(){return this.hass&&this._config?W`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${Et}
        .computeLabel=${t=>Ct[t.name]??t.title??t.name}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `:K}_valueChanged(t){const e={...t.detail.value};for(const[t,s]of Object.entries(e))""!==s&&void 0!==s||delete e[t];this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}};t([dt({attribute:!1})],Pt.prototype,"hass",void 0),t([pt()],Pt.prototype,"_config",void 0),Pt=t([ct("zappi-card-editor")],Pt);const kt={Fast:"mdi:lightning-bolt",Eco:"mdi:leaf","Eco+":"mdi:solar-power",Stopped:"mdi:stop-circle-outline"},zt=["unavailable","unknown"];console.info("%c ZAPPI-CARD %c 0.1.0 ","color: white; background: #43a047","");let Ot=class extends nt{constructor(){super(...arguments),this._boostKwh=10,this._boostBy="07:00"}static getConfigElement(){return document.createElement("zappi-card-editor")}static getStubConfig(t){return{entity:At(t)??""}}setConfig(t){if(!t.entity)throw new Error("Set 'entity' to the myenergi zappi charge mode select entity");this._config={show_power_flow:!0,show_boost:!0,...t},this._boostKwh=t.default_boost_kwh??this._boostKwh,this._entities=void 0}getCardSize(){return 6}willUpdate(t){this.hass&&(t.has("hass")||t.has("_config"))&&(this._entities&&this.hass.entities===this._registry||(this._registry=this.hass.entities,this._entities=function(t,e){const s=t.entities??{},i=s[e.entity]?.device_id,o=Object.values(s).filter(t=>"myenergi"===t.platform&&t.entity_id.startsWith("sensor.")).filter(e=>e.entity_id in t.states),r=o.filter(t=>i&&t.device_id===i).map(t=>t.entity_id),n=o.filter(t=>!i||t.device_id!==i).map(t=>t.entity_id),a={status:wt(r,_t,["_plug_status"]),plug_status:wt(r,ut),charge_power:wt(r,gt),session_energy:wt(r,mt),grid_power:wt(n,$t)??wt(r,ft),solar_power:wt(n,bt)??wt(r,yt),home_power:wt(n,vt)};return{mode:e.entity,status:e.status_entity??a.status,plug_status:e.plug_status_entity??a.plug_status,charge_power:e.charge_power_entity??a.charge_power,session_energy:e.session_energy_entity??a.session_energy,grid_power:e.grid_power_entity??a.grid_power,solar_power:e.solar_power_entity??a.solar_power,home_power:e.home_power_entity??a.home_power}}(this.hass,this._config)))}_state(t){if(!t)return;const e=this.hass.states[t]?.state;return void 0===e||zt.includes(e)?void 0:e}_number(t){const e=Number(this._state(t));return Number.isFinite(e)?e:void 0}async _call(t,e){this._pending=t,this._error=void 0;try{await e()}catch(t){this._error=t?.message??String(t)}finally{this._pending=void 0}}_setMode(t){this._call(`mode-${t}`,()=>this.hass.callService("select","select_option",{option:t},{entity_id:this._config.entity}))}_boost(){this._call("boost",()=>this.hass.callService("myenergi","myenergi_boost",{amount:this._boostKwh},{entity_id:this._config.entity}))}_smartBoost(){this._call("smart-boost",()=>this.hass.callService("myenergi","myenergi_smart_boost",{amount:this._boostKwh,when:this._boostBy.slice(0,5)},{entity_id:this._config.entity}))}_stopBoost(){this._call("stop-boost",()=>this.hass.callService("myenergi","myenergi_stop_boost",{},{entity_id:this._config.entity}))}_moreInfo(t){t&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}render(){if(!this._config||!this.hass||!this._entities)return K;const t=this.hass.states[this._config.entity];if(!t)return W`<ha-card><div class="warning">Entity not found: ${this._config.entity}</div></ha-card>`;const e=this._config.name??t.attributes.friendly_name?.replace(/ charge mode$/i,"")??"Zappi";return W`
      <ha-card>
        <div class="header">
          <span class="title">${e}</span>
          ${this._renderStatusChip()}
        </div>
        ${this._renderStats()}
        ${this._renderModes(t.state,t.attributes.options)}
        ${this._config.show_boost?this._renderBoost():K}
        ${this._error?W`<div class="error">${this._error}</div>`:K}
      </ha-card>
    `}_renderStatusChip(){const t=this._entities,e=this._state(t.status),s=this._state(t.plug_status),i="Charging"===e||"Boosting"===e,o="Fault"===s;return W`
      <span
        class="chip ${i?"active":""} ${o?"fault":""}"
        @click=${()=>this._moreInfo(t.plug_status??t.status)}
      >
        <ha-icon .icon=${o?"mdi:alert-circle":"Boosting"===e?"mdi:rocket-launch":i?"mdi:ev-station":"EV Disconnected"===s?"mdi:power-plug-off":"mdi:power-plug"}></ha-icon>${i||!s?e??"Unknown":s}
      </span>
    `}_formatPower(t){return Math.abs(t)>=1e3?`${(t/1e3).toFixed(2)} kW`:`${Math.round(t)} W`}_renderStat(t,e,s,i,o){return W`
      <div class="stat" @click=${()=>this._moreInfo(t)}>
        <ha-icon .icon=${e} style="color: ${o}"></ha-icon>
        <span class="value">${i}</span>
        <span class="label">${s}</span>
      </div>
    `}_renderStats(){const t=this._entities,e=this._number(t.charge_power),s=this._number(t.session_energy),i=this._number(t.grid_power),o=this._number(t.solar_power),r=this._number(t.home_power),n=this._config.show_power_flow;return W`
      <div class="stats">
        ${void 0!==e?this._renderStat(t.charge_power,"mdi:car-electric","Charging",this._formatPower(e),"var(--zappi-car)"):K}
        ${void 0!==s?this._renderStat(t.session_energy,"mdi:battery-charging","Session",`${s.toFixed(1)} kWh`,"var(--zappi-car)"):K}
        ${n&&void 0!==o?this._renderStat(t.solar_power,"mdi:solar-power-variant","Solar",this._formatPower(o),"var(--zappi-solar)"):K}
        ${n&&void 0!==i?this._renderStat(t.grid_power,i<0?"mdi:transmission-tower-import":"mdi:transmission-tower-export",i<0?"Exporting":"Importing",this._formatPower(Math.abs(i)),i<0?"var(--zappi-export)":"var(--zappi-grid)"):K}
        ${n&&void 0!==r?this._renderStat(t.home_power,"mdi:home-lightning-bolt","Home",this._formatPower(r),"var(--zappi-home)"):K}
      </div>
    `}_renderModes(t,e=Object.keys(kt)){return W`
      <div>
        <div class="section-label">Charge mode</div>
        <div class="modes">
          ${e.map(e=>W`
              <button
                class=${e===t?"selected":""}
                ?disabled=${void 0!==this._pending}
                @click=${()=>e!==t&&this._setMode(e)}
              >
                <ha-icon .icon=${kt[e]??"mdi:ev-station"}></ha-icon>
                ${e}
              </button>
            `)}
        </div>
      </div>
    `}_renderBoost(){const t=void 0!==this._pending,e=this._boostKwh>=1&&this._boostKwh<=99;return W`
      <div class="boost">
        <div class="section-label">Boost</div>
        <div class="boost-row">
          <label class="field">
            <input
              type="number"
              min="1"
              max="99"
              step="1"
              .value=${String(this._boostKwh)}
              @change=${t=>this._boostKwh=Number(t.target.value)}
            />
            kWh
          </label>
          <button ?disabled=${t||!e} @click=${this._boost}>
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
          <button ?disabled=${t||!e||!this._boostBy} @click=${this._smartBoost}>
            <ha-icon icon="mdi:clock-fast"></ha-icon>Smart boost
          </button>
          <!-- Always offered: a scheduled smart boost reports "Paused", not "Boosting". -->
          <button class="danger" ?disabled=${t} @click=${this._stopBoost}>
            <ha-icon icon="mdi:stop"></ha-icon>Stop boost
          </button>
        </div>
      </div>
    `}};Ot.styles=xt,t([dt({attribute:!1})],Ot.prototype,"hass",void 0),t([pt()],Ot.prototype,"_config",void 0),t([pt()],Ot.prototype,"_boostKwh",void 0),t([pt()],Ot.prototype,"_boostBy",void 0),t([pt()],Ot.prototype,"_pending",void 0),t([pt()],Ot.prototype,"_error",void 0),Ot=t([ct("zappi-card")],Ot),window.customCards=window.customCards||[],window.customCards.push({type:"zappi-card",name:"Zappi Card",description:"Control a myenergi zappi EV charger: charge mode, boost and live status.",preview:!0});export{Ot as ZappiCard};
