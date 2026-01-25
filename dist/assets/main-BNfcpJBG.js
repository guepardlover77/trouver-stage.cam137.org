const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./export-AiKJFuQl.js","./leaflet-C4iS2aBk.js","./export.service-C6QbVkJa.js"])))=>i.map(i=>d[i]);
import{_ as ce}from"./export-AiKJFuQl.js";import"./leaflet-C4iS2aBk.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function n(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(o){if(o.ep)return;o.ep=!0;const a=n(o);fetch(o.href,a)}})();function Ue(e,t={deep:!0}){const n=new Set,s={get(a,i){const l=Reflect.get(a,i);return t.deep&&l&&typeof l=="object"&&!Array.isArray(l)&&!(l instanceof Map)&&!(l instanceof Set)&&!(l instanceof WeakMap)&&!(l instanceof WeakSet)?Ue(l,t):l},set(a,i,l){const r=Reflect.get(a,i);if(r===l)return!0;const c=Reflect.set(a,i,l);return c&&n.forEach(m=>{m(l,r,String(i))}),c},deleteProperty(a,i){const l=Reflect.get(a,i),r=Reflect.deleteProperty(a,i);return r&&n.forEach(c=>{c(void 0,l,String(i))}),r}},o=new Proxy(e,s);return o.$subscribe=a=>(n.add(a),()=>n.delete(a)),o.$subscribers=n,o}let ye=[],be=!1;function Ie(e){if(be){ye.push(e);return}for(be=!0,e();ye.length>0;){const t=ye.shift();t==null||t()}be=!1}function Ze(e){return new Promise((t,n)=>{e.oncomplete=e.onsuccess=()=>t(e.result),e.onabort=e.onerror=()=>n(e.error)})}function mt(e,t){let n;const s=()=>{if(n)return n;const o=indexedDB.open(e);return o.onupgradeneeded=()=>o.result.createObjectStore(t),n=Ze(o),n.then(a=>{a.onclose=()=>n=void 0},()=>{}),n};return(o,a)=>s().then(i=>a(i.transaction(t,o).objectStore(t)))}let $e;function pt(){return $e||($e=mt("keyval-store","keyval")),$e}function ft(e,t=pt()){return t("readonly",n=>Ze(n.get(e)))}const Je="carte-stages-state",Ke=1,De="carte-stages-notes";function vt(e){try{const t={version:Ke,...e,timestamp:Date.now()};localStorage.setItem(Je,JSON.stringify(t))}catch(t){console.warn("Erreur lors de la sauvegarde de l'état:",t)}}async function ht(){try{const e=localStorage.getItem(Je);if(!e)return null;const t=JSON.parse(e);if(t.version!==Ke)return console.log("Version de stockage différente, migration..."),gt(t);const n=await yt();return{theme:t.theme||"auto",favorites:t.favorites||[],personalNotes:n||t.personalNotes||{},sidebarCollapsed:t.sidebarCollapsed||!1,mapCenter:t.mapCenter||{lat:46.5,lon:-.3},mapZoom:t.mapZoom||9,lastFilters:t.lastFilters||{}}}catch(e){return console.warn("Erreur lors du chargement de l'état:",e),null}}function gt(e){return{theme:e.theme||"auto",favorites:e.favorites||[],personalNotes:e.personalNotes||{},sidebarCollapsed:!1,mapCenter:{lat:46.5,lon:-.3},mapZoom:9,lastFilters:{}}}async function yt(){try{return await ft(De)||null}catch(e){console.warn("Erreur lors du chargement des notes depuis IndexedDB:",e);try{const t=localStorage.getItem(De);return t?JSON.parse(t):null}catch{return null}}}const Ce=new Map;function _e(e,t,n=5*60*1e3){Ce.set(e,{data:t,expires:Date.now()+n})}function bt(e){const t=Ce.get(e);return t?Date.now()>t.expires?(Ce.delete(e),null):t.data:null}const $t={search:"",domains:[],levelMin:1,levelMax:5,distanceKm:null,referencePoint:null,favoritesOnly:!1},Et={field:"nom",direction:"asc"},wt={locations:[],filteredIndices:[],searchIndex:new Map,isLoading:!0,theme:"auto",viewMode:"split",sidebarCollapsed:!1,detailPanelOpen:!1,selectedLocationIndex:null,filters:$t,sortOptions:Et,favorites:new Set,compareList:[],personalNotes:new Map,mapCenter:{lat:46.5,lon:-.3},mapZoom:9,heatmapEnabled:!1,clusteringEnabled:!0,userLocation:null,uniqueTypes:[],uniqueCities:[]},u=Ue(wt),W={};function ae(e,t){const n=W[e];n&&n.forEach(s=>{s({type:e,payload:t})})}function j(e,t){return W[e]||(W[e]=new Set),W[e].add(t),()=>{W[e].delete(t)}}function We(e){Ie(()=>{u.locations=e,u.filteredIndices=e.map((t,n)=>n),u.uniqueTypes=[...new Set(e.map(t=>t.type).filter(Boolean))].sort(),u.uniqueCities=[...new Set(e.map(t=>t.ville).filter(Boolean))].sort(),Lt()}),ae("DATA_LOADED",e)}function Lt(){u.searchIndex.clear(),u.locations.forEach((e,t)=>{const n=[e.nom,e.adresse,e.ville,e.codePostal,e.type,e.contact,e.commentaire].filter(Boolean).join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");u.searchIndex.set(t,n)})}function J(e){Ie(()=>{u.filters={...u.filters,...e},Ye()}),ae("FILTER_CHANGED",e)}function Ye(){const{filters:e,sortOptions:t,locations:n,searchIndex:s,favorites:o,userLocation:a}=u,i=e.search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");let l=n.map((r,c)=>c);if(i&&(l=l.filter(r=>(s.get(r)||"").includes(i))),e.domains.length>0&&(l=l.filter(r=>{const c=n[r];return e.domains.includes(c.type)})),l=l.filter(r=>{const c=n[r],m=Ee(c.niveau);return m===null?!0:m>=e.levelMin&&m<=e.levelMax}),e.distanceKm!==null&&e.referencePoint){const r=e.referencePoint;l=l.filter(c=>{const m=n[c];return m.lat===null||m.lon===null?!1:we(r.lat,r.lon,m.lat,m.lon)<=e.distanceKm})}e.favoritesOnly&&(l=l.filter(r=>{const c=n[r],m=se(c);return o.has(m)})),l.sort((r,c)=>{const m=n[r],h=n[c];let v=0;switch(t.field){case"nom":v=m.nom.localeCompare(h.nom,"fr");break;case"ville":v=m.ville.localeCompare(h.ville,"fr");break;case"niveau":const $=Ee(m.niveau)??99,A=Ee(h.niveau)??99;v=$-A;break;case"type":v=m.type.localeCompare(h.type,"fr");break;case"distance":if(a){const w=m.lat&&m.lon?we(a.lat,a.lon,m.lat,m.lon):1/0,I=h.lat&&h.lon?we(a.lat,a.lon,h.lat,h.lon):1/0;v=w-I}break}return t.direction==="asc"?v:-v}),u.filteredIndices=l}function Ee(e){if(!e)return null;const t=e.match(/(\d)/);return t?parseInt(t[1],10):null}function we(e,t,n,s){const a=ie(n-e),i=ie(s-t),l=Math.sin(a/2)*Math.sin(a/2)+Math.cos(ie(e))*Math.cos(ie(n))*Math.sin(i/2)*Math.sin(i/2);return 6371*(2*Math.atan2(Math.sqrt(l),Math.sqrt(1-l)))}function ie(e){return e*(Math.PI/180)}function se(e){return`${e.nom}-${e.codePostal}-${e.ville}`.toLowerCase().replace(/\s+/g,"-")}function St(e){u.favorites.has(e)?u.favorites.delete(e):u.favorites.add(e),u.filters.favoritesOnly&&Ye(),ae("FAVORITE_TOGGLED",e),Qe()}function Ct(e){u.theme=e,xe(e),ae("THEME_CHANGED",e),Qe()}function xe(e){const t=document.documentElement;if(e==="auto"){const n=window.matchMedia("(prefers-color-scheme: dark)").matches;t.setAttribute("data-theme",n?"dark":"light")}else t.setAttribute("data-theme",e)}function xt(e,t){u.mapCenter=e,u.mapZoom=t,ae("MAP_MOVED",{center:e,zoom:t})}function Qe(){vt({theme:u.theme,favorites:Array.from(u.favorites),personalNotes:Object.fromEntries(u.personalNotes),sidebarCollapsed:u.sidebarCollapsed,mapCenter:u.mapCenter,mapZoom:u.mapZoom,lastFilters:{domains:u.filters.domains,levelMin:u.filters.levelMin,levelMax:u.filters.levelMax}})}async function kt(){const e=await ht();e&&(Ie(()=>{u.theme=e.theme,u.favorites=new Set(e.favorites),u.personalNotes=new Map(Object.entries(e.personalNotes)),u.sidebarCollapsed=e.sidebarCollapsed,u.mapCenter=e.mapCenter,u.mapZoom=e.mapZoom,e.lastFilters&&(u.filters={...u.filters,...e.lastFilters})}),xe(u.theme)),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{u.theme==="auto"&&xe("auto")})}function At(e,t){let n=null;return(...s)=>{n&&clearTimeout(n),n=setTimeout(()=>{e(...s),n=null},t)}}function R(e){return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim()}function jn(e=new Date){return e.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"})}function Gn(e,t){const s=new Date().toISOString().slice(0,19).replace(/[:-]/g,"").replace("T","_");return`${e}_${s}.${t}`}function It(){return`${Date.now()}-${Math.random().toString(36).substr(2,9)}`}const oe="/api/v1";function Te(e){return{id:e.id,nom:e.nom,adresse:e.adresse,codePostal:e.code_postal,ville:e.ville,type:e.type,niveau:e.niveau||"",telephone:e.telephone||"",contact:e.contact||"",email:e.email||"",commentaire:e.commentaire||"",lat:e.lat,lon:e.lon}}function Tt(e){return{nom:e.nom,adresse:e.adresse,code_postal:e.codePostal,ville:e.ville,type:e.type,niveau:e.niveau||null,telephone:e.telephone||null,contact:e.contact||null,email:e.email||null,commentaire:e.commentaire||null,lat:e.lat,lon:e.lon}}function ve(){return{"Content-Type":"application/json"}}async function Mt(){const e=await fetch(`${oe}/locations?limit=10000`,{method:"GET",headers:ve()});if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);const t=await e.json();if(!t.success||!t.data)throw new Error(t.error||"Failed to fetch locations");return t.data.map(Te)}async function qt(e){const t=await fetch(`${oe}/locations`,{method:"POST",headers:ve(),body:JSON.stringify(Tt(e))}),n=await t.json();if(!t.ok||!n.success||!n.data)throw new Error(n.error||"Failed to create location");return Te(n.data)}async function Pt(e,t){const n={};t.nom!==void 0&&(n.nom=t.nom),t.adresse!==void 0&&(n.adresse=t.adresse),t.codePostal!==void 0&&(n.code_postal=t.codePostal),t.ville!==void 0&&(n.ville=t.ville),t.type!==void 0&&(n.type=t.type),t.niveau!==void 0&&(n.niveau=t.niveau||null),t.telephone!==void 0&&(n.telephone=t.telephone||null),t.contact!==void 0&&(n.contact=t.contact||null),t.email!==void 0&&(n.email=t.email||null),t.commentaire!==void 0&&(n.commentaire=t.commentaire||null),t.lat!==void 0&&(n.lat=t.lat),t.lon!==void 0&&(n.lon=t.lon);const s=await fetch(`${oe}/locations/${e}`,{method:"PUT",headers:ve(),body:JSON.stringify(n)}),o=await s.json();if(!s.ok||!o.success||!o.data)throw new Error(o.error||"Failed to update location");return Te(o.data)}async function Nt(e){const t=await fetch(`${oe}/locations/${e}`,{method:"DELETE",headers:ve()}),n=await t.json();if(!t.ok||!n.success)throw new Error(n.error||"Failed to delete location");return!0}async function Bt(){try{return(await(await fetch(`${oe}/health`,{method:"GET",signal:AbortSignal.timeout(5e3)})).json()).success===!0}catch{return!1}}let S=[],me=new Map,ee=!1;async function Xe(){try{if(await Bt())return console.log("API disponible, chargement depuis l'API..."),S=await Mt(),ee=!0,Y(),console.log(`Chargé ${S.length} locations depuis l'API`),S}catch(e){console.log("API non disponible, utilisation du fallback...",e)}ee=!1;try{const e=await fetch("./data.json");if(e.ok)return S=await e.json(),Y(),console.log(`Chargé ${S.length} locations depuis data.json`),S}catch{console.log("Chargement depuis data.json échoué, utilisation des données embarquées")}if(window.STAGE_DATA)return S=window.STAGE_DATA,Y(),S;try{const e=await fetch("./js/data.json");if(e.ok)return S=await e.json(),Y(),S}catch{console.error("Impossible de charger les données")}throw new Error("Aucune source de données disponible")}function Y(){me.clear(),S.forEach((e,t)=>{const n=R([e.nom,e.adresse,e.ville,e.codePostal,e.type,e.contact,e.commentaire].filter(Boolean).join(" "));me.set(t,n)})}function Me(){return S}async function et(e){if(ee)try{const s=await qt(e);await Xe();const o=S.findIndex(a=>a.nom===s.nom&&a.ville===s.ville);return o>=0?o:S.length-1}catch(s){throw console.error("Erreur lors de la création via API:",s),s}const t=S.length;S.push(e);const n=R([e.nom,e.adresse,e.ville,e.codePostal,e.type,e.contact,e.commentaire].filter(Boolean).join(" "));return me.set(t,n),t}async function Dt(e,t){if(e<0||e>=S.length)return!1;if(ee){const o=S[e];if(o.id)try{await Pt(o.id,t)}catch(a){throw console.error("Erreur lors de la mise à jour via API:",a),a}}S[e]={...S[e],...t};const n=S[e],s=R([n.nom,n.adresse,n.ville,n.codePostal,n.type,n.contact,n.commentaire].filter(Boolean).join(" "));return me.set(e,s),!0}async function _t(e){if(e<0||e>=S.length)return!1;if(ee){const t=S[e];if(t.id)try{await Nt(t.id)}catch(n){throw console.error("Erreur lors de la suppression via API:",n),n}}return S.splice(e,1),Y(),!0}function Ft(e,t){const n=R(e),s=R(t);return S.some(o=>R(o.nom)===n&&R(o.ville)===s)}function Ot(e){const t=[];if(!e.nom)return t;const n=R(e.nom);return S.forEach((s,o)=>{const a=R(s.nom);if(a===n){t.push(o);return}(a.includes(n)||n.includes(a))&&t.push(o)}),t}const de={light:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>`,dark:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>`,auto:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a10 10 0 0 1 0 20"/>
  </svg>`},Fe={light:"Clair",dark:"Sombre",auto:"Auto"};let T=null,P=null,te=!1;function Rt(e){T=document.createElement("button"),T.className="theme-toggle",T.setAttribute("type","button"),T.setAttribute("aria-label","Changer le thème"),T.setAttribute("aria-haspopup","true"),T.setAttribute("aria-expanded","false"),tt(),P=document.createElement("div"),P.className="theme-dropdown",P.setAttribute("role","menu"),P.innerHTML=`
    <button class="theme-option" data-theme="light" role="menuitem">
      ${de.light}
      <span>Clair</span>
    </button>
    <button class="theme-option" data-theme="dark" role="menuitem">
      ${de.dark}
      <span>Sombre</span>
    </button>
    <button class="theme-option" data-theme="auto" role="menuitem">
      ${de.auto}
      <span>Automatique</span>
    </button>
  `;const t=document.createElement("div");return t.className="theme-toggle-wrapper",t.appendChild(T),t.appendChild(P),e.appendChild(t),T.addEventListener("click",zt),P.querySelectorAll(".theme-option").forEach(n=>{n.addEventListener("click",()=>{const s=n.getAttribute("data-theme");jt(s),ue()})}),document.addEventListener("click",n=>{te&&!t.contains(n.target)&&ue()}),document.addEventListener("keydown",n=>{n.key==="Escape"&&te&&(ue(),T==null||T.focus())}),T}function tt(){if(!T)return;const e=u.theme;T.innerHTML=de[e],T.setAttribute("aria-label",`Thème: ${Fe[e]}. Cliquer pour changer.`),T.setAttribute("title",`Thème: ${Fe[e]}`),P==null||P.querySelectorAll(".theme-option").forEach(t=>{const n=t.getAttribute("data-theme")===e;t.classList.toggle("active",n),t.setAttribute("aria-checked",String(n))})}function zt(){te?ue():Ht()}function Ht(){if(!P||!T)return;te=!0,P.classList.add("open"),T.setAttribute("aria-expanded","true");const e=P.querySelector(".theme-option.active");e==null||e.focus()}function ue(){!P||!T||(te=!1,P.classList.remove("open"),T.setAttribute("aria-expanded","false"))}function jt(e){Ct(e),tt()}function Oe(e){const t=document.documentElement;if(e==="auto"){const s=window.matchMedia("(prefers-color-scheme: dark)").matches;t.setAttribute("data-theme",s?"dark":"light")}else t.setAttribute("data-theme",e);const n=document.querySelector('meta[name="theme-color"]');if(n){const s=e==="auto"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e;n.setAttribute("content",s==="dark"?"#1e293b":"#2563eb")}}function Gt(){Oe(u.theme),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{u.theme==="auto"&&Oe("auto")})}let O=null;const Q=new Map,Vt={success:'<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',error:'<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',warning:'<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',info:'<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'};function nt(){return O||(O=document.createElement("div"),O.className="toast-container",O.setAttribute("role","region"),O.setAttribute("aria-label","Notifications"),O.setAttribute("aria-live","polite"),document.body.appendChild(O),O)}function Ut(e){const t=nt(),n=It(),s=e.duration??4e3;({...e});const o=document.createElement("div");o.className=`toast toast-${e.type}`,o.setAttribute("role","alert"),o.dataset.toastId=n,o.innerHTML=`
    ${Vt[e.type]}
    <div class="toast-content">
      <p class="toast-message">${Re(e.message)}</p>
      ${e.action?`
        <button class="toast-action" type="button">
          ${Re(e.action.label)}
        </button>
      `:""}
    </div>
    <button class="toast-close" type="button" aria-label="Fermer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;const a=o.querySelector(".toast-close");if(a==null||a.addEventListener("click",()=>re(n)),e.action){const l=o.querySelector(".toast-action");l==null||l.addEventListener("click",()=>{e.action.callback(),re(n)})}t.appendChild(o),requestAnimationFrame(()=>{o.classList.add("toast-enter")});const i=window.setTimeout(()=>{re(n)},s);if(Q.set(n,{element:o,timeout:i}),Q.size>5){const l=Q.keys().next().value;l&&re(l)}return n}function re(e){const t=Q.get(e);t&&(clearTimeout(t.timeout),t.element.classList.remove("toast-enter"),t.element.classList.add("toast-exit"),t.element.addEventListener("animationend",()=>{t.element.remove(),Q.delete(e)},{once:!0}))}function Re(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function Zt(){return nt()}function F(e){return Ut(e)}const Jt=6371;function le(e){return e*(Math.PI/180)}function Kt(e,t,n,s){const o=le(n-e),a=le(s-t),i=Math.sin(o/2)*Math.sin(o/2)+Math.cos(le(e))*Math.cos(le(n))*Math.sin(a/2)*Math.sin(a/2),l=2*Math.atan2(Math.sqrt(i),Math.sqrt(1-i));return Jt*l}function Wt(e){return e<1?`${Math.round(e*1e3)} m`:e<10?`${e.toFixed(1)} km`:`${Math.round(e)} km`}let k=null,H=null,V=null,ne=new Map;const Z={default:"#3b82f6",matching:"#ef4444",favorite:"#f59e0b",selected:"#10b981"};function at(e){const{color:t,isMatching:n,isFavorite:s,isSelected:o}=e;let a=t||Z.default;return o?a=Z.selected:s?a=Z.favorite:n&&(a=Z.matching),L.divIcon({className:"custom-marker",html:`
      <div class="marker-pin" style="--marker-color: ${a}">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        ${s?'<span class="marker-star">★</span>':""}
      </div>
    `,iconSize:[32,42],iconAnchor:[16,42],popupAnchor:[0,-42]})}function Yt(e,t){const n=se(e),s=u.favorites.has(n),o=u.personalNotes.get(n),a=u.userLocation;let i="";if(a&&e.lat&&e.lon){const l=Kt(a.lat,a.lon,e.lat,e.lon);i=`<p class="popup-distance">📍 ${Wt(l)}</p>`}return`
    <div class="popup-content" data-index="${t}">
      <div class="popup-header">
        <h3 class="popup-title">${e.nom}</h3>
        <button class="popup-fav-btn ${s?"active":""}"
                data-location-id="${n}"
                title="${s?"Retirer des favoris":"Ajouter aux favoris"}">
          ${s?"★":"☆"}
        </button>
      </div>

      <div class="popup-body">
        <p class="popup-address">
          ${e.adresse}<br>
          ${e.codePostal} ${e.ville}
        </p>

        ${e.type?`<p class="popup-type"><span class="tag">${e.type}</span></p>`:""}
        ${e.niveau?`<p class="popup-level">Niveau: ${e.niveau}</p>`:""}
        ${i}

        ${e.telephone?`
          <p class="popup-phone">
            <a href="tel:${e.telephone.replace(/\s/g,"")}">${e.telephone}</a>
          </p>
        `:""}

        ${e.email?`
          <p class="popup-email">
            <a href="mailto:${e.email}">${e.email}</a>
          </p>
        `:""}

        ${e.contact?`<p class="popup-contact">Contact: ${e.contact}</p>`:""}
        ${e.commentaire?`<p class="popup-comment">${e.commentaire}</p>`:""}
        ${o?`<p class="popup-note"><strong>Note:</strong> ${o}</p>`:""}
      </div>

      <div class="popup-actions">
        ${e.telephone?`
          <a href="tel:${e.telephone.replace(/\s/g,"")}" class="popup-btn popup-btn-call">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Appeler
          </a>
        `:""}
        <button class="popup-btn popup-btn-directions"
                data-lat="${e.lat}"
                data-lon="${e.lon}"
                data-name="${encodeURIComponent(e.nom)}">
          🧭 Itinéraire
        </button>
      </div>
    </div>
  `}function Qt(e){k=L.map(e,{center:[u.mapCenter.lat,u.mapCenter.lon],zoom:u.mapZoom,zoomControl:!0,attributionControl:!0}),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).addTo(k),H=L.markerClusterGroup({chunkedLoading:!0,chunkInterval:200,chunkDelay:50,removeOutsideVisibleBounds:!0,animate:!0,animateAddingMarkers:!1,maxClusterRadius:60,spiderfyOnMaxZoom:!0,spiderfyDistanceMultiplier:1.5,showCoverageOnHover:!0,zoomToBoundsOnClick:!0,disableClusteringAtZoom:18,iconCreateFunction:n=>{const s=n.getChildCount(),o=n.getAllChildMarkers();let a=0,i=0;const l=new Set;o.forEach($=>{var I;const A=window.__clusterMarkerIndex,w=(I=Array.from((A==null?void 0:A.entries())||[]).find(([q,b])=>b===$))==null?void 0:I[0];if(w!==void 0){const q=u.locations[w];q&&(l.add(q.type),u.filteredIndices.includes(w)&&a++,u.favorites.has(se(q))&&i++)}});let r="small",c=40;s>100?(r="xlarge",c=60):s>50?(r="large",c=50):s>20&&(r="medium",c=45);const m=s>0?a/s:0;let h="default";m>.7?h="hot":m>.3&&(h="warm");const v=i>0?`<span class="cluster-fav">★${i}</span>`:"";return L.divIcon({html:`
          <div class="cluster-marker cluster-${r} cluster-${h}">
            <span class="cluster-count">${s}</span>
            ${v}
          </div>
        `,className:"marker-cluster-custom",iconSize:L.point(c,c)})}}),window.__clusterMarkerIndex=ne,k.addLayer(H),H.on("clustermouseover",n=>{const s=n.layer,o=s.getChildCount(),a=s.getAllChildMarkers(),i=new Map,l=new Map;let r=0;a.forEach(v=>{var w;const $=window.__clusterMarkerIndex,A=(w=Array.from(($==null?void 0:$.entries())||[]).find(([I,q])=>q===v))==null?void 0:w[0];if(A!==void 0){const I=u.locations[A];I&&(i.set(I.ville,(i.get(I.ville)||0)+1),l.set(I.type,(l.get(I.type)||0)+1),u.filteredIndices.includes(A)&&r++)}});const c=Array.from(i.entries()).sort((v,$)=>$[1]-v[1]).slice(0,3).map(([v,$])=>`${v} (${$})`).join(", "),m=Array.from(l.entries()).sort((v,$)=>$[1]-v[1]).slice(0,3).map(([v,$])=>`${v} (${$})`).join(", "),h=`
      <div class="cluster-tooltip">
        <strong>${o} établissements</strong>
        ${r>0?`<br><span class="cluster-tooltip-match">✓ ${r} correspondent aux filtres</span>`:""}
        <hr>
        <small><strong>Villes:</strong> ${c||"N/A"}</small><br>
        <small><strong>Types:</strong> ${m||"N/A"}</small>
      </div>
    `;s.bindTooltip(h,{direction:"top",className:"cluster-tooltip-container",offset:[0,-20]}).openTooltip()}),H.on("clustermouseout",n=>{n.layer.closeTooltip()});const t=At(()=>{if(k){const n=k.getCenter();xt({lat:n.lat,lon:n.lng},k.getZoom())}},300);return k.on("moveend",t),k.on("zoomend",t),k.on("popupopen",n=>{const o=n.popup.getElement();o&&(o.querySelectorAll(".popup-fav-btn").forEach(a=>{a.addEventListener("click",i=>{i.stopPropagation();const l=a.dataset.locationId;l&&(St(l),a.classList.toggle("active"),a.textContent=a.classList.contains("active")?"★":"☆")})}),o.querySelectorAll(".popup-btn-directions").forEach(a=>{a.addEventListener("click",()=>{const i=a.dataset.lat,l=a.dataset.lon,r=decodeURIComponent(a.dataset.name||"");if(i&&l){const c=`https://www.google.com/maps/dir/?api=1&destination=${i},${l}&destination_place_id=${r}`;window.open(c,"_blank")}})}))}),Xt(),k}function Xt(){j("DATA_LOADED",()=>{qe(),st()}),j("FILTER_CHANGED",()=>{ke()}),j("LOCATION_SELECTED",e=>{const t=e.payload;t!==null&&Pe(t)}),j("FAVORITE_TOGGLED",()=>{ke()})}function qe(){if(!H)return;H.clearLayers(),ne.clear();const{locations:e,filteredIndices:t,favorites:n}=u,s=new Set(t);e.forEach((o,a)=>{if(o.lat===null||o.lon===null)return;const i=se(o),l=s.has(a),r=n.has(i),c=u.selectedLocationIndex===a,m=at({color:Z.default,isMatching:l,isFavorite:r,isSelected:c}),h=L.marker([o.lat,o.lon],{icon:m});h.bindPopup(()=>Yt(o,a),{maxWidth:320,className:"custom-popup"}),h.on("click",()=>{window.dispatchEvent(new CustomEvent("location-selected",{detail:{index:a}}))}),ne.set(a,h),H.addLayer(h)})}function ke(){const{filteredIndices:e,favorites:t,selectedLocationIndex:n,locations:s}=u,o=new Set(e);ne.forEach((a,i)=>{const l=s[i];if(!l)return;const r=se(l),c=o.has(i),m=t.has(r),h=n===i,v=at({color:Z.default,isMatching:c,isFavorite:m,isSelected:h});a.setIcon(v)})}function Pe(e,t={}){const n=ne.get(e);if(!n||!k)return;const{zoom:s=15,openPopup:o=!0}=t,a=n.getLatLng();k.setView(a,s,{animate:!0}),o&&setTimeout(()=>{n.openPopup()},300),ke()}function st(e=50){if(!k||!H)return;const{locations:t,filteredIndices:n}=u,s=[];if(n.forEach(o=>{const a=t[o];a.lat!==null&&a.lon!==null&&s.push(L.latLng(a.lat,a.lon))}),s.length!==0)if(s.length===1)k.setView(s[0],14);else{const o=L.latLngBounds(s);k.fitBounds(o,{padding:[e,e]})}}function en(e){if(k)if(e){const{locations:t,filteredIndices:n}=u,s=[];n.forEach(o=>{const a=t[o];a.lat!==null&&a.lon!==null&&s.push([a.lat,a.lon,1])}),V&&k.removeLayer(V),V=L.heatLayer(s,{radius:25,blur:15,maxZoom:17,gradient:{.4:"blue",.6:"cyan",.7:"lime",.8:"yellow",1:"red"}}).addTo(k)}else V&&(k.removeLayer(V),V=null)}function ze(){k&&setTimeout(()=>k.invalidateSize(),100)}const pe="admin_code_hash",Ne="admin_session",tn="admin2024";function Be(e){let t=0;for(let n=0;n<e.length;n++){const s=e.charCodeAt(n);t=(t<<5)-t+s,t=t&t}return t.toString(36)}function nn(){localStorage.getItem(pe)||localStorage.setItem(pe,Be(tn))}function an(){return sessionStorage.getItem(Ne)==="true"}function ot(e){nn();const t=localStorage.getItem(pe);return Be(e)===t}function sn(e){return ot(e)?(sessionStorage.setItem(Ne,"true"),!0):!1}function on(){sessionStorage.removeItem(Ne)}function rn(e,t){return!ot(e)||t.length<4?!1:(localStorage.setItem(pe,Be(t)),!0)}function ln(e){const t=document.createElement("div");t.className="admin-auth-modal",t.innerHTML=`
    <div class="admin-auth-content">
      <div class="admin-auth-header">
        <i class="fas fa-lock"></i>
        <h3>Accès Administration</h3>
      </div>
      <p class="admin-auth-desc">Entrez le code d'accès pour gérer les lieux de stage.</p>
      <div class="admin-auth-input-group">
        <input type="password"
               class="admin-auth-input"
               placeholder="Code d'accès"
               autocomplete="off"
               id="adminCodeInput">
        <button type="button" class="admin-auth-toggle" title="Afficher/masquer">
          <i class="fas fa-eye"></i>
        </button>
      </div>
      <p class="admin-auth-error" style="display: none;">
        <i class="fas fa-exclamation-circle"></i>
        Code incorrect
      </p>
      <div class="admin-auth-buttons">
        <button type="button" class="admin-auth-btn admin-auth-btn-cancel">
          Annuler
        </button>
        <button type="button" class="admin-auth-btn admin-auth-btn-submit">
          <i class="fas fa-unlock"></i> Valider
        </button>
      </div>
    </div>
  `;const n=t.querySelector(".admin-auth-input"),s=t.querySelector(".admin-auth-toggle"),o=t.querySelector(".admin-auth-error"),a=t.querySelector(".admin-auth-btn-cancel"),i=t.querySelector(".admin-auth-btn-submit");s.addEventListener("click",()=>{const r=n.type==="password";n.type=r?"text":"password",s.innerHTML=`<i class="fas fa-eye${r?"-slash":""}"></i>`});const l=()=>{const r=n.value.trim();sn(r)?(t.remove(),e()):(o.style.display="flex",n.classList.add("error"),n.focus(),n.select())};return i.addEventListener("click",l),n.addEventListener("keydown",r=>{r.key==="Enter"&&(r.preventDefault(),l()),o.style.display="none",n.classList.remove("error")}),a.addEventListener("click",()=>{t.remove()}),t.addEventListener("click",r=>{r.target===t&&t.remove()}),setTimeout(()=>n.focus(),100),t}function cn(e){if(an()){e();return}const t=ln(e);document.body.appendChild(t)}function dn(e){e.innerHTML=`
    <div class="admin-change-code">
      <h4><i class="fas fa-key"></i> Changer le code d'accès</h4>
      <div class="admin-form-group">
        <label for="oldCodeInput">Code actuel</label>
        <input type="password" id="oldCodeInput" class="admin-input" autocomplete="off">
      </div>
      <div class="admin-form-group">
        <label for="newCodeInput">Nouveau code (min. 4 caractères)</label>
        <input type="password" id="newCodeInput" class="admin-input" autocomplete="off">
      </div>
      <div class="admin-form-group">
        <label for="confirmCodeInput">Confirmer le nouveau code</label>
        <input type="password" id="confirmCodeInput" class="admin-input" autocomplete="off">
      </div>
      <p class="admin-change-code-message" style="display: none;"></p>
      <button type="button" class="admin-btn admin-btn-primary" id="changeCodeBtn">
        <i class="fas fa-save"></i> Enregistrer
      </button>
    </div>
  `;const t=e.querySelector("#oldCodeInput"),n=e.querySelector("#newCodeInput"),s=e.querySelector("#confirmCodeInput"),o=e.querySelector(".admin-change-code-message");e.querySelector("#changeCodeBtn").addEventListener("click",()=>{const i=t.value.trim(),l=n.value.trim(),r=s.value.trim();if(o.style.display="block",!i||!l||!r){o.className="admin-change-code-message error",o.textContent="Tous les champs sont obligatoires";return}if(l!==r){o.className="admin-change-code-message error",o.textContent="Les codes ne correspondent pas";return}if(l.length<4){o.className="admin-change-code-message error",o.textContent="Le nouveau code doit faire au moins 4 caractères";return}rn(i,l)?(o.className="admin-change-code-message success",o.textContent="Code modifié avec succès",t.value="",n.value="",s.value=""):(o.className="admin-change-code-message error",o.textContent="Code actuel incorrect")})}const un="https://api-adresse.data.gouv.fr/search/",mn="https://nominatim.openstreetmap.org/search";async function it(e,t,n){const s=`geo:${e}:${t}:${n}`,o=bt(s);if(o)return o;const a=await pn(e,t,n);if(a)return _e(s,a,30*60*1e3),a;const i=await fn(e,t,n);return i?(_e(s,i,30*60*1e3),i):null}async function pn(e,t,n){try{const s=`${e} ${t} ${n}`,o=new URL(un);o.searchParams.set("q",s),o.searchParams.set("limit","1"),t&&o.searchParams.set("postcode",t);const a=await fetch(o.toString());if(!a.ok)throw new Error(`BAN API error: ${a.status}`);const i=await a.json();if(i.features&&i.features.length>0){const l=i.features[0],[r,c]=l.geometry.coordinates,m=l.properties.score||0;return m<.3?null:{lat:c,lon:r,confidence:m,source:"ban",label:l.properties.label}}return null}catch(s){return console.warn("Erreur API BAN:",s),null}}async function fn(e,t,n){try{const s=`${e}, ${t} ${n}, France`,o=new URL(mn);o.searchParams.set("q",s),o.searchParams.set("format","json"),o.searchParams.set("limit","1"),o.searchParams.set("countrycodes","fr");const a=await fetch(o.toString(),{headers:{"User-Agent":"CarteStages/2.0"}});if(!a.ok)throw new Error(`Nominatim API error: ${a.status}`);const i=await a.json();if(i&&i.length>0){const l=i[0],r=parseFloat(l.importance)||0;return{lat:parseFloat(l.lat),lon:parseFloat(l.lon),confidence:r,source:"nominatim",label:l.display_name}}return null}catch(s){return console.warn("Erreur Nominatim:",s),null}}function vn(e,t){const{location:n,index:s,onSave:o,onCancel:a}=t,i=s!==void 0,l=u.uniqueTypes;e.innerHTML=`
    <form class="admin-location-form" id="locationForm">
      <h3 class="admin-form-title">
        <i class="fas fa-${i?"edit":"plus-circle"}"></i>
        ${i?"Modifier le lieu":"Ajouter un nouveau lieu"}
      </h3>

      <div class="admin-form-section">
        <h4><i class="fas fa-building"></i> Informations générales</h4>

        <div class="admin-form-row">
          <div class="admin-form-group admin-form-group-large">
            <label for="nom">Nom de l'établissement *</label>
            <input type="text" id="nom" name="nom" class="admin-input" required
                   value="${_((n==null?void 0:n.nom)||"")}"
                   placeholder="Ex: Restaurant Le Bon Goût">
            <span class="admin-form-error" id="nomError"></span>
          </div>
          <div class="admin-form-group">
            <label for="type">Type d'établissement *</label>
            <select id="type" name="type" class="admin-input" required>
              <option value="">-- Sélectionner --</option>
              ${l.map(p=>`<option value="${_(p)}" ${(n==null?void 0:n.type)===p?"selected":""}>${_(p)}</option>`).join("")}
              <option value="__autre__">Autre (saisir)</option>
            </select>
            <input type="text" id="typeAutre" class="admin-input admin-input-autre" style="display: none;"
                   placeholder="Saisir le nouveau type">
          </div>
        </div>

        <div class="admin-form-row">
          <div class="admin-form-group">
            <label for="niveau">Niveau</label>
            <select id="niveau" name="niveau" class="admin-input">
              <option value="">-- Non spécifié --</option>
              <option value="1" ${(n==null?void 0:n.niveau)==="1"?"selected":""}>Niveau 1</option>
              <option value="2" ${(n==null?void 0:n.niveau)==="2"?"selected":""}>Niveau 2</option>
              <option value="3" ${(n==null?void 0:n.niveau)==="3"?"selected":""}>Niveau 3</option>
              <option value="4" ${(n==null?void 0:n.niveau)==="4"?"selected":""}>Niveau 4</option>
              <option value="5" ${(n==null?void 0:n.niveau)==="5"?"selected":""}>Niveau 5</option>
            </select>
          </div>
        </div>
      </div>

      <div class="admin-form-section">
        <h4><i class="fas fa-map-marker-alt"></i> Adresse</h4>

        <div class="admin-form-group">
          <label for="adresse">Adresse *</label>
          <input type="text" id="adresse" name="adresse" class="admin-input" required
                 value="${_((n==null?void 0:n.adresse)||"")}"
                 placeholder="Ex: 12 rue de la Gare">
        </div>

        <div class="admin-form-row">
          <div class="admin-form-group">
            <label for="codePostal">Code postal *</label>
            <input type="text" id="codePostal" name="codePostal" class="admin-input" required
                   value="${_((n==null?void 0:n.codePostal)||"")}"
                   pattern="[0-9]{5}" maxlength="5"
                   placeholder="Ex: 79200">
            <span class="admin-form-error" id="codePostalError"></span>
          </div>
          <div class="admin-form-group admin-form-group-large">
            <label for="ville">Ville *</label>
            <input type="text" id="ville" name="ville" class="admin-input" required
                   value="${_((n==null?void 0:n.ville)||"")}"
                   placeholder="Ex: Parthenay">
          </div>
        </div>

        <div class="admin-form-row admin-form-coords">
          <div class="admin-form-group">
            <label for="lat">Latitude</label>
            <input type="number" id="lat" name="lat" class="admin-input"
                   value="${(n==null?void 0:n.lat)??""}"
                   step="0.000001" min="-90" max="90"
                   placeholder="46.6453">
          </div>
          <div class="admin-form-group">
            <label for="lon">Longitude</label>
            <input type="number" id="lon" name="lon" class="admin-input"
                   value="${(n==null?void 0:n.lon)??""}"
                   step="0.000001" min="-180" max="180"
                   placeholder="-0.2489">
          </div>
          <div class="admin-form-group admin-form-group-btn">
            <button type="button" class="admin-btn admin-btn-secondary" id="geocodeBtn">
              <i class="fas fa-crosshairs"></i> Géocoder
            </button>
          </div>
        </div>
        <div class="admin-geocode-result" id="geocodeResult" style="display: none;"></div>
      </div>

      <div class="admin-form-section">
        <h4><i class="fas fa-address-book"></i> Contact</h4>

        <div class="admin-form-row">
          <div class="admin-form-group">
            <label for="telephone">Téléphone</label>
            <input type="tel" id="telephone" name="telephone" class="admin-input"
                   value="${_((n==null?void 0:n.telephone)||"")}"
                   placeholder="Ex: 05 49 94 00 00">
            <span class="admin-form-error" id="telephoneError"></span>
          </div>
          <div class="admin-form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" class="admin-input"
                   value="${_((n==null?void 0:n.email)||"")}"
                   placeholder="Ex: contact@restaurant.fr">
            <span class="admin-form-error" id="emailError"></span>
          </div>
        </div>

        <div class="admin-form-group">
          <label for="contact">Nom du contact</label>
          <input type="text" id="contact" name="contact" class="admin-input"
                 value="${_((n==null?void 0:n.contact)||"")}"
                 placeholder="Ex: M. Dupont">
        </div>
      </div>

      <div class="admin-form-section">
        <h4><i class="fas fa-comment"></i> Notes</h4>

        <div class="admin-form-group">
          <label for="commentaire">Commentaire</label>
          <textarea id="commentaire" name="commentaire" class="admin-input admin-textarea"
                    rows="3" placeholder="Informations complémentaires...">${_((n==null?void 0:n.commentaire)||"")}</textarea>
        </div>
      </div>

      <div class="admin-form-duplicates" id="duplicatesWarning" style="display: none;">
        <i class="fas fa-exclamation-triangle"></i>
        <span>Lieux similaires détectés :</span>
        <ul id="duplicatesList"></ul>
      </div>

      <div class="admin-form-actions">
        <button type="button" class="admin-btn admin-btn-cancel" id="cancelBtn">
          <i class="fas fa-times"></i> Annuler
        </button>
        <button type="submit" class="admin-btn admin-btn-primary" id="saveBtn">
          <i class="fas fa-save"></i> ${i?"Enregistrer":"Ajouter"}
        </button>
      </div>
    </form>
  `;const r=e.querySelector("#locationForm"),c=r.querySelector("#type"),m=r.querySelector("#typeAutre"),h=r.querySelector("#geocodeBtn"),v=r.querySelector("#geocodeResult"),$=r.querySelector("#nom"),A=r.querySelector("#ville"),w=r.querySelector("#duplicatesWarning"),I=r.querySelector("#duplicatesList"),q=r.querySelector("#cancelBtn");c.addEventListener("change",()=>{c.value==="__autre__"?(m.style.display="block",m.required=!0,m.focus()):(m.style.display="none",m.required=!1,m.value="")}),h.addEventListener("click",async()=>{const p=r.querySelector("#adresse").value.trim(),y=r.querySelector("#codePostal").value.trim(),C=r.querySelector("#ville").value.trim();if(!p||!y||!C){v.innerHTML=`<i class="fas fa-exclamation-circle"></i> Remplissez l'adresse, le code postal et la ville`,v.className="admin-geocode-result error",v.style.display="flex";return}h.disabled=!0,h.innerHTML='<i class="fas fa-spinner fa-spin"></i> Recherche...',v.style.display="none";try{const M=await it(p,y,C);M?(r.querySelector("#lat").value=M.lat.toFixed(6),r.querySelector("#lon").value=M.lon.toFixed(6),v.innerHTML=`<i class="fas fa-check-circle"></i> Coordonnées trouvées (confiance: ${Math.round(M.confidence*100)}%)`,v.className="admin-geocode-result success"):(v.innerHTML='<i class="fas fa-exclamation-triangle"></i> Adresse non trouvée. Vérifiez ou saisissez les coordonnées manuellement.',v.className="admin-geocode-result warning")}catch{v.innerHTML='<i class="fas fa-times-circle"></i> Erreur lors du géocodage',v.className="admin-geocode-result error"}v.style.display="flex",h.disabled=!1,h.innerHTML='<i class="fas fa-crosshairs"></i> Géocoder'});const b=hn(()=>{const p=$.value.trim();if(A.value.trim(),p.length<3){w.style.display="none";return}const y=Ot({nom:p}),C=i?y.filter(M=>M!==s):y;if(C.length>0){const M=Me();I.innerHTML=C.slice(0,3).map(N=>{const D=M[N];return`<li>${_(D.nom)} - ${_(D.ville)} (${D.codePostal})</li>`}).join(""),w.style.display="flex"}else w.style.display="none"},500);$.addEventListener("input",b),A.addEventListener("input",b);const g=(p,y,C)=>{const M=C(p.value.trim()),N=r.querySelector(`#${y}`);return M?(p.classList.add("error"),N.textContent=M,N.style.display="block",!1):(p.classList.remove("error"),N.style.display="none",!0)},d=r.querySelector("#codePostal");d.addEventListener("blur",()=>{g(d,"codePostalError",p=>/^\d{5}$/.test(p)?null:"Le code postal doit contenir 5 chiffres")});const f=r.querySelector("#telephone");f.addEventListener("blur",()=>{g(f,"telephoneError",p=>p&&!/^[\d\s.+-]{10,}$/.test(p.replace(/\s/g,""))?"Format de téléphone invalide":null)});const E=r.querySelector("#email");E.addEventListener("blur",()=>{g(E,"emailError",p=>p&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p)?"Format d'email invalide":null)}),q.addEventListener("click",()=>{a()}),r.addEventListener("submit",p=>{p.preventDefault();let y=!0;y=g($,"nomError",G=>G?null:"Le nom est obligatoire")&&y,y=g(d,"codePostalError",G=>G?/^\d{5}$/.test(G)?null:"Le code postal doit contenir 5 chiffres":"Le code postal est obligatoire")&&y;let C=c.value;if(C==="__autre__"&&(C=m.value.trim(),C||(y=!1,m.classList.add("error"))),!y)return;const M=r.querySelector("#lat"),N=r.querySelector("#lon"),D={nom:$.value.trim(),adresse:r.querySelector("#adresse").value.trim(),codePostal:d.value.trim(),ville:A.value.trim(),type:C,niveau:r.querySelector("#niveau").value,telephone:f.value.trim(),email:E.value.trim(),contact:r.querySelector("#contact").value.trim(),commentaire:r.querySelector("#commentaire").value.trim(),lat:M.value?parseFloat(M.value):null,lon:N.value?parseFloat(N.value):null};o(D,s)})}function _(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function hn(e,t){let n=null;return(...s)=>{n&&clearTimeout(n),n=setTimeout(()=>e(...s),t)}}function gn(e,t){const{onEdit:n,onDelete:s,onLocate:o}=t,a={page:1,perPage:20,search:"",sortField:"nom",sortDir:"asc",selected:new Set};function i(){const r=u.locations;let c=r.map((b,g)=>g);if(a.search){const b=a.search.toLowerCase();c=c.filter(g=>{const d=r[g];return d.nom.toLowerCase().includes(b)||d.ville.toLowerCase().includes(b)||d.codePostal.includes(b)||d.type.toLowerCase().includes(b)})}a.sortField&&c.sort((b,g)=>{const d=r[b][a.sortField]||"",f=r[g][a.sortField]||"",E=String(d).localeCompare(String(f),"fr",{numeric:!0});return a.sortDir==="asc"?E:-E});const m=Math.ceil(c.length/a.perPage),h=(a.page-1)*a.perPage,v=c.slice(h,h+a.perPage);e.innerHTML=`
      <div class="admin-list-header">
        <div class="admin-list-search">
          <i class="fas fa-search"></i>
          <input type="text" class="admin-input" placeholder="Rechercher..."
                 value="${K(a.search)}" id="listSearchInput">
        </div>
        <div class="admin-list-info">
          ${c.length} lieu${c.length>1?"x":""} trouvé${c.length>1?"s":""}
        </div>
        <div class="admin-list-bulk-actions" style="display: ${a.selected.size>0?"flex":"none"}">
          <span>${a.selected.size} sélectionné${a.selected.size>1?"s":""}</span>
          <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" id="bulkDeleteBtn">
            <i class="fas fa-trash"></i> Supprimer
          </button>
        </div>
      </div>

      <div class="admin-list-table-container">
        <table class="admin-list-table">
          <thead>
            <tr>
              <th class="admin-list-th-check">
                <input type="checkbox" id="selectAllCheck" ${a.selected.size===v.length&&v.length>0?"checked":""}>
              </th>
              <th class="admin-list-th-sortable" data-field="nom">
                Nom ${l("nom")}
              </th>
              <th class="admin-list-th-sortable" data-field="ville">
                Ville ${l("ville")}
              </th>
              <th class="admin-list-th-sortable" data-field="type">
                Type ${l("type")}
              </th>
              <th class="admin-list-th-sortable" data-field="niveau">
                Niveau ${l("niveau")}
              </th>
              <th>Géoloc</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${v.length===0?`
              <tr>
                <td colspan="7" class="admin-list-empty">
                  <i class="fas fa-inbox"></i>
                  <p>Aucun lieu trouvé</p>
                </td>
              </tr>
            `:v.map(b=>{const g=r[b],d=g.lat!==null&&g.lon!==null;return`
                <tr data-index="${b}" class="${a.selected.has(b)?"selected":""}">
                  <td>
                    <input type="checkbox" class="row-check" ${a.selected.has(b)?"checked":""}>
                  </td>
                  <td class="admin-list-cell-nom" title="${K(g.nom)}">
                    ${K(He(g.nom,30))}
                  </td>
                  <td>
                    ${K(g.ville)} <span class="admin-list-cp">(${g.codePostal})</span>
                  </td>
                  <td>
                    <span class="admin-list-type">${K(He(g.type,20))}</span>
                  </td>
                  <td>
                    ${g.niveau?`<span class="admin-list-niveau niveau-${g.niveau}">${g.niveau}</span>`:"-"}
                  </td>
                  <td>
                    <span class="admin-list-geo ${d?"yes":"no"}">
                      <i class="fas fa-${d?"check":"times"}"></i>
                    </span>
                  </td>
                  <td class="admin-list-actions">
                    <button type="button" class="admin-btn-icon btn-locate" title="Localiser sur la carte">
                      <i class="fas fa-map-marker-alt"></i>
                    </button>
                    <button type="button" class="admin-btn-icon btn-edit" title="Modifier">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="admin-btn-icon btn-delete" title="Supprimer">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>

      ${m>1?`
        <div class="admin-list-pagination">
          <button type="button" class="admin-btn admin-btn-sm" id="prevPageBtn" ${a.page<=1?"disabled":""}>
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="admin-list-page-info">
            Page ${a.page} / ${m}
          </span>
          <button type="button" class="admin-btn admin-btn-sm" id="nextPageBtn" ${a.page>=m?"disabled":""}>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      `:""}
    `;const $=e.querySelector("#listSearchInput");$==null||$.addEventListener("input",yn(()=>{a.search=$.value,a.page=1,a.selected.clear(),i()},300)),e.querySelectorAll(".admin-list-th-sortable").forEach(b=>{b.addEventListener("click",()=>{const g=b.dataset.field;a.sortField===g?a.sortDir=a.sortDir==="asc"?"desc":"asc":(a.sortField=g,a.sortDir="asc"),i()})});const A=e.querySelector("#selectAllCheck");A==null||A.addEventListener("change",()=>{A.checked?v.forEach(b=>a.selected.add(b)):v.forEach(b=>a.selected.delete(b)),i()}),e.querySelectorAll(".row-check").forEach(b=>{b.addEventListener("change",g=>{const d=g.target.closest("tr"),f=parseInt((d==null?void 0:d.dataset.index)||"-1",10);g.target.checked?a.selected.add(f):a.selected.delete(f),i()})});const w=e.querySelector("#bulkDeleteBtn");w==null||w.addEventListener("click",()=>{a.selected.size>0&&confirm(`Supprimer ${a.selected.size} lieu${a.selected.size>1?"x":""} ?`)&&(s(Array.from(a.selected).sort((b,g)=>g-b)),a.selected.clear(),a.page=1,i())}),e.querySelectorAll("tr[data-index]").forEach(b=>{var d,f,E;const g=parseInt(b.dataset.index||"-1",10);(d=b.querySelector(".btn-locate"))==null||d.addEventListener("click",p=>{p.stopPropagation(),o(g)}),(f=b.querySelector(".btn-edit"))==null||f.addEventListener("click",p=>{p.stopPropagation(),n(g)}),(E=b.querySelector(".btn-delete"))==null||E.addEventListener("click",p=>{p.stopPropagation(),confirm(`Supprimer "${r[g].nom}" ?`)&&(s([g]),a.selected.delete(g),i())})});const I=e.querySelector("#prevPageBtn"),q=e.querySelector("#nextPageBtn");I==null||I.addEventListener("click",()=>{a.page>1&&(a.page--,i())}),q==null||q.addEventListener("click",()=>{a.page<m&&(a.page++,i())})}function l(r){return a.sortField!==r?'<i class="fas fa-sort admin-sort-inactive"></i>':a.sortDir==="asc"?'<i class="fas fa-sort-up"></i>':'<i class="fas fa-sort-down"></i>'}i(),window.addEventListener("admin-data-changed",()=>{i()})}function K(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function He(e,t){return e?e.length>t?e.slice(0,t)+"...":e:""}function yn(e,t){let n=null;return(...s)=>{n&&clearTimeout(n),n=setTimeout(()=>e(...s),t)}}const bn={nom:[/^nom$/i,/^name$/i,/^établissement$/i,/^entreprise$/i,/^raison/i],adresse:[/^adresse$/i,/^address$/i,/^rue$/i,/^voie$/i],codePostal:[/^code.?postal$/i,/^cp$/i,/^postal/i,/^zip/i],ville:[/^ville$/i,/^city$/i,/^commune$/i,/^localité$/i],type:[/^type$/i,/^catégorie$/i,/^category$/i,/^activité$/i],niveau:[/^niveau$/i,/^level$/i,/^niv$/i],telephone:[/^t[ée]l[ée]?phone$/i,/^tel$/i,/^phone$/i,/^mobile$/i],email:[/^e?.?mail$/i,/^courriel$/i],contact:[/^contact$/i,/^responsable$/i,/^interlocuteur$/i],commentaire:[/^commentaire$/i,/^comment$/i,/^note$/i,/^remarque$/i],lat:[/^lat$/i,/^latitude$/i],lon:[/^lon$/i,/^lng$/i,/^longitude$/i]};function $n(e,t){const{onImport:n}=t;let s=null,o=rt(),a={skipDuplicates:!0,autoGeocode:!0};i();function i(){e.innerHTML=`
      <div class="admin-import-panel">
        <h3 class="admin-form-title">
          <i class="fas fa-file-import"></i>
          Importer des lieux depuis un fichier
        </h3>

        <div class="admin-import-dropzone" id="dropzone">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Glissez-déposez un fichier ici</p>
          <span>ou</span>
          <label class="admin-btn admin-btn-secondary">
            <i class="fas fa-folder-open"></i> Parcourir
            <input type="file" accept=".csv,.xlsx,.xls" id="fileInput" style="display: none;">
          </label>
          <p class="admin-import-formats">Formats acceptés : CSV, Excel (.xlsx, .xls)</p>
        </div>

        <div class="admin-import-help">
          <h4><i class="fas fa-info-circle"></i> Format attendu</h4>
          <p>Le fichier doit contenir une ligne d'en-tête avec au minimum les colonnes :</p>
          <ul>
            <li><strong>Nom</strong> - Nom de l'établissement</li>
            <li><strong>Adresse</strong> - Adresse postale</li>
            <li><strong>Code postal</strong> - Code postal (5 chiffres)</li>
            <li><strong>Ville</strong> - Nom de la ville</li>
          </ul>
          <p>Colonnes optionnelles : Type, Niveau, Téléphone, Email, Contact, Commentaire, Latitude, Longitude</p>
        </div>

        <div class="admin-form-actions">
          <button type="button" class="admin-btn admin-btn-cancel" id="cancelBtn">
            <i class="fas fa-times"></i> Annuler
          </button>
        </div>
      </div>
    `,l()}function l(){const d=e.querySelector("#dropzone"),f=e.querySelector("#fileInput"),E=e.querySelector("#cancelBtn");["dragenter","dragover"].forEach(p=>{d.addEventListener(p,y=>{y.preventDefault(),d.classList.add("dragover")})}),["dragleave","drop"].forEach(p=>{d.addEventListener(p,y=>{y.preventDefault(),d.classList.remove("dragover")})}),d.addEventListener("drop",p=>{var C;const y=(C=p.dataTransfer)==null?void 0:C.files;y&&y.length>0&&r(y[0])}),f.addEventListener("change",()=>{f.files&&f.files.length>0&&r(f.files[0])}),E.addEventListener("click",()=>{})}async function r(d){var E,p;const f=(E=d.name.split(".").pop())==null?void 0:E.toLowerCase();e.innerHTML=`
      <div class="admin-import-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Lecture du fichier...</p>
      </div>
    `;try{if(f==="csv")s=await En(d);else if(f==="xlsx"||f==="xls")s=await wn(d);else throw new Error("Format de fichier non supporté");if(s.rows.length===0)throw new Error("Le fichier est vide");o=Ln(s.headers),c()}catch(y){e.innerHTML=`
        <div class="admin-import-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Erreur lors de la lecture du fichier</p>
          <span>${y.message}</span>
          <button type="button" class="admin-btn admin-btn-secondary" id="retryBtn">
            <i class="fas fa-redo"></i> Réessayer
          </button>
        </div>
      `,(p=e.querySelector("#retryBtn"))==null||p.addEventListener("click",i)}}function c(){if(!s)return;const d=s.rows.slice(0,5),f=s.rows.length;e.innerHTML=`
      <div class="admin-import-preview">
        <h3 class="admin-form-title">
          <i class="fas fa-table"></i>
          Aperçu et mapping des colonnes
        </h3>

        <div class="admin-import-stats">
          <span><i class="fas fa-file"></i> ${f} lignes détectées</span>
          <span><i class="fas fa-columns"></i> ${s.headers.length} colonnes</span>
        </div>

        <div class="admin-import-mapping">
          <h4>Correspondance des colonnes</h4>
          <p class="admin-import-mapping-desc">Associez chaque champ avec la colonne correspondante du fichier.</p>

          <div class="admin-import-mapping-grid">
            ${m()}
          </div>
        </div>

        <div class="admin-import-preview-table-container">
          <h4>Aperçu des données</h4>
          <table class="admin-import-preview-table">
            <thead>
              <tr>
                ${s.headers.map((E,p)=>`
                  <th class="${q(p)?"mapped":""}">
                    ${Le(E)}
                    ${q(p)?`<span class="mapped-badge">${b(p)}</span>`:""}
                  </th>
                `).join("")}
              </tr>
            </thead>
            <tbody>
              ${d.map(E=>`
                <tr>
                  ${E.map((p,y)=>`
                    <td class="${q(y)?"mapped":""}">${Le(Sn(p,30))}</td>
                  `).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
          ${f>5?`<p class="admin-import-more">... et ${f-5} autres lignes</p>`:""}
        </div>

        <div class="admin-import-options">
          <h4>Options d'import</h4>
          <label class="admin-checkbox">
            <input type="checkbox" id="skipDuplicates" ${a.skipDuplicates?"checked":""}>
            <span>Ignorer les doublons (même nom et ville)</span>
          </label>
          <label class="admin-checkbox">
            <input type="checkbox" id="autoGeocode" ${a.autoGeocode?"checked":""}>
            <span>Géocoder automatiquement les adresses</span>
          </label>
        </div>

        <div class="admin-form-actions">
          <button type="button" class="admin-btn admin-btn-cancel" id="backBtn">
            <i class="fas fa-arrow-left"></i> Retour
          </button>
          <button type="button" class="admin-btn admin-btn-primary" id="importBtn" ${g()?"":"disabled"}>
            <i class="fas fa-file-import"></i> Importer ${f} lieu${f>1?"x":""}
          </button>
        </div>
      </div>
    `,h()}function m(){return[{key:"nom",label:"Nom *",required:!0},{key:"adresse",label:"Adresse *",required:!0},{key:"codePostal",label:"Code postal *",required:!0},{key:"ville",label:"Ville *",required:!0},{key:"type",label:"Type",required:!1},{key:"niveau",label:"Niveau",required:!1},{key:"telephone",label:"Téléphone",required:!1},{key:"email",label:"Email",required:!1},{key:"contact",label:"Contact",required:!1},{key:"commentaire",label:"Commentaire",required:!1},{key:"lat",label:"Latitude",required:!1},{key:"lon",label:"Longitude",required:!1}].map(({key:f,label:E,required:p})=>`
      <div class="admin-import-mapping-item ${p?"required":""}">
        <label>${E}</label>
        <select class="admin-input" data-field="${f}">
          <option value="-1">${p?"-- Sélectionner --":"-- Non importé --"}</option>
          ${s.headers.map((y,C)=>`
            <option value="${C}" ${o[f]===C?"selected":""}>${Le(y)}</option>
          `).join("")}
        </select>
      </div>
    `).join("")}function h(){var E,p;e.querySelectorAll(".admin-import-mapping-item select").forEach(y=>{y.addEventListener("change",()=>{const C=y.dataset.field;o[C]=parseInt(y.value,10),c()})});const d=e.querySelector("#skipDuplicates"),f=e.querySelector("#autoGeocode");d==null||d.addEventListener("change",()=>{a.skipDuplicates=d.checked}),f==null||f.addEventListener("change",()=>{a.autoGeocode=f.checked}),(E=e.querySelector("#backBtn"))==null||E.addEventListener("click",i),(p=e.querySelector("#importBtn"))==null||p.addEventListener("click",v)}async function v(){if(!s||!g())return;const d=s.rows.length;let f=0,E=0,p=0;const y=[];e.innerHTML=`
      <div class="admin-import-progress">
        <h3><i class="fas fa-cog fa-spin"></i> Import en cours...</h3>
        <div class="admin-progress-bar">
          <div class="admin-progress-fill" id="progressFill" style="width: 0%"></div>
        </div>
        <p class="admin-progress-text" id="progressText">0 / ${d}</p>
        <p class="admin-progress-status" id="progressStatus">Préparation...</p>
      </div>
    `;const C=e.querySelector("#progressFill"),M=e.querySelector("#progressText"),N=e.querySelector("#progressStatus");for(let D=0;D<s.rows.length;D++){const G=s.rows[D],dt=Math.round((D+1)/d*100);C.style.width=`${dt}%`,M.textContent=`${D+1} / ${d}`;try{const B=A(G);if(a.skipDuplicates&&Ft(B.nom,B.ville)){E++,N.textContent=`Ignoré: ${B.nom} (doublon)`;continue}if(a.autoGeocode&&B.lat===null){N.textContent=`Géocodage: ${B.nom}...`;const ge=await it(B.adresse,B.codePostal,B.ville);ge&&(B.lat=ge.lat,B.lon=ge.lon),await new Promise(ut=>setTimeout(ut,100))}y.push(B),f++,N.textContent=`Importé: ${B.nom}`}catch{p++,N.textContent=`Erreur ligne ${D+1}`}}$(f,E,p,y)}function $(d,f,E,p){var y,C;e.innerHTML=`
      <div class="admin-import-results">
        <h3><i class="fas fa-check-circle"></i> Import terminé</h3>

        <div class="admin-import-results-stats">
          <div class="stat success">
            <i class="fas fa-check"></i>
            <span class="number">${d}</span>
            <span class="label">importé${d>1?"s":""}</span>
          </div>
          <div class="stat warning">
            <i class="fas fa-forward"></i>
            <span class="number">${f}</span>
            <span class="label">ignoré${f>1?"s":""}</span>
          </div>
          <div class="stat error">
            <i class="fas fa-times"></i>
            <span class="number">${E}</span>
            <span class="label">erreur${E>1?"s":""}</span>
          </div>
        </div>

        <div class="admin-form-actions">
          <button type="button" class="admin-btn admin-btn-secondary" id="importMoreBtn">
            <i class="fas fa-plus"></i> Importer un autre fichier
          </button>
          <button type="button" class="admin-btn admin-btn-primary" id="finishBtn">
            <i class="fas fa-check"></i> Terminer
          </button>
        </div>
      </div>
    `,(y=e.querySelector("#importMoreBtn"))==null||y.addEventListener("click",i),(C=e.querySelector("#finishBtn"))==null||C.addEventListener("click",()=>{p.length>0&&n(p)})}function A(d){return{nom:w(d,o.nom)||"",adresse:w(d,o.adresse)||"",codePostal:w(d,o.codePostal)||"",ville:w(d,o.ville)||"",type:w(d,o.type)||"",niveau:w(d,o.niveau)||"",telephone:w(d,o.telephone)||"",email:w(d,o.email)||"",contact:w(d,o.contact)||"",commentaire:w(d,o.commentaire)||"",lat:I(w(d,o.lat)),lon:I(w(d,o.lon))}}function w(d,f){return f<0||f>=d.length?"":d[f].trim()}function I(d){if(!d)return null;const f=parseFloat(d.replace(",","."));return isNaN(f)?null:f}function q(d){return Object.values(o).includes(d)}function b(d){for(const[f,E]of Object.entries(o))if(E===d)return f;return""}function g(){return o.nom>=0&&o.adresse>=0&&o.codePostal>=0&&o.ville>=0}}async function En(e){const n=(await e.text()).split(/\r?\n/).filter(r=>r.trim());if(n.length===0)throw new Error("Fichier vide");const o=n[0].includes(";")?";":",",a=r=>{const c=[];let m="",h=!1;for(let v=0;v<r.length;v++){const $=r[v];$==='"'?h&&r[v+1]==='"'?(m+='"',v++):h=!h:$===o&&!h?(c.push(m),m=""):m+=$}return c.push(m),c},i=a(n[0]),l=n.slice(1).map(a);return{headers:i,rows:l}}async function wn(e){const t=await ce(()=>import("./export-AiKJFuQl.js").then(c=>c.x),__vite__mapDeps([0,1]),import.meta.url),n=await e.arrayBuffer(),s=t.read(n,{type:"array"}),o=s.SheetNames[0],a=s.Sheets[o],i=t.utils.sheet_to_json(a,{header:1,defval:""});if(i.length===0)throw new Error("Feuille vide");const l=i[0].map(String),r=i.slice(1).map(c=>c.map(String));return{headers:l,rows:r}}function Ln(e){const t=rt();return e.forEach((n,s)=>{const o=n.toLowerCase().trim();for(const[a,i]of Object.entries(bn))if(t[a]===-1){for(const l of i)if(l.test(o)){t[a]=s;break}}}),t}function rt(){return{nom:-1,adresse:-1,codePostal:-1,ville:-1,type:-1,niveau:-1,telephone:-1,email:-1,contact:-1,commentaire:-1,lat:-1,lon:-1}}function Le(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function Sn(e,t){return e?e.length>t?e.slice(0,t)+"...":e:""}let U="add",z,x=null;function Cn(){cn(()=>{xn()})}function X(){x&&(x.classList.add("closing"),setTimeout(()=>{x==null||x.remove(),x=null},300))}function xn(){x&&x.remove(),x=document.createElement("div"),x.className="admin-modal-overlay",x.innerHTML=`
    <div class="admin-modal">
      <div class="admin-modal-header">
        <h2><i class="fas fa-cog"></i> Administration des Lieux de Stage</h2>
        <button type="button" class="admin-modal-close" id="closeAdminBtn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <nav class="admin-tabs">
        <button type="button" class="admin-tab ${U==="add"?"active":""}" data-tab="add">
          <i class="fas fa-plus-circle"></i>
          <span>Ajouter</span>
        </button>
        <button type="button" class="admin-tab ${U==="import"?"active":""}" data-tab="import">
          <i class="fas fa-file-import"></i>
          <span>Importer</span>
        </button>
        <button type="button" class="admin-tab ${U==="manage"?"active":""}" data-tab="manage">
          <i class="fas fa-list"></i>
          <span>Gérer</span>
        </button>
        <button type="button" class="admin-tab ${U==="settings"?"active":""}" data-tab="settings">
          <i class="fas fa-cog"></i>
          <span>Paramètres</span>
        </button>
      </nav>

      <div class="admin-content" id="adminContent">
        <!-- Content will be rendered here -->
      </div>
    </div>
  `,document.body.appendChild(x),x.querySelector("#closeAdminBtn").addEventListener("click",X),x.addEventListener("click",n=>{n.target===x&&X()}),x.querySelectorAll(".admin-tab").forEach(n=>{n.addEventListener("click",()=>{const s=n.dataset.tab;he(s)})});const t=n=>{n.key==="Escape"&&(X(),document.removeEventListener("keydown",t))};document.addEventListener("keydown",t),lt(U)}function he(e){U=e,z=void 0,x==null||x.querySelectorAll(".admin-tab").forEach(t=>{t.classList.toggle("active",t.dataset.tab===e)}),lt(e)}function lt(e){const t=x==null?void 0:x.querySelector("#adminContent");if(t)switch(e){case"add":ct(t);break;case"import":kn(t);break;case"manage":An(t);break;case"settings":In(t);break}}function ct(e){const t=z!==void 0?u.locations[z]:void 0;vn(e,{location:t,index:z,onSave:(n,s)=>{s!==void 0?(Dt(s,n),fe(),F({message:"Lieu modifié avec succès",type:"success"})):(et(n),fe(),F({message:"Lieu ajouté avec succès",type:"success"})),z=void 0,ct(e)},onCancel:()=>{z=void 0,z!==void 0&&he("manage")}})}function kn(e){$n(e,{onImport:t=>{let n=0;for(const s of t)et(s),n++;fe(),F({message:`${n} lieu${n>1?"x":""} importé${n>1?"s":""} avec succès`,type:"success"}),he("manage")}})}function An(e){gn(e,{onEdit:t=>{z=t,he("add")},onDelete:t=>{t.sort((n,s)=>s-n).forEach(n=>{_t(n)}),fe(),F({message:`${t.length} lieu${t.length>1?"x":""} supprimé${t.length>1?"s":""}`,type:"success"}),window.dispatchEvent(new CustomEvent("admin-data-changed"))},onLocate:t=>{X(),setTimeout(()=>{Pe(t,{zoom:15,openPopup:!0})},300)}})}function In(e){e.innerHTML=`
    <div class="admin-settings">
      <div class="admin-settings-section">
        <h3><i class="fas fa-key"></i> Sécurité</h3>
        <div id="changeCodeContainer"></div>
      </div>

      <div class="admin-settings-section">
        <h3><i class="fas fa-download"></i> Export des données</h3>
        <p class="admin-settings-desc">Téléchargez toutes les données au format JSON pour sauvegarde.</p>
        <button type="button" class="admin-btn admin-btn-secondary" id="exportDataBtn">
          <i class="fas fa-download"></i> Exporter les données (JSON)
        </button>
      </div>

      <div class="admin-settings-section">
        <h3><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="admin-stats-grid" id="statsGrid">
          <!-- Stats will be rendered here -->
        </div>
      </div>

      <div class="admin-settings-section">
        <h3><i class="fas fa-sign-out-alt"></i> Session</h3>
        <p class="admin-settings-desc">Déconnectez-vous de l'interface d'administration.</p>
        <button type="button" class="admin-btn admin-btn-danger" id="logoutBtn">
          <i class="fas fa-sign-out-alt"></i> Se déconnecter
        </button>
      </div>
    </div>
  `;const t=e.querySelector("#changeCodeContainer");dn(t),e.querySelector("#exportDataBtn").addEventListener("click",()=>{const o=Me(),a=JSON.stringify(o,null,2),i=new Blob([a],{type:"application/json"}),l=URL.createObjectURL(i),r=document.createElement("a");r.href=l,r.download=`lieux-stage-${new Date().toISOString().split("T")[0]}.json`,r.click(),URL.revokeObjectURL(l),F({message:"Données exportées",type:"success"})}),Tn(e.querySelector("#statsGrid")),e.querySelector("#logoutBtn").addEventListener("click",()=>{on(),X(),F({message:"Déconnexion réussie",type:"info"})})}function Tn(e){const t=u.locations,n=t.length,s=t.filter(i=>i.lat!==null&&i.lon!==null).length,o=new Set(t.map(i=>i.ville)).size,a=new Set(t.map(i=>i.type)).size;e.innerHTML=`
    <div class="admin-stat-card">
      <i class="fas fa-map-marker-alt"></i>
      <div class="admin-stat-value">${n}</div>
      <div class="admin-stat-label">Lieux de stage</div>
    </div>
    <div class="admin-stat-card">
      <i class="fas fa-crosshairs"></i>
      <div class="admin-stat-value">${s}</div>
      <div class="admin-stat-label">Géolocalisés</div>
    </div>
    <div class="admin-stat-card">
      <i class="fas fa-city"></i>
      <div class="admin-stat-value">${o}</div>
      <div class="admin-stat-label">Villes</div>
    </div>
    <div class="admin-stat-card">
      <i class="fas fa-tags"></i>
      <div class="admin-stat-value">${a}</div>
      <div class="admin-stat-label">Types</div>
    </div>
  `}function fe(){const e=Me();We(e),qe()}async function je(){console.log("🚀 Initialisation de l'application...");try{Zt(),await kt(),Gt(),Mn(),await qn(),Pn(),Ve(),console.log("✅ Application initialisée avec succès")}catch(e){console.error("❌ Erreur lors de l'initialisation:",e),F({message:"Erreur lors du chargement de l'application",type:"error",duration:5e3}),Ve()}}function Mn(){const e=document.querySelector(".container");if(!e){console.error("Container principal non trouvé");return}e.querySelector(".sidebar");const t=document.querySelector(".header-right");if(t){const s=document.createElement("div");s.className="theme-toggle-container",t.prepend(s),Rt(s)}const n=document.getElementById("map");n&&Qt(n)}async function qn(){_n("Chargement des données...");const e=await Xe();We(e),Ae(),qe(),setTimeout(()=>{st()},100),F({message:`${e.length} lieux de stage chargés`,type:"success",duration:3e3})}function Pn(){j("FILTER_CHANGED",()=>{Ae(),Ge()}),j("DATA_LOADED",()=>{Ae(),Ge()}),window.addEventListener("sidebar-toggle",()=>{ze()}),window.addEventListener("locate-on-map",e=>{const{index:t}=e.detail;t!==void 0&&Pe(t,{zoom:15,openPopup:!0})}),window.addEventListener("location-selected",e=>{const{index:t}=e.detail;t!==void 0&&Dn(t)}),window.addEventListener("resize",()=>{ze()}),document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();const t=document.getElementById("searchInput");t==null||t.focus()}e.key==="Escape"&&Fn(),e.key==="h"&&!On()&&en(!u.heatmapEnabled)}),Nn()}function Nn(){const e=document.getElementById("adminBtn");e&&e.addEventListener("click",()=>{Cn()});const t=document.getElementById("searchInput");t&&t.addEventListener("input",Rn(()=>{J({search:t.value})},300));const n=document.getElementById("exportCSV"),s=document.getElementById("exportJSON"),o=document.getElementById("exportPDF");n&&n.addEventListener("click",async()=>{const{exportAsCsv:r}=await ce(async()=>{const{exportAsCsv:c}=await import("./export.service-C6QbVkJa.js");return{exportAsCsv:c}},__vite__mapDeps([2,0,1]),import.meta.url);await r(u.filteredIndices),F({message:"Export CSV téléchargé",type:"success"})}),s&&s.addEventListener("click",async()=>{const{exportAsJson:r}=await ce(async()=>{const{exportAsJson:c}=await import("./export.service-C6QbVkJa.js");return{exportAsJson:c}},__vite__mapDeps([2,0,1]),import.meta.url);await r(u.filteredIndices),F({message:"Export JSON téléchargé",type:"success"})}),o&&o.addEventListener("click",async()=>{const{exportAsPdf:r}=await ce(async()=>{const{exportAsPdf:c}=await import("./export.service-C6QbVkJa.js");return{exportAsPdf:c}},__vite__mapDeps([2,0,1]),import.meta.url);await r(u.filteredIndices),F({message:"Export PDF généré",type:"success"})});const a=document.getElementById("resetBtn");a&&a.addEventListener("click",()=>{t&&(t.value="");const r=document.getElementById("domaineFilter"),c=document.getElementById("niveauFilter");r&&(r.value=""),c&&(c.value=""),J({search:"",domains:[],levelMin:1,levelMax:5,distanceKm:null,referencePoint:null,favoritesOnly:!1})});const i=document.getElementById("domaineFilter");if(i){let r=function(){const c=u.uniqueTypes;i.innerHTML='<option value="">Tous</option>',c.forEach(m=>{const h=document.createElement("option");h.value=m,h.textContent=m,i.appendChild(h)})};i.addEventListener("change",()=>{const c=i.value;J({domains:c?[c]:[]})}),r(),j("DATA_LOADED",r)}const l=document.getElementById("niveauFilter");l&&l.addEventListener("change",()=>{const r=l.value;J(r?{levelMin:parseInt(r),levelMax:parseInt(r)}:{levelMin:1,levelMax:5})})}function Ae(){const e=document.getElementById("resultsCount");if(!e)return;const t=u.locations.length,n=u.filteredIndices.length,s=e.querySelector("span");s&&(n===t?s.textContent=`${t} lieu${t>1?"x":""} de stage`:s.textContent=`${n} / ${t} lieu${n>1?"x":""}`)}function Ge(){const e=document.getElementById("resultsList");if(!e)return;const t=u.filteredIndices,n=50,s=t.slice(0,n);if(s.length===0){e.innerHTML=`
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>Aucun résultat trouvé</p>
      </div>
    `;return}const o=s.map(a=>{const i=u.locations[a],l=Bn(i.niveau);return`
      <div class="result-item" data-index="${a}">
        <div class="result-item-header">
          <span class="result-item-name">${Se(i.nom)}</span>
          ${i.niveau?`<span class="result-item-niveau" style="background: linear-gradient(135deg, ${l} 0%, ${l} 100%)">Niv. ${i.niveau}</span>`:""}
        </div>
        <div class="result-item-ville">
          <i class="fas fa-map-marker-alt"></i>
          ${Se(i.ville)} (${i.codePostal})
        </div>
        <div class="result-item-type">
          <i class="fas fa-utensils"></i>
          ${Se(i.type)}
        </div>
        <div class="result-item-actions">
          <button class="result-item-btn btn-locate" title="Localiser sur la carte">
            <i class="fas fa-crosshairs"></i> Localiser
          </button>
          ${i.telephone?`
            <a href="tel:${i.telephone}" class="result-item-btn btn-call" title="Appeler">
              <i class="fas fa-phone"></i> Appeler
            </a>
          `:""}
        </div>
      </div>
    `}).join("");if(e.innerHTML=o,t.length>n){const a=document.createElement("div");a.className="results-more",a.innerHTML=`<p>+ ${t.length-n} autres résultats (affiner la recherche)</p>`,e.appendChild(a)}e.querySelectorAll(".result-item").forEach(a=>{var l;const i=parseInt(a.dataset.index||"-1",10);(l=a.querySelector(".btn-locate"))==null||l.addEventListener("click",r=>{r.stopPropagation(),window.dispatchEvent(new CustomEvent("locate-on-map",{detail:{index:i}}))}),a.addEventListener("click",()=>{e.querySelectorAll(".result-item.active").forEach(r=>r.classList.remove("active")),a.classList.add("active"),window.dispatchEvent(new CustomEvent("locate-on-map",{detail:{index:i}}))})})}function Bn(e){if(!e)return"#94a3b8";const t=e.match(/(\d)/);if(!t)return"#94a3b8";const n=parseInt(t[1],10);return["#22c55e","#84cc16","#eab308","#f97316","#8b5cf6"][n-1]||"#94a3b8"}function Se(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function Dn(e){const t=document.getElementById("resultsList");if(!t)return;const n=t.querySelector(`[data-index="${e}"]`);n&&(n.scrollIntoView({behavior:"smooth",block:"center"}),n.classList.add("highlight"),setTimeout(()=>n.classList.remove("highlight"),2e3))}function _n(e){const t=document.querySelector(".loading-text");t&&(t.textContent=e)}function Ve(){const e=document.getElementById("loadingOverlay");e&&(e.style.opacity="0",setTimeout(()=>{e.style.display="none"},300))}function Fn(){document.querySelectorAll(".modal-overlay").forEach(s=>{s.style.display="none"});const t=document.querySelector(".admin-modal-overlay");t&&(t.classList.add("closing"),setTimeout(()=>t.remove(),300));const n=document.querySelector(".admin-auth-modal");n&&n.remove()}function On(){const e=document.activeElement;return e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement||e instanceof HTMLSelectElement}function Rn(e,t){let n=null;return(...s)=>{n&&clearTimeout(n),n=setTimeout(()=>e(...s),t)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",je):je();export{jn as f,Gn as g,u as s};
//# sourceMappingURL=main-BNfcpJBG.js.map
