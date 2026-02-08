const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./export-AiKJFuQl.js","./leaflet-C4iS2aBk.js","./export.service-B5insj9F.js"])))=>i.map(i=>d[i]);
import{_ as $e}from"./export-AiKJFuQl.js";import"./leaflet-C4iS2aBk.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();function rt(e,t={deep:!0}){const n=new Set,a={get(s,r){const l=Reflect.get(s,r);return t.deep&&l&&typeof l=="object"&&!Array.isArray(l)&&!(l instanceof Map)&&!(l instanceof Set)&&!(l instanceof WeakMap)&&!(l instanceof WeakSet)?rt(l,t):l},set(s,r,l){const o=Reflect.get(s,r);if(o===l)return!0;const d=Reflect.set(s,r,l);return d&&n.forEach(p=>{p(l,o,String(r))}),d},deleteProperty(s,r){const l=Reflect.get(s,r),o=Reflect.deleteProperty(s,r);return o&&n.forEach(d=>{d(void 0,l,String(r))}),o}},i=new Proxy(e,a);return i.$subscribe=s=>(n.add(s),()=>n.delete(s)),i.$subscribers=n,i}let Me=[],qe=!1;function ze(e){if(qe){Me.push(e);return}for(qe=!0,e();Me.length>0;){const t=Me.shift();t==null||t()}qe=!1}function lt(e){return new Promise((t,n)=>{e.oncomplete=e.onsuccess=()=>t(e.result),e.onabort=e.onerror=()=>n(e.error)})}function xt(e,t){let n;const a=()=>{if(n)return n;const i=indexedDB.open(e);return i.onupgradeneeded=()=>i.result.createObjectStore(t),n=lt(i),n.then(s=>{s.onclose=()=>n=void 0},()=>{}),n};return(i,s)=>a().then(r=>s(r.transaction(t,i).objectStore(t)))}let Pe;function At(){return Pe||(Pe=xt("keyval-store","keyval")),Pe}function kt(e,t=At()){return t("readonly",n=>lt(n.get(e)))}const ct="carte-stages-state",dt=1,Ye="carte-stages-notes";function It(e){try{const t={version:dt,...e,timestamp:Date.now()};localStorage.setItem(ct,JSON.stringify(t))}catch(t){console.warn("Erreur lors de la sauvegarde de l'état:",t)}}async function Tt(){try{const e=localStorage.getItem(ct);if(!e)return null;const t=JSON.parse(e);if(t.version!==dt)return console.log("Version de stockage différente, migration..."),Mt(t);const n=await qt();return{theme:t.theme||"auto",favorites:t.favorites||[],personalNotes:n||t.personalNotes||{},sidebarCollapsed:t.sidebarCollapsed||!1,mapCenter:t.mapCenter||{lat:46.5,lon:-.3},mapZoom:t.mapZoom||9,lastFilters:t.lastFilters||{}}}catch(e){return console.warn("Erreur lors du chargement de l'état:",e),null}}function Mt(e){return{theme:e.theme||"auto",favorites:e.favorites||[],personalNotes:e.personalNotes||{},sidebarCollapsed:!1,mapCenter:{lat:46.5,lon:-.3},mapZoom:9,lastFilters:{}}}async function qt(){try{return await kt(Ye)||null}catch(e){console.warn("Erreur lors du chargement des notes depuis IndexedDB:",e);try{const t=localStorage.getItem(Ye);return t?JSON.parse(t):null}catch{return null}}}const Re=new Map;function Fe(e,t,n=5*60*1e3){Re.set(e,{data:t,expires:Date.now()+n})}function ut(e){const t=Re.get(e);return t?Date.now()>t.expires?(Re.delete(e),null):t.data:null}const Pt={search:"",domains:[],levelMin:1,levelMax:5,distanceKm:null,referencePoint:null,favoritesOnly:!1},Nt={field:"nom",direction:"asc"},Bt={locations:[],filteredIndices:[],searchIndex:new Map,isLoading:!0,theme:"auto",viewMode:"split",sidebarCollapsed:!1,detailPanelOpen:!1,selectedLocationIndex:null,filters:Pt,sortOptions:Nt,favorites:new Set,compareList:[],personalNotes:new Map,mapCenter:{lat:46.5,lon:-.3},mapZoom:9,heatmapEnabled:!1,clusteringEnabled:!0,userLocation:null,uniqueTypes:[],uniqueCities:[]},m=rt(Bt),ae={};function me(e,t){const n=ae[e];n&&n.forEach(a=>{a({type:e,payload:t})})}function K(e,t){return ae[e]||(ae[e]=new Set),ae[e].add(t),()=>{ae[e].delete(t)}}function mt(e){ze(()=>{m.locations=e,m.filteredIndices=e.map((t,n)=>n),m.uniqueTypes=[...new Set(e.map(t=>t.type).filter(Boolean))].sort(),m.uniqueCities=[...new Set(e.map(t=>t.ville).filter(Boolean))].sort(),Dt()}),me("DATA_LOADED",e)}function Dt(){m.searchIndex.clear(),m.locations.forEach((e,t)=>{const n=[e.nom,e.adresse,e.ville,e.codePostal,e.type,e.contact,e.commentaire].filter(Boolean).join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");m.searchIndex.set(t,n)})}function ne(e){ze(()=>{m.filters={...m.filters,...e},pt()}),me("FILTER_CHANGED",e)}function pt(){const{filters:e,sortOptions:t,locations:n,searchIndex:a,favorites:i,userLocation:s}=m,r=e.search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");let l=n.map((o,d)=>d);if(r&&(l=l.filter(o=>(a.get(o)||"").includes(r))),e.domains.length>0&&(l=l.filter(o=>{const d=n[o];return e.domains.includes(d.type)})),l=l.filter(o=>{const d=n[o],p=Ne(d.niveau);return p===null?!0:p>=e.levelMin&&p<=e.levelMax}),e.distanceKm!==null&&e.referencePoint){const o=e.referencePoint;l=l.filter(d=>{const p=n[d];return p.lat===null||p.lon===null?!1:Be(o.lat,o.lon,p.lat,p.lon)<=e.distanceKm})}e.favoritesOnly&&(l=l.filter(o=>{const d=n[o],p=pe(d);return i.has(p)})),l.sort((o,d)=>{const p=n[o],g=n[d];let f=0;switch(t.field){case"nom":f=p.nom.localeCompare(g.nom,"fr");break;case"ville":f=p.ville.localeCompare(g.ville,"fr");break;case"niveau":const w=Ne(p.niveau)??99,E=Ne(g.niveau)??99;f=w-E;break;case"type":f=p.type.localeCompare(g.type,"fr");break;case"distance":if(s){const C=p.lat&&p.lon?Be(s.lat,s.lon,p.lat,p.lon):1/0,k=g.lat&&g.lon?Be(s.lat,s.lon,g.lat,g.lon):1/0;f=C-k}break}return t.direction==="asc"?f:-f}),m.filteredIndices=l}function Ne(e){if(!e)return null;const t=e.match(/(\d)/);return t?parseInt(t[1],10):null}function Be(e,t,n,a){const s=ge(n-e),r=ge(a-t),l=Math.sin(s/2)*Math.sin(s/2)+Math.cos(ge(e))*Math.cos(ge(n))*Math.sin(r/2)*Math.sin(r/2);return 6371*(2*Math.atan2(Math.sqrt(l),Math.sqrt(1-l)))}function ge(e){return e*(Math.PI/180)}function pe(e){return`${e.nom}-${e.codePostal}-${e.ville}`.toLowerCase().replace(/\s+/g,"-")}function _t(e){m.favorites.has(e)?m.favorites.delete(e):m.favorites.add(e),m.filters.favoritesOnly&&pt(),me("FAVORITE_TOGGLED",e),ft()}function Rt(e){m.theme=e,Oe(e),me("THEME_CHANGED",e),ft()}function Oe(e){const t=document.documentElement;if(e==="auto"){const n=window.matchMedia("(prefers-color-scheme: dark)").matches;t.setAttribute("data-theme",n?"dark":"light")}else t.setAttribute("data-theme",e)}function Ft(e,t){m.mapCenter=e,m.mapZoom=t,me("MAP_MOVED",{center:e,zoom:t})}function ft(){It({theme:m.theme,favorites:Array.from(m.favorites),personalNotes:Object.fromEntries(m.personalNotes),sidebarCollapsed:m.sidebarCollapsed,mapCenter:m.mapCenter,mapZoom:m.mapZoom,lastFilters:{domains:m.filters.domains,levelMin:m.filters.levelMin,levelMax:m.filters.levelMax}})}async function Ot(){const e=await Tt();e&&(ze(()=>{m.theme=e.theme,m.favorites=new Set(e.favorites),m.personalNotes=new Map(Object.entries(e.personalNotes)),m.sidebarCollapsed=e.sidebarCollapsed,m.mapCenter=e.mapCenter,m.mapZoom=e.mapZoom,e.lastFilters&&(m.filters={...m.filters,...e.lastFilters})}),Oe(m.theme)),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{m.theme==="auto"&&Oe("auto")})}function Ht(e,t){let n=null;return(...a)=>{n&&clearTimeout(n),n=setTimeout(()=>{e(...a),n=null},t)}}function V(e){return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim()}function cs(e=new Date){return e.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"})}function ds(e,t){const a=new Date().toISOString().slice(0,19).replace(/[:-]/g,"").replace("T","_");return`${e}_${a}.${t}`}function jt(){return`${Date.now()}-${Math.random().toString(36).substr(2,9)}`}const fe="/api/v1";function Ve(e){return{id:e.id,nom:e.nom,adresse:e.adresse,codePostal:e.code_postal,ville:e.ville,type:e.type,niveau:e.niveau||"",telephone:e.telephone||"",contact:e.contact||"",email:e.email||"",commentaire:e.commentaire||"",lat:e.lat,lon:e.lon}}function zt(e){return{nom:e.nom,adresse:e.adresse,code_postal:e.codePostal,ville:e.ville,type:e.type,niveau:e.niveau||null,telephone:e.telephone||null,contact:e.contact||null,email:e.email||null,commentaire:e.commentaire||null,lat:e.lat,lon:e.lon}}function Ce(){return{"Content-Type":"application/json"}}async function Vt(){const e=await fetch(`${fe}/locations?limit=10000`,{method:"GET",headers:Ce()});if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);const t=await e.json();if(!t.success||!t.data)throw new Error(t.error||"Failed to fetch locations");return t.data.map(Ve)}async function Gt(e){const t=await fetch(`${fe}/locations`,{method:"POST",headers:Ce(),body:JSON.stringify(zt(e))}),n=await t.json();if(!t.ok||!n.success||!n.data)throw new Error(n.error||"Failed to create location");return Ve(n.data)}async function Zt(e,t){const n={};t.nom!==void 0&&(n.nom=t.nom),t.adresse!==void 0&&(n.adresse=t.adresse),t.codePostal!==void 0&&(n.code_postal=t.codePostal),t.ville!==void 0&&(n.ville=t.ville),t.type!==void 0&&(n.type=t.type),t.niveau!==void 0&&(n.niveau=t.niveau||null),t.telephone!==void 0&&(n.telephone=t.telephone||null),t.contact!==void 0&&(n.contact=t.contact||null),t.email!==void 0&&(n.email=t.email||null),t.commentaire!==void 0&&(n.commentaire=t.commentaire||null),t.lat!==void 0&&(n.lat=t.lat),t.lon!==void 0&&(n.lon=t.lon);const a=await fetch(`${fe}/locations/${e}`,{method:"PUT",headers:Ce(),body:JSON.stringify(n)}),i=await a.json();if(!a.ok||!i.success||!i.data)throw new Error(i.error||"Failed to update location");return Ve(i.data)}async function Ut(e){const t=await fetch(`${fe}/locations/${e}`,{method:"DELETE",headers:Ce()}),n=await t.json();if(!t.ok||!n.success)throw new Error(n.error||"Failed to delete location");return!0}async function Jt(){try{return(await(await fetch(`${fe}/health`,{method:"GET",signal:AbortSignal.timeout(5e3)})).json()).success===!0}catch{return!1}}let A=[],we=new Map,le=!1;async function vt(){try{if(await Jt())return console.log("API disponible, chargement depuis l'API..."),A=await Vt(),le=!0,ie(),console.log(`Chargé ${A.length} locations depuis l'API`),A}catch(e){console.log("API non disponible, utilisation du fallback...",e)}le=!1;try{const e=await fetch("./data.json");if(e.ok)return A=await e.json(),ie(),console.log(`Chargé ${A.length} locations depuis data.json`),A}catch{console.log("Chargement depuis data.json échoué, utilisation des données embarquées")}if(window.STAGE_DATA)return A=window.STAGE_DATA,ie(),A;try{const e=await fetch("./js/data.json");if(e.ok)return A=await e.json(),ie(),A}catch{console.error("Impossible de charger les données")}throw new Error("Aucune source de données disponible")}function ie(){we.clear(),A.forEach((e,t)=>{const n=V([e.nom,e.adresse,e.ville,e.codePostal,e.type,e.contact,e.commentaire].filter(Boolean).join(" "));we.set(t,n)})}function Ge(){return A}async function Ze(e){if(le)try{const a=await Gt(e);await vt();const i=A.findIndex(s=>s.nom===a.nom&&s.ville===a.ville);return i>=0?i:A.length-1}catch(a){throw console.error("Erreur lors de la création via API:",a),a}const t=A.length;A.push(e);const n=V([e.nom,e.adresse,e.ville,e.codePostal,e.type,e.contact,e.commentaire].filter(Boolean).join(" "));return we.set(t,n),t}async function Kt(e,t){if(e<0||e>=A.length)return!1;if(le){const i=A[e];if(i.id)try{await Zt(i.id,t)}catch(s){throw console.error("Erreur lors de la mise à jour via API:",s),s}}A[e]={...A[e],...t};const n=A[e],a=V([n.nom,n.adresse,n.ville,n.codePostal,n.type,n.contact,n.commentaire].filter(Boolean).join(" "));return we.set(e,a),!0}async function Wt(e){if(e<0||e>=A.length)return!1;if(le){const t=A[e];if(t.id)try{await Ut(t.id)}catch(n){throw console.error("Erreur lors de la suppression via API:",n),n}}return A.splice(e,1),ie(),!0}function Yt(e,t){const n=V(e),a=V(t);return A.some(i=>V(i.nom)===n&&V(i.ville)===a)}function Qt(e){const t=[];if(!e.nom)return t;const n=V(e.nom);return A.forEach((a,i)=>{const s=V(a.nom);if(s===n){t.push(i);return}(s.includes(n)||n.includes(s))&&t.push(i)}),t}const Ee={light:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
  </svg>`},Qe={light:"Clair",dark:"Sombre",auto:"Auto"};let N=null,R=null,ce=!1;function Xt(e){N=document.createElement("button"),N.className="theme-toggle",N.setAttribute("type","button"),N.setAttribute("aria-label","Changer le thème"),N.setAttribute("aria-haspopup","true"),N.setAttribute("aria-expanded","false"),ht(),R=document.createElement("div"),R.className="theme-dropdown",R.setAttribute("role","menu"),R.innerHTML=`
    <button class="theme-option" data-theme="light" role="menuitem">
      ${Ee.light}
      <span>Clair</span>
    </button>
    <button class="theme-option" data-theme="dark" role="menuitem">
      ${Ee.dark}
      <span>Sombre</span>
    </button>
    <button class="theme-option" data-theme="auto" role="menuitem">
      ${Ee.auto}
      <span>Automatique</span>
    </button>
  `;const t=document.createElement("div");return t.className="theme-toggle-wrapper",t.appendChild(N),t.appendChild(R),e.appendChild(t),N.addEventListener("click",en),R.querySelectorAll(".theme-option").forEach(n=>{n.addEventListener("click",()=>{const a=n.getAttribute("data-theme");nn(a),Le()})}),document.addEventListener("click",n=>{ce&&!t.contains(n.target)&&Le()}),document.addEventListener("keydown",n=>{n.key==="Escape"&&ce&&(Le(),N==null||N.focus())}),N}function ht(){if(!N)return;const e=m.theme;N.innerHTML=Ee[e],N.setAttribute("aria-label",`Thème: ${Qe[e]}. Cliquer pour changer.`),N.setAttribute("title",`Thème: ${Qe[e]}`),R==null||R.querySelectorAll(".theme-option").forEach(t=>{const n=t.getAttribute("data-theme")===e;t.classList.toggle("active",n),t.setAttribute("aria-checked",String(n))})}function en(){ce?Le():tn()}function tn(){if(!R||!N)return;ce=!0,R.classList.add("open"),N.setAttribute("aria-expanded","true");const e=R.querySelector(".theme-option.active");e==null||e.focus()}function Le(){!R||!N||(ce=!1,R.classList.remove("open"),N.setAttribute("aria-expanded","false"))}function nn(e){Rt(e),ht()}function Xe(e){const t=document.documentElement;if(e==="auto"){const a=window.matchMedia("(prefers-color-scheme: dark)").matches;t.setAttribute("data-theme",a?"dark":"light")}else t.setAttribute("data-theme",e);const n=document.querySelector('meta[name="theme-color"]');if(n){const a=e==="auto"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e;n.setAttribute("content",a==="dark"?"#1e293b":"#2563eb")}}function sn(){Xe(m.theme),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{m.theme==="auto"&&Xe("auto")})}let z=null;const oe=new Map,an={success:'<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',error:'<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',warning:'<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',info:'<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'};function gt(){return z||(z=document.createElement("div"),z.className="toast-container",z.setAttribute("role","region"),z.setAttribute("aria-label","Notifications"),z.setAttribute("aria-live","polite"),document.body.appendChild(z),z)}function on(e){const t=gt(),n=jt(),a=e.duration??4e3;({...e});const i=document.createElement("div");i.className=`toast toast-${e.type}`,i.setAttribute("role","alert"),i.dataset.toastId=n,i.innerHTML=`
    ${an[e.type]}
    <div class="toast-content">
      <p class="toast-message">${et(e.message)}</p>
      ${e.action?`
        <button class="toast-action" type="button">
          ${et(e.action.label)}
        </button>
      `:""}
    </div>
    <button class="toast-close" type="button" aria-label="Fermer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;const s=i.querySelector(".toast-close");if(s==null||s.addEventListener("click",()=>ye(n)),e.action){const l=i.querySelector(".toast-action");l==null||l.addEventListener("click",()=>{e.action.callback(),ye(n)})}t.appendChild(i),requestAnimationFrame(()=>{i.classList.add("toast-enter")});const r=window.setTimeout(()=>{ye(n)},a);if(oe.set(n,{element:i,timeout:r}),oe.size>5){const l=oe.keys().next().value;l&&ye(l)}return n}function ye(e){const t=oe.get(e);t&&(clearTimeout(t.timeout),t.element.classList.remove("toast-enter"),t.element.classList.add("toast-exit"),t.element.addEventListener("animationend",()=>{t.element.remove(),oe.delete(e)},{once:!0}))}function et(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function rn(){return gt()}function F(e){return on(e)}const ln=6371;function be(e){return e*(Math.PI/180)}function cn(e,t,n,a){const i=be(n-e),s=be(a-t),r=Math.sin(i/2)*Math.sin(i/2)+Math.cos(be(e))*Math.cos(be(n))*Math.sin(s/2)*Math.sin(s/2),l=2*Math.atan2(Math.sqrt(r),Math.sqrt(1-r));return ln*l}function dn(e){return e<1?`${Math.round(e*1e3)} m`:e<10?`${e.toFixed(1)} km`:`${Math.round(e)} km`}let q=null,Z=null,Y=null,de=new Map;const X={default:"#3b82f6",matching:"#ef4444",favorite:"#f59e0b",selected:"#10b981"};function yt(e){const{color:t,isMatching:n,isFavorite:a,isSelected:i}=e;let s=t||X.default;return i?s=X.selected:a?s=X.favorite:n&&(s=X.matching),L.divIcon({className:"custom-marker",html:`
      <div class="marker-pin" style="--marker-color: ${s}">
        <svg viewBox="0 0 36 50" width="36" height="50" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 32 18 32s18-18.5 18-32C36 8.06 27.94 0 18 0z" fill="${s}"/>
          <circle cx="18" cy="18" r="9" fill="white"/>
          <circle cx="18" cy="18" r="4.5" fill="${s}"/>
        </svg>
        ${a?'<span class="marker-star">★</span>':""}
      </div>
    `,iconSize:[36,50],iconAnchor:[18,50],popupAnchor:[0,-50]})}function un(e,t){const n=pe(e),a=m.favorites.has(n),i=m.personalNotes.get(n),s=m.userLocation;let r="";if(s&&e.lat&&e.lon){const l=cn(s.lat,s.lon,e.lat,e.lon);r=`<p class="popup-distance">📍 ${dn(l)}</p>`}return`
    <div class="popup-content" data-index="${t}">
      <div class="popup-header">
        <h3 class="popup-title">${e.nom}</h3>
        <button class="popup-fav-btn ${a?"active":""}"
                data-location-id="${n}"
                title="${a?"Retirer des favoris":"Ajouter aux favoris"}">
          ${a?"★":"☆"}
        </button>
      </div>

      <div class="popup-body">
        <p class="popup-address">
          ${e.adresse}<br>
          ${e.codePostal} ${e.ville}
        </p>

        ${e.type?`<p class="popup-type"><span class="tag">${e.type}</span></p>`:""}
        ${e.niveau?`<p class="popup-level">Niveau: ${e.niveau}</p>`:""}
        ${r}

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
        ${i?`<p class="popup-note"><strong>Note:</strong> ${i}</p>`:""}
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Itinéraire
        </button>
      </div>
    </div>
  `}function mn(e){q=L.map(e,{center:[m.mapCenter.lat,m.mapCenter.lon],zoom:m.mapZoom,zoomControl:!0,attributionControl:!0}),L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',subdomains:"abcd",maxZoom:20}).addTo(q),Z=L.markerClusterGroup({chunkedLoading:!0,chunkInterval:200,chunkDelay:50,removeOutsideVisibleBounds:!0,animate:!0,animateAddingMarkers:!1,maxClusterRadius:60,spiderfyOnMaxZoom:!0,spiderfyDistanceMultiplier:1.5,showCoverageOnHover:!0,zoomToBoundsOnClick:!0,disableClusteringAtZoom:18,iconCreateFunction:n=>{const a=n.getChildCount(),i=n.getAllChildMarkers();let s=0,r=0;const l=new Set;i.forEach(C=>{var v;const k=window.__clusterMarkerIndex,M=(v=Array.from((k==null?void 0:k.entries())||[]).find(([u,c])=>c===C))==null?void 0:v[0];if(M!==void 0){const u=m.locations[M];u&&(l.add(u.type),m.filteredIndices.includes(M)&&s++,m.favorites.has(pe(u))&&r++)}});let o="small",d=44;a>100?(o="xlarge",d=64):a>50?(o="large",d=54):a>20&&(o="medium",d=48);const p=a>0?s/a:0,g=Math.round(p*100);let f="default";p>.7?f="hot":p>.3&&(f="warm");const w=f==="hot"?"#ef4444":f==="warm"?"#f59e0b":"#3b82f6",E=r>0?`<span class="cluster-fav">★${r}</span>`:"";return L.divIcon({html:`
          <div class="cluster-marker cluster-${o} cluster-${f}"
               style="--match-percent: ${g}; --ring-color: ${w}">
            <span class="cluster-count">${a}</span>
            ${E}
          </div>
        `,className:"marker-cluster-custom",iconSize:L.point(d,d)})}}),window.__clusterMarkerIndex=de,q.addLayer(Z),Z.on("clustermouseover",n=>{const a=n.layer,i=a.getChildCount(),s=a.getAllChildMarkers(),r=new Map,l=new Map;let o=0;s.forEach(f=>{var C;const w=window.__clusterMarkerIndex,E=(C=Array.from((w==null?void 0:w.entries())||[]).find(([k,M])=>M===f))==null?void 0:C[0];if(E!==void 0){const k=m.locations[E];k&&(r.set(k.ville,(r.get(k.ville)||0)+1),l.set(k.type,(l.get(k.type)||0)+1),m.filteredIndices.includes(E)&&o++)}});const d=Array.from(r.entries()).sort((f,w)=>w[1]-f[1]).slice(0,3).map(([f,w])=>`${f} (${w})`).join(", "),p=Array.from(l.entries()).sort((f,w)=>w[1]-f[1]).slice(0,3).map(([f,w])=>`${f} (${w})`).join(", "),g=`
      <div class="cluster-tooltip">
        <strong>${i} établissements</strong>
        ${o>0?`<br><span class="cluster-tooltip-match">✓ ${o} correspondent aux filtres</span>`:""}
        <hr>
        <small><strong>Villes:</strong> ${d||"N/A"}</small><br>
        <small><strong>Types:</strong> ${p||"N/A"}</small>
      </div>
    `;a.bindTooltip(g,{direction:"top",className:"cluster-tooltip-container",offset:[0,-20]}).openTooltip()}),Z.on("clustermouseout",n=>{n.layer.closeTooltip()});const t=Ht(()=>{if(q){const n=q.getCenter();Ft({lat:n.lat,lon:n.lng},q.getZoom())}},300);return q.on("moveend",t),q.on("zoomend",t),q.on("popupopen",n=>{const i=n.popup.getElement();i&&(i.querySelectorAll(".popup-fav-btn").forEach(s=>{s.addEventListener("click",r=>{r.stopPropagation();const l=s.dataset.locationId;l&&(_t(l),s.classList.toggle("active"),s.textContent=s.classList.contains("active")?"★":"☆")})}),i.querySelectorAll(".popup-btn-directions").forEach(s=>{s.addEventListener("click",()=>{const r=s.dataset.lat,l=s.dataset.lon,o=decodeURIComponent(s.dataset.name||"");if(r&&l){const d=`https://www.google.com/maps/dir/?api=1&destination=${r},${l}&destination_place_id=${o}`;window.open(d,"_blank")}})}))}),pn(),q}function pn(){K("DATA_LOADED",()=>{Ue(),bt()}),K("FILTER_CHANGED",()=>{He()}),K("LOCATION_SELECTED",e=>{const t=e.payload;t!==null&&Je(t)}),K("FAVORITE_TOGGLED",()=>{He()})}function Ue(){if(!Z)return;Z.clearLayers(),de.clear();const{locations:e,filteredIndices:t,favorites:n}=m,a=new Set(t);e.forEach((i,s)=>{if(i.lat===null||i.lon===null)return;const r=pe(i),l=a.has(s),o=n.has(r),d=m.selectedLocationIndex===s,p=yt({color:X.default,isMatching:l,isFavorite:o,isSelected:d}),g=L.marker([i.lat,i.lon],{icon:p});g.bindPopup(()=>un(i,s),{maxWidth:320,className:"custom-popup"}),g.on("click",()=>{window.dispatchEvent(new CustomEvent("location-selected",{detail:{index:s}}))}),de.set(s,g),Z.addLayer(g)})}function He(){const{filteredIndices:e,favorites:t,selectedLocationIndex:n,locations:a}=m,i=new Set(e);de.forEach((s,r)=>{const l=a[r];if(!l)return;const o=pe(l),d=i.has(r),p=t.has(o),g=n===r,f=yt({color:X.default,isMatching:d,isFavorite:p,isSelected:g});s.setIcon(f)})}function Je(e,t={}){const n=de.get(e);if(!n||!q)return;const{zoom:a=15,openPopup:i=!0}=t,s=n.getLatLng();q.setView(s,a,{animate:!0}),i&&setTimeout(()=>{n.openPopup()},300),He()}function bt(e=50){if(!q||!Z)return;const{locations:t,filteredIndices:n}=m,a=[];if(n.forEach(i=>{const s=t[i];s.lat!==null&&s.lon!==null&&a.push(L.latLng(s.lat,s.lon))}),a.length!==0)if(a.length===1)q.setView(a[0],14);else{const i=L.latLngBounds(a);q.fitBounds(i,{padding:[e,e]})}}function fn(e){if(q)if(e){const{locations:t,filteredIndices:n}=m,a=[];n.forEach(i=>{const s=t[i];s.lat!==null&&s.lon!==null&&a.push([s.lat,s.lon,1])}),Y&&q.removeLayer(Y),Y=L.heatLayer(a,{radius:25,blur:15,maxZoom:17,gradient:{.4:"blue",.6:"cyan",.7:"lime",.8:"yellow",1:"red"}}).addTo(q)}else Y&&(q.removeLayer(Y),Y=null)}function tt(){q&&setTimeout(()=>q.invalidateSize(),100)}const Se="admin_code_hash",Ke="admin_session",vn="admin2024";function We(e){let t=0;for(let n=0;n<e.length;n++){const a=e.charCodeAt(n);t=(t<<5)-t+a,t=t&t}return t.toString(36)}function hn(){localStorage.getItem(Se)||localStorage.setItem(Se,We(vn))}function gn(){return sessionStorage.getItem(Ke)==="true"}function $t(e){hn();const t=localStorage.getItem(Se);return We(e)===t}function yn(e){return $t(e)?(sessionStorage.setItem(Ke,"true"),!0):!1}function bn(){sessionStorage.removeItem(Ke)}function $n(e,t){return!$t(e)||t.length<4?!1:(localStorage.setItem(Se,We(t)),!0)}function En(e){const t=document.createElement("div");t.className="admin-auth-modal",t.innerHTML=`
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
  `;const n=t.querySelector(".admin-auth-input"),a=t.querySelector(".admin-auth-toggle"),i=t.querySelector(".admin-auth-error"),s=t.querySelector(".admin-auth-btn-cancel"),r=t.querySelector(".admin-auth-btn-submit");a.addEventListener("click",()=>{const o=n.type==="password";n.type=o?"text":"password",a.innerHTML=`<i class="fas fa-eye${o?"-slash":""}"></i>`});const l=()=>{const o=n.value.trim();yn(o)?(t.remove(),e()):(i.style.display="flex",n.classList.add("error"),n.focus(),n.select())};return r.addEventListener("click",l),n.addEventListener("keydown",o=>{o.key==="Enter"&&(o.preventDefault(),l()),i.style.display="none",n.classList.remove("error")}),s.addEventListener("click",()=>{t.remove()}),t.addEventListener("click",o=>{o.target===t&&t.remove()}),setTimeout(()=>n.focus(),100),t}function Ln(e){if(gn()){e();return}const t=En(e);document.body.appendChild(t)}function wn(e){e.innerHTML=`
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
  `;const t=e.querySelector("#oldCodeInput"),n=e.querySelector("#newCodeInput"),a=e.querySelector("#confirmCodeInput"),i=e.querySelector(".admin-change-code-message");e.querySelector("#changeCodeBtn").addEventListener("click",()=>{const r=t.value.trim(),l=n.value.trim(),o=a.value.trim();if(i.style.display="block",!r||!l||!o){i.className="admin-change-code-message error",i.textContent="Tous les champs sont obligatoires";return}if(l!==o){i.className="admin-change-code-message error",i.textContent="Les codes ne correspondent pas";return}if(l.length<4){i.className="admin-change-code-message error",i.textContent="Le nouveau code doit faire au moins 4 caractères";return}$n(r,l)?(i.className="admin-change-code-message success",i.textContent="Code modifié avec succès",t.value="",n.value="",a.value=""):(i.className="admin-change-code-message error",i.textContent="Code actuel incorrect")})}const Et="https://api-adresse.data.gouv.fr/search/",Sn="https://nominatim.openstreetmap.org/search";async function Lt(e,t,n){const a=`geo:${e}:${t}:${n}`,i=ut(a);if(i)return i;const s=await Cn(e,t,n);if(s)return Fe(a,s,30*60*1e3),s;const r=await xn(e,t,n);return r?(Fe(a,r,30*60*1e3),r):null}async function Cn(e,t,n){try{const a=`${e} ${t} ${n}`,i=new URL(Et);i.searchParams.set("q",a),i.searchParams.set("limit","1"),t&&i.searchParams.set("postcode",t);const s=await fetch(i.toString());if(!s.ok)throw new Error(`BAN API error: ${s.status}`);const r=await s.json();if(r.features&&r.features.length>0){const l=r.features[0],[o,d]=l.geometry.coordinates,p=l.properties.score||0;return p<.3?null:{lat:d,lon:o,confidence:p,source:"ban",label:l.properties.label}}return null}catch(a){return console.warn("Erreur API BAN:",a),null}}async function xn(e,t,n){try{const a=`${e}, ${t} ${n}, France`,i=new URL(Sn);i.searchParams.set("q",a),i.searchParams.set("format","json"),i.searchParams.set("limit","1"),i.searchParams.set("countrycodes","fr");const s=await fetch(i.toString(),{headers:{"User-Agent":"CarteStages/2.0"}});if(!s.ok)throw new Error(`Nominatim API error: ${s.status}`);const r=await s.json();if(r&&r.length>0){const l=r[0],o=parseFloat(l.importance)||0;return{lat:parseFloat(l.lat),lon:parseFloat(l.lon),confidence:o,source:"nominatim",label:l.display_name}}return null}catch(a){return console.warn("Erreur Nominatim:",a),null}}async function An(e){if(e.length<3)return[];const t=`geo:auto:${e}`,n=ut(t);if(n)return n;try{const a=new URL(Et);a.searchParams.set("q",e),a.searchParams.set("limit","5"),a.searchParams.set("autocomplete","1");const i=await fetch(a.toString());if(!i.ok)return[];const r=((await i.json()).features||[]).map(l=>({label:l.properties.label,lat:l.geometry.coordinates[1],lon:l.geometry.coordinates[0],type:l.properties.type}));return Fe(t,r,5*60*1e3),r}catch(a){return console.warn("Erreur autocomplétion:",a),[]}}function kn(e,t){const{location:n,index:a,onSave:i,onCancel:s}=t,r=a!==void 0,l=m.uniqueTypes;e.innerHTML=`
    <form class="admin-location-form" id="locationForm">
      <h3 class="admin-form-title">
        <i class="fas fa-${r?"edit":"plus-circle"}"></i>
        ${r?"Modifier le lieu":"Ajouter un nouveau lieu"}
      </h3>

      <div class="admin-form-section">
        <h4><i class="fas fa-building"></i> Informations générales</h4>

        <div class="admin-form-row">
          <div class="admin-form-group admin-form-group-large">
            <label for="nom">Nom de l'établissement *</label>
            <input type="text" id="nom" name="nom" class="admin-input" required
                   value="${H((n==null?void 0:n.nom)||"")}"
                   placeholder="Ex: Restaurant Le Bon Goût">
            <span class="admin-form-error" id="nomError"></span>
          </div>
          <div class="admin-form-group">
            <label for="type">Type d'établissement *</label>
            <select id="type" name="type" class="admin-input" required>
              <option value="">-- Sélectionner --</option>
              ${l.map(y=>`<option value="${H(y)}" ${(n==null?void 0:n.type)===y?"selected":""}>${H(y)}</option>`).join("")}
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

        <div class="admin-form-group admin-address-autocomplete">
          <label for="adresse">Adresse *</label>
          <div class="admin-autocomplete-wrapper">
            <input type="text" id="adresse" name="adresse" class="admin-input" required
                   value="${H((n==null?void 0:n.adresse)||"")}"
                   placeholder="Commencez à taper une adresse..."
                   autocomplete="off">
            <div class="admin-autocomplete-spinner" id="autocompleteSpinner" style="display: none;">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
            <ul class="admin-autocomplete-list" id="autocompleteList"></ul>
          </div>
          <small class="admin-form-hint">L'adresse sera auto-complétée et les coordonnées GPS seront récupérées automatiquement</small>
        </div>

        <div class="admin-form-row">
          <div class="admin-form-group">
            <label for="codePostal">Code postal *</label>
            <input type="text" id="codePostal" name="codePostal" class="admin-input" required
                   value="${H((n==null?void 0:n.codePostal)||"")}"
                   pattern="[0-9]{5}" maxlength="5"
                   placeholder="Ex: 79200">
            <span class="admin-form-error" id="codePostalError"></span>
          </div>
          <div class="admin-form-group admin-form-group-large">
            <label for="ville">Ville *</label>
            <input type="text" id="ville" name="ville" class="admin-input" required
                   value="${H((n==null?void 0:n.ville)||"")}"
                   placeholder="Ex: Parthenay">
          </div>
        </div>

        <div class="admin-form-row admin-form-coords" id="coordsSection">
          <div class="admin-form-group">
            <label for="lat">Latitude</label>
            <input type="number" id="lat" name="lat" class="admin-input admin-coord-input"
                   value="${(n==null?void 0:n.lat)??""}"
                   step="0.000001" min="-90" max="90"
                   placeholder="46.6453">
          </div>
          <div class="admin-form-group">
            <label for="lon">Longitude</label>
            <input type="number" id="lon" name="lon" class="admin-input admin-coord-input"
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
                   value="${H((n==null?void 0:n.telephone)||"")}"
                   placeholder="Ex: 05 49 94 00 00">
            <span class="admin-form-error" id="telephoneError"></span>
          </div>
          <div class="admin-form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" class="admin-input"
                   value="${H((n==null?void 0:n.email)||"")}"
                   placeholder="Ex: contact@restaurant.fr">
            <span class="admin-form-error" id="emailError"></span>
          </div>
        </div>

        <div class="admin-form-group">
          <label for="contact">Nom du contact</label>
          <input type="text" id="contact" name="contact" class="admin-input"
                 value="${H((n==null?void 0:n.contact)||"")}"
                 placeholder="Ex: M. Dupont">
        </div>
      </div>

      <div class="admin-form-section">
        <h4><i class="fas fa-comment"></i> Notes</h4>

        <div class="admin-form-group">
          <label for="commentaire">Commentaire</label>
          <textarea id="commentaire" name="commentaire" class="admin-input admin-textarea"
                    rows="3" placeholder="Informations complémentaires...">${H((n==null?void 0:n.commentaire)||"")}</textarea>
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
          <i class="fas fa-save"></i> ${r?"Enregistrer":"Ajouter"}
        </button>
      </div>
    </form>
  `;const o=e.querySelector("#locationForm"),d=o.querySelector("#type"),p=o.querySelector("#typeAutre"),g=o.querySelector("#geocodeBtn"),f=o.querySelector("#geocodeResult"),w=o.querySelector("#nom"),E=o.querySelector("#ville"),C=o.querySelector("#duplicatesWarning"),k=o.querySelector("#duplicatesList"),M=o.querySelector("#cancelBtn"),v=o.querySelector("#adresse"),u=o.querySelector("#autocompleteList"),c=o.querySelector("#autocompleteSpinner"),h=o.querySelector("#coordsSection"),b=o.querySelector("#lat"),$=o.querySelector("#lon"),x=o.querySelector("#codePostal");let B=[],j=-1;d.addEventListener("change",()=>{d.value==="__autre__"?(p.style.display="block",p.required=!0,p.focus()):(p.style.display="none",p.required=!1,p.value="")});const U=()=>{u.classList.add("visible")},O=()=>{u.classList.remove("visible"),j=-1},Ae=y=>{if(B=y,j=-1,y.length===0){O();return}u.innerHTML=y.map((S,I)=>`
      <li class="admin-autocomplete-item" data-index="${I}">
        <i class="fas fa-map-marker-alt"></i>
        <span>${H(S.label)}</span>
      </li>
    `).join(""),U()},ve=y=>{const S=y.label.split(",");let I="",P="",_="";if(S.length>=2){I=S[0].trim();const W=S[S.length-1].trim(),Te=W.match(/^(\d{5})\s+(.+)$/);Te?(P=Te[1],_=Te[2]):_=W}else I=y.label;v.value=I,P&&(x.value=P),_&&(E.value=_),D(y.lat,y.lon),O()},D=(y,S)=>{h.classList.add("coords-updating"),b.classList.add("coord-flash"),$.classList.add("coord-flash"),b.value=y.toFixed(6),$.value=S.toFixed(6),f.innerHTML='<i class="fas fa-check-circle"></i> Coordonnées GPS récupérées automatiquement',f.className="admin-geocode-result success",f.style.display="flex",setTimeout(()=>{h.classList.remove("coords-updating"),b.classList.remove("coord-flash"),$.classList.remove("coord-flash")},600)},ee=nt(async y=>{if(y.length<3){O(),c.style.display="none";return}c.style.display="flex";try{const S=await An(y);Ae(S)}catch(S){console.error("Autocomplete error:",S),O()}c.style.display="none"},300);v.addEventListener("input",y=>{const S=y.target.value;ee(S)}),v.addEventListener("keydown",y=>{if(!u.classList.contains("visible"))return;const S=u.querySelectorAll(".admin-autocomplete-item");switch(y.key){case"ArrowDown":y.preventDefault(),j=Math.min(j+1,S.length-1);break;case"ArrowUp":y.preventDefault(),j=Math.max(j-1,0);break;case"Enter":y.preventDefault(),j>=0&&B[j]&&ve(B[j]);return;case"Escape":O();return;default:return}S.forEach((I,P)=>{I.classList.toggle("selected",P===j)})}),u.addEventListener("click",y=>{const S=y.target.closest(".admin-autocomplete-item");if(S){const I=parseInt(S.getAttribute("data-index")||"0",10);B[I]&&ve(B[I])}}),v.addEventListener("blur",()=>{setTimeout(O,200)}),v.addEventListener("focus",()=>{v.value.length>=3&&B.length>0&&U()}),g.addEventListener("click",async()=>{const y=v.value.trim(),S=x.value.trim(),I=E.value.trim();if(!y||!S||!I){f.innerHTML=`<i class="fas fa-exclamation-circle"></i> Remplissez l'adresse, le code postal et la ville`,f.className="admin-geocode-result error",f.style.display="flex";return}g.disabled=!0,g.innerHTML='<i class="fas fa-spinner fa-spin"></i> Recherche...',f.style.display="none";try{const P=await Lt(y,S,I);P?(D(P.lat,P.lon),f.innerHTML=`<i class="fas fa-check-circle"></i> Coordonnées trouvées (confiance: ${Math.round(P.confidence*100)}%)`,f.className="admin-geocode-result success"):(f.innerHTML='<i class="fas fa-exclamation-triangle"></i> Adresse non trouvée. Vérifiez ou saisissez les coordonnées manuellement.',f.className="admin-geocode-result warning")}catch{f.innerHTML='<i class="fas fa-times-circle"></i> Erreur lors du géocodage',f.className="admin-geocode-result error"}f.style.display="flex",g.disabled=!1,g.innerHTML='<i class="fas fa-crosshairs"></i> Géocoder'});const he=nt(()=>{const y=w.value.trim();if(E.value.trim(),y.length<3){C.style.display="none";return}const S=Qt({nom:y}),I=r?S.filter(P=>P!==a):S;if(I.length>0){const P=Ge();k.innerHTML=I.slice(0,3).map(_=>{const W=P[_];return`<li>${H(W.nom)} - ${H(W.ville)} (${W.codePostal})</li>`}).join(""),C.style.display="flex"}else C.style.display="none"},500);w.addEventListener("input",he),E.addEventListener("input",he);const te=(y,S,I)=>{const P=I(y.value.trim()),_=o.querySelector(`#${S}`);return P?(y.classList.add("error"),_.textContent=P,_.style.display="block",!1):(y.classList.remove("error"),_.style.display="none",!0)};x.addEventListener("blur",()=>{te(x,"codePostalError",y=>/^\d{5}$/.test(y)?null:"Le code postal doit contenir 5 chiffres")});const ke=o.querySelector("#telephone");ke.addEventListener("blur",()=>{te(ke,"telephoneError",y=>y&&!/^[\d\s.+-]{10,}$/.test(y.replace(/\s/g,""))?"Format de téléphone invalide":null)});const Ie=o.querySelector("#email");Ie.addEventListener("blur",()=>{te(Ie,"emailError",y=>y&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(y)?"Format d'email invalide":null)}),M.addEventListener("click",()=>{s()}),o.addEventListener("submit",y=>{y.preventDefault();let S=!0;S=te(w,"nomError",_=>_?null:"Le nom est obligatoire")&&S,S=te(x,"codePostalError",_=>_?/^\d{5}$/.test(_)?null:"Le code postal doit contenir 5 chiffres":"Le code postal est obligatoire")&&S;let I=d.value;if(I==="__autre__"&&(I=p.value.trim(),I||(S=!1,p.classList.add("error"))),!S)return;const P={nom:w.value.trim(),adresse:v.value.trim(),codePostal:x.value.trim(),ville:E.value.trim(),type:I,niveau:o.querySelector("#niveau").value,telephone:ke.value.trim(),email:Ie.value.trim(),contact:o.querySelector("#contact").value.trim(),commentaire:o.querySelector("#commentaire").value.trim(),lat:b.value?parseFloat(b.value):null,lon:$.value?parseFloat($.value):null};i(P,a)})}function H(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function nt(e,t){let n=null;return(...a)=>{n&&clearTimeout(n),n=setTimeout(()=>e(...a),t)}}function In(e,t){const{onEdit:n,onDelete:a,onLocate:i}=t,s={page:1,perPage:20,search:"",sortField:"nom",sortDir:"asc",selected:new Set};function r(){const o=m.locations;let d=o.map((v,u)=>u);if(s.search){const v=s.search.toLowerCase();d=d.filter(u=>{const c=o[u];return c.nom.toLowerCase().includes(v)||c.ville.toLowerCase().includes(v)||c.codePostal.includes(v)||c.type.toLowerCase().includes(v)})}s.sortField&&d.sort((v,u)=>{const c=o[v][s.sortField]||"",h=o[u][s.sortField]||"",b=String(c).localeCompare(String(h),"fr",{numeric:!0});return s.sortDir==="asc"?b:-b});const p=Math.ceil(d.length/s.perPage),g=(s.page-1)*s.perPage,f=d.slice(g,g+s.perPage);e.innerHTML=`
      <div class="admin-list-header">
        <div class="admin-list-search">
          <i class="fas fa-search"></i>
          <input type="text" class="admin-input" placeholder="Rechercher..."
                 value="${se(s.search)}" id="listSearchInput">
        </div>
        <div class="admin-list-info">
          ${d.length} lieu${d.length>1?"x":""} trouvé${d.length>1?"s":""}
        </div>
        <div class="admin-list-bulk-actions" style="display: ${s.selected.size>0?"flex":"none"}">
          <span>${s.selected.size} sélectionné${s.selected.size>1?"s":""}</span>
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
                <input type="checkbox" id="selectAllCheck" ${s.selected.size===f.length&&f.length>0?"checked":""}>
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
            ${f.length===0?`
              <tr>
                <td colspan="7" class="admin-list-empty">
                  <i class="fas fa-inbox"></i>
                  <p>Aucun lieu trouvé</p>
                </td>
              </tr>
            `:f.map(v=>{const u=o[v],c=u.lat!==null&&u.lon!==null;return`
                <tr data-index="${v}" class="${s.selected.has(v)?"selected":""}">
                  <td>
                    <input type="checkbox" class="row-check" ${s.selected.has(v)?"checked":""}>
                  </td>
                  <td class="admin-list-cell-nom" title="${se(u.nom)}">
                    ${se(st(u.nom,30))}
                  </td>
                  <td>
                    ${se(u.ville)} <span class="admin-list-cp">(${u.codePostal})</span>
                  </td>
                  <td>
                    <span class="admin-list-type">${se(st(u.type,20))}</span>
                  </td>
                  <td>
                    ${u.niveau?`<span class="admin-list-niveau niveau-${u.niveau}">${u.niveau}</span>`:"-"}
                  </td>
                  <td>
                    <span class="admin-list-geo ${c?"yes":"no"}">
                      <i class="fas fa-${c?"check":"times"}"></i>
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

      ${p>1?`
        <div class="admin-list-pagination">
          <button type="button" class="admin-btn admin-btn-sm" id="prevPageBtn" ${s.page<=1?"disabled":""}>
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="admin-list-page-info">
            Page ${s.page} / ${p}
          </span>
          <button type="button" class="admin-btn admin-btn-sm" id="nextPageBtn" ${s.page>=p?"disabled":""}>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      `:""}
    `;const w=e.querySelector("#listSearchInput");w==null||w.addEventListener("input",Tn(()=>{s.search=w.value,s.page=1,s.selected.clear(),r()},300)),e.querySelectorAll(".admin-list-th-sortable").forEach(v=>{v.addEventListener("click",()=>{const u=v.dataset.field;s.sortField===u?s.sortDir=s.sortDir==="asc"?"desc":"asc":(s.sortField=u,s.sortDir="asc"),r()})});const E=e.querySelector("#selectAllCheck");E==null||E.addEventListener("change",()=>{E.checked?f.forEach(v=>s.selected.add(v)):f.forEach(v=>s.selected.delete(v)),r()}),e.querySelectorAll(".row-check").forEach(v=>{v.addEventListener("change",u=>{const c=u.target.closest("tr"),h=parseInt((c==null?void 0:c.dataset.index)||"-1",10);u.target.checked?s.selected.add(h):s.selected.delete(h),r()})});const C=e.querySelector("#bulkDeleteBtn");C==null||C.addEventListener("click",()=>{s.selected.size>0&&confirm(`Supprimer ${s.selected.size} lieu${s.selected.size>1?"x":""} ?`)&&(a(Array.from(s.selected).sort((v,u)=>u-v)),s.selected.clear(),s.page=1,r())}),e.querySelectorAll("tr[data-index]").forEach(v=>{var c,h,b;const u=parseInt(v.dataset.index||"-1",10);(c=v.querySelector(".btn-locate"))==null||c.addEventListener("click",$=>{$.stopPropagation(),i(u)}),(h=v.querySelector(".btn-edit"))==null||h.addEventListener("click",$=>{$.stopPropagation(),n(u)}),(b=v.querySelector(".btn-delete"))==null||b.addEventListener("click",$=>{$.stopPropagation(),confirm(`Supprimer "${o[u].nom}" ?`)&&(a([u]),s.selected.delete(u),r())})});const k=e.querySelector("#prevPageBtn"),M=e.querySelector("#nextPageBtn");k==null||k.addEventListener("click",()=>{s.page>1&&(s.page--,r())}),M==null||M.addEventListener("click",()=>{s.page<p&&(s.page++,r())})}function l(o){return s.sortField!==o?'<i class="fas fa-sort admin-sort-inactive"></i>':s.sortDir==="asc"?'<i class="fas fa-sort-up"></i>':'<i class="fas fa-sort-down"></i>'}r(),window.addEventListener("admin-data-changed",()=>{r()})}function se(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function st(e,t){return e?e.length>t?e.slice(0,t)+"...":e:""}function Tn(e,t){let n=null;return(...a)=>{n&&clearTimeout(n),n=setTimeout(()=>e(...a),t)}}const Mn={nom:[/^nom$/i,/^name$/i,/^établissement$/i,/^entreprise$/i,/^raison/i],adresse:[/^adresse$/i,/^address$/i,/^rue$/i,/^voie$/i],codePostal:[/^code.?postal$/i,/^cp$/i,/^postal/i,/^zip/i],ville:[/^ville$/i,/^city$/i,/^commune$/i,/^localité$/i],type:[/^type$/i,/^catégorie$/i,/^category$/i,/^activité$/i],niveau:[/^niveau$/i,/^level$/i,/^niv$/i],telephone:[/^t[ée]l[ée]?phone$/i,/^tel$/i,/^phone$/i,/^mobile$/i],email:[/^e?.?mail$/i,/^courriel$/i],contact:[/^contact$/i,/^responsable$/i,/^interlocuteur$/i],commentaire:[/^commentaire$/i,/^comment$/i,/^note$/i,/^remarque$/i],lat:[/^lat$/i,/^latitude$/i],lon:[/^lon$/i,/^lng$/i,/^longitude$/i]};function qn(e,t){const{onImport:n}=t;let a=null,i=wt(),s={skipDuplicates:!0,autoGeocode:!0};r();function r(){e.innerHTML=`
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
    `,l()}function l(){const c=e.querySelector("#dropzone"),h=e.querySelector("#fileInput"),b=e.querySelector("#cancelBtn");["dragenter","dragover"].forEach($=>{c.addEventListener($,x=>{x.preventDefault(),c.classList.add("dragover")})}),["dragleave","drop"].forEach($=>{c.addEventListener($,x=>{x.preventDefault(),c.classList.remove("dragover")})}),c.addEventListener("drop",$=>{var B;const x=(B=$.dataTransfer)==null?void 0:B.files;x&&x.length>0&&o(x[0])}),h.addEventListener("change",()=>{h.files&&h.files.length>0&&o(h.files[0])}),b.addEventListener("click",()=>{})}async function o(c){var b,$;const h=(b=c.name.split(".").pop())==null?void 0:b.toLowerCase();e.innerHTML=`
      <div class="admin-import-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Lecture du fichier...</p>
      </div>
    `;try{if(h==="csv")a=await Pn(c);else if(h==="xlsx"||h==="xls")a=await Nn(c);else throw new Error("Format de fichier non supporté");if(a.rows.length===0)throw new Error("Le fichier est vide");i=Bn(a.headers),d()}catch(x){e.innerHTML=`
        <div class="admin-import-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Erreur lors de la lecture du fichier</p>
          <span>${x.message}</span>
          <button type="button" class="admin-btn admin-btn-secondary" id="retryBtn">
            <i class="fas fa-redo"></i> Réessayer
          </button>
        </div>
      `,($=e.querySelector("#retryBtn"))==null||$.addEventListener("click",r)}}function d(){if(!a)return;const c=a.rows.slice(0,5),h=a.rows.length;e.innerHTML=`
      <div class="admin-import-preview">
        <h3 class="admin-form-title">
          <i class="fas fa-table"></i>
          Aperçu et mapping des colonnes
        </h3>

        <div class="admin-import-stats">
          <span><i class="fas fa-file"></i> ${h} lignes détectées</span>
          <span><i class="fas fa-columns"></i> ${a.headers.length} colonnes</span>
        </div>

        <div class="admin-import-mapping">
          <h4>Correspondance des colonnes</h4>
          <p class="admin-import-mapping-desc">Associez chaque champ avec la colonne correspondante du fichier.</p>

          <div class="admin-import-mapping-grid">
            ${p()}
          </div>
        </div>

        <div class="admin-import-preview-table-container">
          <h4>Aperçu des données</h4>
          <table class="admin-import-preview-table">
            <thead>
              <tr>
                ${a.headers.map((b,$)=>`
                  <th class="${M($)?"mapped":""}">
                    ${De(b)}
                    ${M($)?`<span class="mapped-badge">${v($)}</span>`:""}
                  </th>
                `).join("")}
              </tr>
            </thead>
            <tbody>
              ${c.map(b=>`
                <tr>
                  ${b.map(($,x)=>`
                    <td class="${M(x)?"mapped":""}">${De(Dn($,30))}</td>
                  `).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
          ${h>5?`<p class="admin-import-more">... et ${h-5} autres lignes</p>`:""}
        </div>

        <div class="admin-import-options">
          <h4>Options d'import</h4>
          <label class="admin-checkbox">
            <input type="checkbox" id="skipDuplicates" ${s.skipDuplicates?"checked":""}>
            <span>Ignorer les doublons (même nom et ville)</span>
          </label>
          <label class="admin-checkbox">
            <input type="checkbox" id="autoGeocode" ${s.autoGeocode?"checked":""}>
            <span>Géocoder automatiquement les adresses</span>
          </label>
        </div>

        <div class="admin-form-actions">
          <button type="button" class="admin-btn admin-btn-cancel" id="backBtn">
            <i class="fas fa-arrow-left"></i> Retour
          </button>
          <button type="button" class="admin-btn admin-btn-primary" id="importBtn" ${u()?"":"disabled"}>
            <i class="fas fa-file-import"></i> Importer ${h} lieu${h>1?"x":""}
          </button>
        </div>
      </div>
    `,g()}function p(){return[{key:"nom",label:"Nom *",required:!0},{key:"adresse",label:"Adresse *",required:!0},{key:"codePostal",label:"Code postal *",required:!0},{key:"ville",label:"Ville *",required:!0},{key:"type",label:"Type",required:!1},{key:"niveau",label:"Niveau",required:!1},{key:"telephone",label:"Téléphone",required:!1},{key:"email",label:"Email",required:!1},{key:"contact",label:"Contact",required:!1},{key:"commentaire",label:"Commentaire",required:!1},{key:"lat",label:"Latitude",required:!1},{key:"lon",label:"Longitude",required:!1}].map(({key:h,label:b,required:$})=>`
      <div class="admin-import-mapping-item ${$?"required":""}">
        <label>${b}</label>
        <select class="admin-input" data-field="${h}">
          <option value="-1">${$?"-- Sélectionner --":"-- Non importé --"}</option>
          ${a.headers.map((x,B)=>`
            <option value="${B}" ${i[h]===B?"selected":""}>${De(x)}</option>
          `).join("")}
        </select>
      </div>
    `).join("")}function g(){var b,$;e.querySelectorAll(".admin-import-mapping-item select").forEach(x=>{x.addEventListener("change",()=>{const B=x.dataset.field;i[B]=parseInt(x.value,10),d()})});const c=e.querySelector("#skipDuplicates"),h=e.querySelector("#autoGeocode");c==null||c.addEventListener("change",()=>{s.skipDuplicates=c.checked}),h==null||h.addEventListener("change",()=>{s.autoGeocode=h.checked}),(b=e.querySelector("#backBtn"))==null||b.addEventListener("click",r),($=e.querySelector("#importBtn"))==null||$.addEventListener("click",f)}async function f(){if(!a||!u())return;const c=a.rows.length;let h=0,b=0,$=0;const x=[];e.innerHTML=`
      <div class="admin-import-progress">
        <h3><i class="fas fa-cog fa-spin"></i> Import en cours...</h3>
        <div class="admin-progress-bar">
          <div class="admin-progress-fill" id="progressFill" style="width: 0%"></div>
        </div>
        <p class="admin-progress-text" id="progressText">0 / ${c}</p>
        <p class="admin-progress-status" id="progressStatus">Préparation...</p>
      </div>
    `;const B=e.querySelector("#progressFill"),j=e.querySelector("#progressText"),U=e.querySelector("#progressStatus");for(let O=0;O<a.rows.length;O++){const Ae=a.rows[O],ve=Math.round((O+1)/c*100);B.style.width=`${ve}%`,j.textContent=`${O+1} / ${c}`;try{const D=E(Ae);if(s.skipDuplicates&&Yt(D.nom,D.ville)){b++,U.textContent=`Ignoré: ${D.nom} (doublon)`;continue}if(s.autoGeocode&&D.lat===null){U.textContent=`Géocodage: ${D.nom}...`;const ee=await Lt(D.adresse,D.codePostal,D.ville);ee&&(D.lat=ee.lat,D.lon=ee.lon),await new Promise(he=>setTimeout(he,100))}x.push(D),h++,U.textContent=`Importé: ${D.nom}`}catch{$++,U.textContent=`Erreur ligne ${O+1}`}}w(h,b,$,x)}function w(c,h,b,$){var x,B;e.innerHTML=`
      <div class="admin-import-results">
        <h3><i class="fas fa-check-circle"></i> Import terminé</h3>

        <div class="admin-import-results-stats">
          <div class="stat success">
            <i class="fas fa-check"></i>
            <span class="number">${c}</span>
            <span class="label">importé${c>1?"s":""}</span>
          </div>
          <div class="stat warning">
            <i class="fas fa-forward"></i>
            <span class="number">${h}</span>
            <span class="label">ignoré${h>1?"s":""}</span>
          </div>
          <div class="stat error">
            <i class="fas fa-times"></i>
            <span class="number">${b}</span>
            <span class="label">erreur${b>1?"s":""}</span>
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
    `,(x=e.querySelector("#importMoreBtn"))==null||x.addEventListener("click",r),(B=e.querySelector("#finishBtn"))==null||B.addEventListener("click",()=>{$.length>0&&n($)})}function E(c){return{nom:C(c,i.nom)||"",adresse:C(c,i.adresse)||"",codePostal:C(c,i.codePostal)||"",ville:C(c,i.ville)||"",type:C(c,i.type)||"",niveau:C(c,i.niveau)||"",telephone:C(c,i.telephone)||"",email:C(c,i.email)||"",contact:C(c,i.contact)||"",commentaire:C(c,i.commentaire)||"",lat:k(C(c,i.lat)),lon:k(C(c,i.lon))}}function C(c,h){return h<0||h>=c.length?"":c[h].trim()}function k(c){if(!c)return null;const h=parseFloat(c.replace(",","."));return isNaN(h)?null:h}function M(c){return Object.values(i).includes(c)}function v(c){for(const[h,b]of Object.entries(i))if(b===c)return h;return""}function u(){return i.nom>=0&&i.adresse>=0&&i.codePostal>=0&&i.ville>=0}}async function Pn(e){const n=(await e.text()).split(/\r?\n/).filter(o=>o.trim());if(n.length===0)throw new Error("Fichier vide");const i=n[0].includes(";")?";":",",s=o=>{const d=[];let p="",g=!1;for(let f=0;f<o.length;f++){const w=o[f];w==='"'?g&&o[f+1]==='"'?(p+='"',f++):g=!g:w===i&&!g?(d.push(p),p=""):p+=w}return d.push(p),d},r=s(n[0]),l=n.slice(1).map(s);return{headers:r,rows:l}}async function Nn(e){const t=await $e(()=>import("./export-AiKJFuQl.js").then(d=>d.x),__vite__mapDeps([0,1]),import.meta.url),n=await e.arrayBuffer(),a=t.read(n,{type:"array"}),i=a.SheetNames[0],s=a.Sheets[i],r=t.utils.sheet_to_json(s,{header:1,defval:""});if(r.length===0)throw new Error("Feuille vide");const l=r[0].map(String),o=r.slice(1).map(d=>d.map(String));return{headers:l,rows:o}}function Bn(e){const t=wt();return e.forEach((n,a)=>{const i=n.toLowerCase().trim();for(const[s,r]of Object.entries(Mn))if(t[s]===-1){for(const l of r)if(l.test(i)){t[s]=a;break}}}),t}function wt(){return{nom:-1,adresse:-1,codePostal:-1,ville:-1,type:-1,niveau:-1,telephone:-1,email:-1,contact:-1,commentaire:-1,lat:-1,lon:-1}}function De(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function Dn(e,t){return e?e.length>t?e.slice(0,t)+"...":e:""}const _n={"55.10Z":"Hôtel","55.20Z":"Hébergement touristique","55.30Z":"Camping","56.10A":"Restauration traditionnelle","56.10B":"Cafétéria","56.10C":"Restauration rapide","56.21Z":"Traiteur","56.29A":"Restauration collective sous contrat","56.29B":"Restauration collective autre","56.30Z":"Débit de boissons","47.11A":"Commerce alimentaire de détail","47.11B":"Commerce alimentaire de proximité","47.11C":"Grande surface alimentaire","47.11D":"Supermarché","47.11E":"Magasin multi-commerce","47.11F":"Hypermarché","10.71A":"Fabrication industrielle de pain","10.71B":"Cuisson de produits de boulangerie","10.71C":"Boulangerie-pâtisserie","10.71D":"Pâtisserie","10.13A":"Préparation industrielle de produits à base de viande","10.13B":"Charcuterie","10.52Z":"Fabrication de glaces","10.82Z":"Fabrication de cacao, chocolat","47.24Z":"Commerce pain, pâtisserie, confiserie","47.29Z":"Autre commerce alimentaire","47.81Z":"Commerce alimentaire sur marchés"},Rn=[{code:"79",nom:"Deux-Sèvres"},{code:"86",nom:"Vienne"},{code:"17",nom:"Charente-Maritime"},{code:"85",nom:"Vendée"},{code:"16",nom:"Charente"},{code:"87",nom:"Haute-Vienne"}];function Fn(){return Rn}function On(e){const t=["56.10A","56.10B","56.10C","56.21Z","56.29A","56.29B","56.30Z"],n=["55.10Z","55.20Z","55.30Z"],a=["47.11A","47.11B","47.11C","47.11D","47.11E","47.11F","47.24Z","47.29Z","47.81Z"],i=["10.71A","10.71B","10.71C","10.71D","10.13A","10.13B","10.52Z","10.82Z"];switch(e){case"restauration":return t;case"hotellerie":return n;case"commerce":return[...a,...i];case"all":default:return[...t,...n,...a,...i]}}function Hn(e){return _n[e]||"Établissement"}async function jn(e){var l;const{departement:t,commune:n,codeNaf:a,raisonSociale:i,limit:s=25}=e,r="https://recherche-entreprises.api.gouv.fr/search";try{const o=new URL(r);i?o.searchParams.set("q",i):n&&o.searchParams.set("q",n),t&&o.searchParams.set("departement",t),a&&a.length>0&&o.searchParams.set("activite_principale",a.join(",")),o.searchParams.set("per_page",String(s)),o.searchParams.set("page","1");const d=await fetch(o.toString());if(!d.ok)throw d.status===429?new Error("Trop de requêtes. Veuillez réessayer dans quelques instants."):new Error(`Erreur API: ${d.status}`);const p=await d.json();if(!p.results||p.results.length===0)return[];const g=[];for(const f of p.results){const w=((l=f.matching_etablissements)==null?void 0:l.length)>0?f.matching_etablissements:[f.siege];for(const E of w){if(!E||t&&E.code_postal&&!E.code_postal.startsWith(t))continue;const k=(E.liste_enseignes||[])[0]||E.nom_commercial||f.nom_complet||"Sans nom",M=E.activite_principale||"",v=M.replace(/(\d{2})(\d{2})([A-Z])/,"$1.$2$3");let u="";if(E.adresse){const c=E.adresse.split(" "),h=c.findIndex(b=>/^\d{5}$/.test(b));h>0?u=c.slice(0,h).join(" "):u=E.adresse}g.push({siret:E.siret||f.siren,nom:k,adresse:u,codePostal:E.code_postal||"",ville:E.libelle_commune||"",activitePrincipale:M,type:Hn(v),lat:E.latitude?parseFloat(E.latitude):void 0,lon:E.longitude?parseFloat(E.longitude):void 0})}}return g}catch(o){throw console.error("Erreur recherche SIRENE:",o),o}}function zn(e,t){const{onAdd:n}=t,a=Fn();e.innerHTML=`
    <div class="admin-insee-panel">
      <div class="admin-insee-header">
        <h3><i class="fas fa-building"></i> Recherche INSEE</h3>
        <p>Recherchez des établissements dans la base de données officielle des entreprises françaises.</p>
      </div>

      <div class="admin-insee-form">
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label for="inseeDept"><i class="fas fa-map"></i> Département *</label>
            <select id="inseeDept" class="admin-input" required>
              ${a.map(v=>`<option value="${v.code}">${v.code} - ${v.nom}</option>`).join("")}
            </select>
          </div>

          <div class="admin-form-group">
            <label for="inseeDomain"><i class="fas fa-utensils"></i> Domaine</label>
            <select id="inseeDomain" class="admin-input">
              <option value="all">Tous les domaines</option>
              <option value="restauration">Restauration</option>
              <option value="hotellerie">Hôtellerie</option>
              <option value="commerce">Commerce alimentaire</option>
            </select>
          </div>
        </div>

        <div class="admin-form-row">
          <div class="admin-form-group admin-form-group-large">
            <label for="inseeCity"><i class="fas fa-city"></i> Ville (optionnel)</label>
            <input type="text" id="inseeCity" class="admin-input" placeholder="Ex: Niort, Parthenay...">
          </div>

          <div class="admin-form-group">
            <label for="inseeLimit"><i class="fas fa-list-ol"></i> Résultats max</label>
            <select id="inseeLimit" class="admin-input">
              <option value="10">10</option>
              <option value="25" selected>25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div class="admin-form-actions">
          <button type="button" class="admin-btn admin-btn-primary" id="inseeSearchBtn">
            <i class="fas fa-search"></i> Rechercher
          </button>
        </div>
      </div>

      <div class="admin-insee-results" id="inseeResults" style="display: none;">
        <div class="admin-insee-results-header">
          <h4><i class="fas fa-list"></i> Résultats (<span id="inseeResultsCount">0</span>)</h4>
          <button type="button" class="admin-btn admin-btn-sm admin-btn-secondary" id="inseeAddAllBtn">
            <i class="fas fa-plus-circle"></i> Tout ajouter
          </button>
        </div>
        <div class="admin-insee-results-list" id="inseeResultsList"></div>
      </div>

      <div class="admin-insee-loading" id="inseeLoading" style="display: none;">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Recherche en cours...</span>
      </div>

      <div class="admin-insee-empty" id="inseeEmpty" style="display: none;">
        <i class="fas fa-search"></i>
        <span>Aucun résultat trouvé. Essayez d'élargir vos critères de recherche.</span>
      </div>
    </div>
  `;const i=e.querySelector("#inseeDept"),s=e.querySelector("#inseeDomain"),r=e.querySelector("#inseeCity"),l=e.querySelector("#inseeLimit"),o=e.querySelector("#inseeSearchBtn"),d=e.querySelector("#inseeResults"),p=e.querySelector("#inseeResultsCount"),g=e.querySelector("#inseeResultsList"),f=e.querySelector("#inseeLoading"),w=e.querySelector("#inseeEmpty"),E=e.querySelector("#inseeAddAllBtn");let C=[];o.addEventListener("click",async()=>{const v=i.value,u=s.value,c=r.value.trim(),h=parseInt(l.value,10),b=On(u);o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Recherche...',d.style.display="none",w.style.display="none",f.style.display="flex";try{C=await jn({departement:v,commune:c||void 0,codeNaf:b,limit:h}),C.length===0?(w.style.display="flex",d.style.display="none"):(k(C),d.style.display="block",w.style.display="none")}catch($){console.error("Erreur recherche INSEE:",$),F({message:"Erreur lors de la recherche",type:"error"}),w.style.display="flex"}f.style.display="none",o.disabled=!1,o.innerHTML='<i class="fas fa-search"></i> Rechercher'});function k(v){p.textContent=String(v.length),g.innerHTML=v.map((u,c)=>`
      <div class="admin-insee-result-item" data-index="${c}">
        <div class="admin-insee-result-info">
          <div class="admin-insee-result-name">${Q(u.nom)}</div>
          <div class="admin-insee-result-address">
            ${Q(u.adresse||"Adresse non renseignée")},
            ${Q(u.codePostal)} ${Q(u.ville)}
          </div>
          <div class="admin-insee-result-meta">
            <span class="admin-insee-result-type"><i class="fas fa-tag"></i> ${Q(u.type)}</span>
            ${u.lat&&u.lon?'<span class="admin-insee-result-geo"><i class="fas fa-map-marker-alt"></i> Géolocalisé</span>':""}
            <span class="admin-insee-result-siret"><i class="fas fa-barcode"></i> ${Q(u.siret)}</span>
          </div>
        </div>
        <button type="button" class="admin-btn admin-btn-sm admin-btn-primary insee-add-btn" data-index="${c}">
          <i class="fas fa-plus"></i> Ajouter
        </button>
      </div>
    `).join(""),g.querySelectorAll(".insee-add-btn").forEach(u=>{u.addEventListener("click",c=>{const h=parseInt(c.currentTarget.dataset.index||"0",10);M(h);const b=g.querySelector(`[data-index="${h}"]`);b&&(b.classList.add("added"),u.disabled=!0,u.innerHTML='<i class="fas fa-check"></i> Ajouté')})})}function M(v){const u=C[v];if(!u)return;const c={nom:u.nom,adresse:u.adresse||"",codePostal:u.codePostal,ville:u.ville,type:u.type,niveau:"",telephone:"",email:"",contact:"",commentaire:`SIRET: ${u.siret}`,lat:u.lat||null,lon:u.lon||null};n(c),F({message:`${u.nom} ajouté`,type:"success"})}E.addEventListener("click",()=>{let v=0;C.forEach((u,c)=>{const h=g.querySelector(`[data-index="${c}"]`);if(h&&!h.classList.contains("added")){M(c),h.classList.add("added");const b=h.querySelector(".insee-add-btn");b&&(b.disabled=!0,b.innerHTML='<i class="fas fa-check"></i> Ajouté'),v++}}),v>0&&F({message:`${v} lieu${v>1?"x":""} ajouté${v>1?"s":""}`,type:"success"})})}function Q(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}let J="add",G,T=null;function Vn(){Ln(()=>{Gn()})}function re(){T&&(T.classList.add("closing"),setTimeout(()=>{T==null||T.remove(),T=null},300))}function Gn(){T&&T.remove(),T=document.createElement("div"),T.className="admin-modal-overlay",T.innerHTML=`
    <div class="admin-modal">
      <div class="admin-modal-header">
        <h2><i class="fas fa-cog"></i> Administration des Lieux de Stage</h2>
        <button type="button" class="admin-modal-close" id="closeAdminBtn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <nav class="admin-tabs">
        <button type="button" class="admin-tab ${J==="add"?"active":""}" data-tab="add">
          <i class="fas fa-plus-circle"></i>
          <span>Ajouter</span>
        </button>
        <button type="button" class="admin-tab ${J==="insee"?"active":""}" data-tab="insee">
          <i class="fas fa-building"></i>
          <span>INSEE</span>
        </button>
        <button type="button" class="admin-tab ${J==="import"?"active":""}" data-tab="import">
          <i class="fas fa-file-import"></i>
          <span>Importer</span>
        </button>
        <button type="button" class="admin-tab ${J==="manage"?"active":""}" data-tab="manage">
          <i class="fas fa-list"></i>
          <span>Gérer</span>
        </button>
        <button type="button" class="admin-tab ${J==="settings"?"active":""}" data-tab="settings">
          <i class="fas fa-cog"></i>
          <span>Paramètres</span>
        </button>
      </nav>

      <div class="admin-content" id="adminContent">
        <!-- Content will be rendered here -->
      </div>
    </div>
  `,document.body.appendChild(T),T.querySelector("#closeAdminBtn").addEventListener("click",re),T.addEventListener("click",n=>{n.target===T&&re()}),T.querySelectorAll(".admin-tab").forEach(n=>{n.addEventListener("click",()=>{const a=n.dataset.tab;xe(a)})});const t=n=>{n.key==="Escape"&&(re(),document.removeEventListener("keydown",t))};document.addEventListener("keydown",t),St(J)}function xe(e){J=e,G=void 0,T==null||T.querySelectorAll(".admin-tab").forEach(t=>{t.classList.toggle("active",t.dataset.tab===e)}),St(e)}function St(e){const t=T==null?void 0:T.querySelector("#adminContent");if(t)switch(e){case"add":Ct(t);break;case"insee":Zn(t);break;case"import":Un(t);break;case"manage":Jn(t);break;case"settings":Kn(t);break}}function Ct(e){const t=G!==void 0?m.locations[G]:void 0;kn(e,{location:t,index:G,onSave:(n,a)=>{a!==void 0?(Kt(a,n),ue(),F({message:"Lieu modifié avec succès",type:"success"})):(Ze(n),ue(),F({message:"Lieu ajouté avec succès",type:"success"})),G=void 0,Ct(e)},onCancel:()=>{G=void 0,G!==void 0&&xe("manage")}})}function Zn(e){zn(e,{onAdd:t=>{Ze(t),ue()}})}function Un(e){qn(e,{onImport:t=>{let n=0;for(const a of t)Ze(a),n++;ue(),F({message:`${n} lieu${n>1?"x":""} importé${n>1?"s":""} avec succès`,type:"success"}),xe("manage")}})}function Jn(e){In(e,{onEdit:t=>{G=t,xe("add")},onDelete:t=>{t.sort((n,a)=>a-n).forEach(n=>{Wt(n)}),ue(),F({message:`${t.length} lieu${t.length>1?"x":""} supprimé${t.length>1?"s":""}`,type:"success"}),window.dispatchEvent(new CustomEvent("admin-data-changed"))},onLocate:t=>{re(),setTimeout(()=>{Je(t,{zoom:15,openPopup:!0})},300)}})}function Kn(e){e.innerHTML=`
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
  `;const t=e.querySelector("#changeCodeContainer");wn(t),e.querySelector("#exportDataBtn").addEventListener("click",()=>{const i=Ge(),s=JSON.stringify(i,null,2),r=new Blob([s],{type:"application/json"}),l=URL.createObjectURL(r),o=document.createElement("a");o.href=l,o.download=`lieux-stage-${new Date().toISOString().split("T")[0]}.json`,o.click(),URL.revokeObjectURL(l),F({message:"Données exportées",type:"success"})}),Wn(e.querySelector("#statsGrid")),e.querySelector("#logoutBtn").addEventListener("click",()=>{bn(),re(),F({message:"Déconnexion réussie",type:"info"})})}function Wn(e){const t=m.locations,n=t.length,a=t.filter(r=>r.lat!==null&&r.lon!==null).length,i=new Set(t.map(r=>r.ville)).size,s=new Set(t.map(r=>r.type)).size;e.innerHTML=`
    <div class="admin-stat-card">
      <i class="fas fa-map-marker-alt"></i>
      <div class="admin-stat-value">${n}</div>
      <div class="admin-stat-label">Lieux de stage</div>
    </div>
    <div class="admin-stat-card">
      <i class="fas fa-crosshairs"></i>
      <div class="admin-stat-value">${a}</div>
      <div class="admin-stat-label">Géolocalisés</div>
    </div>
    <div class="admin-stat-card">
      <i class="fas fa-city"></i>
      <div class="admin-stat-value">${i}</div>
      <div class="admin-stat-label">Villes</div>
    </div>
    <div class="admin-stat-card">
      <i class="fas fa-tags"></i>
      <div class="admin-stat-value">${s}</div>
      <div class="admin-stat-label">Types</div>
    </div>
  `}function ue(){const e=Ge();mt(e),Ue()}async function at(){console.log("🚀 Initialisation de l'application...");try{rn(),await Ot(),sn(),Yn(),await Qn(),Xn(),ot(),console.log("✅ Application initialisée avec succès")}catch(e){console.error("❌ Erreur lors de l'initialisation:",e),F({message:"Erreur lors du chargement de l'application",type:"error",duration:5e3}),ot()}}function Yn(){const e=document.querySelector(".container");if(!e){console.error("Container principal non trouvé");return}e.querySelector(".sidebar");const t=document.querySelector(".header-right");if(t){const a=document.createElement("div");a.className="theme-toggle-container",t.prepend(a),Xt(a)}const n=document.getElementById("map");n&&mn(n)}async function Qn(){ss("Chargement des données...");const e=await vt();mt(e),je(),Ue(),setTimeout(()=>{bt()},100),F({message:`${e.length} lieux de stage chargés`,type:"success",duration:3e3})}function Xn(){K("FILTER_CHANGED",()=>{je(),it()}),K("DATA_LOADED",()=>{je(),it()}),window.addEventListener("sidebar-toggle",()=>{tt()}),window.addEventListener("locate-on-map",e=>{const{index:t}=e.detail;t!==void 0&&Je(t,{zoom:15,openPopup:!0})}),window.addEventListener("location-selected",e=>{const{index:t}=e.detail;t!==void 0&&ns(t)}),window.addEventListener("resize",()=>{tt()}),document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();const t=document.getElementById("searchInput");t==null||t.focus()}e.key==="Escape"&&as(),e.key==="h"&&!is()&&fn(!m.heatmapEnabled)}),es()}function es(){const e=document.getElementById("adminBtn");e&&e.addEventListener("click",()=>{Vn()});const t=document.getElementById("searchInput");t&&t.addEventListener("input",os(()=>{ne({search:t.value})},300));const n=document.getElementById("exportCSV"),a=document.getElementById("exportJSON"),i=document.getElementById("exportPDF");n&&n.addEventListener("click",async()=>{const{exportAsCsv:o}=await $e(async()=>{const{exportAsCsv:d}=await import("./export.service-B5insj9F.js");return{exportAsCsv:d}},__vite__mapDeps([2,0,1]),import.meta.url);await o(m.filteredIndices),F({message:"Export CSV téléchargé",type:"success"})}),a&&a.addEventListener("click",async()=>{const{exportAsJson:o}=await $e(async()=>{const{exportAsJson:d}=await import("./export.service-B5insj9F.js");return{exportAsJson:d}},__vite__mapDeps([2,0,1]),import.meta.url);await o(m.filteredIndices),F({message:"Export JSON téléchargé",type:"success"})}),i&&i.addEventListener("click",async()=>{const{exportAsPdf:o}=await $e(async()=>{const{exportAsPdf:d}=await import("./export.service-B5insj9F.js");return{exportAsPdf:d}},__vite__mapDeps([2,0,1]),import.meta.url);await o(m.filteredIndices),F({message:"Export PDF généré",type:"success"})});const s=document.getElementById("resetBtn");s&&s.addEventListener("click",()=>{t&&(t.value="");const o=document.getElementById("domaineFilter"),d=document.getElementById("niveauFilter");o&&(o.value=""),d&&(d.value=""),ne({search:"",domains:[],levelMin:1,levelMax:5,distanceKm:null,referencePoint:null,favoritesOnly:!1})});const r=document.getElementById("domaineFilter");if(r){let o=function(){const d=m.uniqueTypes;r.innerHTML='<option value="">Tous</option>',d.forEach(p=>{const g=document.createElement("option");g.value=p,g.textContent=p,r.appendChild(g)})};r.addEventListener("change",()=>{const d=r.value;ne({domains:d?[d]:[]})}),o(),K("DATA_LOADED",o)}const l=document.getElementById("niveauFilter");l&&l.addEventListener("change",()=>{const o=l.value;ne(o?{levelMin:parseInt(o),levelMax:parseInt(o)}:{levelMin:1,levelMax:5})})}function je(){const e=document.getElementById("resultsCount");if(!e)return;const t=m.locations.length,n=m.filteredIndices.length,a=e.querySelector("span");a&&(n===t?a.textContent=`${t} lieu${t>1?"x":""} de stage`:a.textContent=`${n} / ${t} lieu${n>1?"x":""}`)}function it(){const e=document.getElementById("resultsList");if(!e)return;const t=m.filteredIndices,n=50,a=t.slice(0,n);if(a.length===0){e.innerHTML=`
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>Aucun résultat trouvé</p>
      </div>
    `;return}const i=a.map(s=>{const r=m.locations[s],l=ts(r.niveau);return`
      <div class="result-item" data-index="${s}">
        <div class="result-item-header">
          <span class="result-item-name">${_e(r.nom)}</span>
          ${r.niveau?`<span class="result-item-niveau" style="background: linear-gradient(135deg, ${l} 0%, ${l} 100%)">Niv. ${r.niveau}</span>`:""}
        </div>
        <div class="result-item-ville">
          <i class="fas fa-map-marker-alt"></i>
          ${_e(r.ville)} (${r.codePostal})
        </div>
        <div class="result-item-type">
          <i class="fas fa-utensils"></i>
          ${_e(r.type)}
        </div>
        <div class="result-item-actions">
          <button class="result-item-btn btn-locate" title="Localiser sur la carte">
            <i class="fas fa-crosshairs"></i> Localiser
          </button>
          ${r.telephone?`
            <a href="tel:${r.telephone}" class="result-item-btn btn-call" title="Appeler">
              <i class="fas fa-phone"></i> Appeler
            </a>
          `:""}
        </div>
      </div>
    `}).join("");if(e.innerHTML=i,t.length>n){const s=document.createElement("div");s.className="results-more",s.innerHTML=`<p>+ ${t.length-n} autres résultats (affiner la recherche)</p>`,e.appendChild(s)}e.querySelectorAll(".result-item").forEach(s=>{var l;const r=parseInt(s.dataset.index||"-1",10);(l=s.querySelector(".btn-locate"))==null||l.addEventListener("click",o=>{o.stopPropagation(),window.dispatchEvent(new CustomEvent("locate-on-map",{detail:{index:r}}))}),s.addEventListener("click",()=>{e.querySelectorAll(".result-item.active").forEach(o=>o.classList.remove("active")),s.classList.add("active"),window.dispatchEvent(new CustomEvent("locate-on-map",{detail:{index:r}}))})})}function ts(e){if(!e)return"#94a3b8";const t=e.match(/(\d)/);if(!t)return"#94a3b8";const n=parseInt(t[1],10);return["#22c55e","#84cc16","#eab308","#f97316","#8b5cf6"][n-1]||"#94a3b8"}function _e(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function ns(e){const t=document.getElementById("resultsList");if(!t)return;const n=t.querySelector(`[data-index="${e}"]`);n&&(n.scrollIntoView({behavior:"smooth",block:"center"}),n.classList.add("highlight"),setTimeout(()=>n.classList.remove("highlight"),2e3))}function ss(e){const t=document.querySelector(".loading-text");t&&(t.textContent=e)}function ot(){const e=document.getElementById("loadingOverlay");e&&(e.style.opacity="0",setTimeout(()=>{e.style.display="none"},300))}function as(){document.querySelectorAll(".modal-overlay").forEach(a=>{a.style.display="none"});const t=document.querySelector(".admin-modal-overlay");t&&(t.classList.add("closing"),setTimeout(()=>t.remove(),300));const n=document.querySelector(".admin-auth-modal");n&&n.remove()}function is(){const e=document.activeElement;return e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement||e instanceof HTMLSelectElement}function os(e,t){let n=null;return(...a)=>{n&&clearTimeout(n),n=setTimeout(()=>e(...a),t)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",at):at();export{cs as f,ds as g,m as s};
//# sourceMappingURL=main-R0kCeu9K.js.map
