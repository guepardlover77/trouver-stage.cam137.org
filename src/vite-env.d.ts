/// <reference types="vite/client" />

// Types pour les données embarquées
interface Window {
  STAGE_DATA?: import('./types').Location[];
  __store?: any;
  __app?: any;
}

// Déclaration globale pour Leaflet chargé via CDN
declare const L: any;
