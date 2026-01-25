// ============================================================================
// Service de gestion des données
// ============================================================================

import type { Location } from '../types';
import { normalizeText } from '../utils/helpers';
import {
  isApiAvailable,
  fetchLocations,
  createLocation as apiCreateLocation,
  updateLocationApi,
  deleteLocation as apiDeleteLocation,
  setAdminCode,
  getAdminCode,
  verifyAdminCode,
} from './api.service';

// Référence aux données embarquées (fallback pour file://)
declare global {
  interface Window {
    STAGE_DATA?: Location[];
  }
}

// Types étendus avec ID pour le mode API
interface LocationWithId extends Location {
  id?: number;
}

let locations: LocationWithId[] = [];
let searchIndex: Map<number, string> = new Map();
let useApi = false; // Flag pour savoir si on utilise l'API

// Export des fonctions d'authentification
export { setAdminCode, getAdminCode, verifyAdminCode };

/**
 * Vérifie si le mode API est actif
 */
export function isApiMode(): boolean {
  return useApi;
}

/**
 * Charge les données depuis l'API ou le fichier JSON (fallback)
 */
export async function loadData(): Promise<Location[]> {
  // Essayer d'abord l'API
  try {
    const apiAvailable = await isApiAvailable();
    if (apiAvailable) {
      console.log('API disponible, chargement depuis l\'API...');
      const data = await fetchLocations();
      locations = data as LocationWithId[];
      useApi = true;
      buildSearchIndex();
      console.log(`Chargé ${locations.length} locations depuis l'API`);
      return locations;
    }
  } catch (error) {
    console.log('API non disponible, utilisation du fallback...', error);
  }

  useApi = false;

  // Fallback: essayer de charger depuis le fichier JSON
  try {
    const response = await fetch('./data.json');
    if (response.ok) {
      const data = await response.json();
      locations = data;
      buildSearchIndex();
      console.log(`Chargé ${locations.length} locations depuis data.json`);
      return locations;
    }
  } catch (error) {
    console.log('Chargement depuis data.json échoué, utilisation des données embarquées');
  }

  // Fallback: données embarquées (pour file://)
  if (window.STAGE_DATA) {
    locations = window.STAGE_DATA;
    buildSearchIndex();
    return locations;
  }

  // Dernier recours: essayer js/data.json
  try {
    const response = await fetch('./js/data.json');
    if (response.ok) {
      const data = await response.json();
      locations = data;
      buildSearchIndex();
      return locations;
    }
  } catch (error) {
    console.error('Impossible de charger les données');
  }

  throw new Error('Aucune source de données disponible');
}

/**
 * Construit l'index de recherche pour les filtres rapides
 */
function buildSearchIndex(): void {
  searchIndex.clear();

  locations.forEach((location, index) => {
    const searchableText = normalizeText([
      location.nom,
      location.adresse,
      location.ville,
      location.codePostal,
      location.type,
      location.contact,
      location.commentaire
    ].filter(Boolean).join(' '));

    searchIndex.set(index, searchableText);
  });
}

/**
 * Retourne toutes les données
 */
export function getAllLocations(): Location[] {
  return locations;
}

/**
 * Retourne un lieu par son index
 */
export function getLocationByIndex(index: number): Location | null {
  return locations[index] || null;
}

/**
 * Filtre les données selon les critères
 */
export function filterData(options: {
  search?: string;
  domains?: string[];
  levelMin?: number;
  levelMax?: number;
}): number[] {
  const { search = '', domains = [], levelMin = 1, levelMax = 5 } = options;

  const searchNormalized = normalizeText(search);

  return locations
    .map((_, index) => index)
    .filter(index => {
      const location = locations[index];

      // Filtre de recherche
      if (searchNormalized) {
        const indexedText = searchIndex.get(index) || '';
        if (!indexedText.includes(searchNormalized)) {
          return false;
        }
      }

      // Filtre par domaine
      if (domains.length > 0 && !domains.includes(location.type)) {
        return false;
      }

      // Filtre par niveau
      if (location.niveau) {
        const niveau = parseNiveau(location.niveau);
        if (niveau !== null && (niveau < levelMin || niveau > levelMax)) {
          return false;
        }
      }

      return true;
    });
}

/**
 * Parse un niveau (peut être "2", "2-3", etc.)
 */
function parseNiveau(niveau: string): number | null {
  if (!niveau) return null;

  const rangeMatch = niveau.match(/(\d)\s*-\s*(\d)/);
  if (rangeMatch) {
    return parseInt(rangeMatch[1], 10);
  }

  const match = niveau.match(/(\d)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Retourne tous les types uniques
 */
export function getUniqueTypes(): string[] {
  const types = new Set<string>();
  locations.forEach(loc => {
    if (loc.type) {
      types.add(loc.type);
    }
  });
  return Array.from(types).sort((a, b) => a.localeCompare(b, 'fr'));
}

/**
 * Retourne toutes les villes uniques
 */
export function getUniqueCities(): string[] {
  const cities = new Set<string>();
  locations.forEach(loc => {
    if (loc.ville) {
      cities.add(loc.ville);
    }
  });
  return Array.from(cities).sort((a, b) => a.localeCompare(b, 'fr'));
}

/**
 * Retourne les lieux sans coordonnées
 */
export function getLocationsWithoutCoords(): number[] {
  return locations
    .map((loc, index) => ({ loc, index }))
    .filter(({ loc }) => loc.lat === null || loc.lon === null)
    .map(({ index }) => index);
}

/**
 * Ajoute un nouveau lieu
 * En mode API, appelle l'API et recharge les données
 */
export async function addLocation(location: Location): Promise<number> {
  if (useApi) {
    try {
      const created = await apiCreateLocation(location);
      // Recharger les données pour avoir l'ID correct
      await loadData();
      // Trouver l'index de la nouvelle location
      const index = locations.findIndex(
        (loc) => loc.nom === created.nom && loc.ville === created.ville
      );
      return index >= 0 ? index : locations.length - 1;
    } catch (error) {
      console.error('Erreur lors de la création via API:', error);
      throw error;
    }
  }

  // Mode local (fallback)
  const index = locations.length;
  locations.push(location);

  // Mettre à jour l'index de recherche
  const searchableText = normalizeText([
    location.nom,
    location.adresse,
    location.ville,
    location.codePostal,
    location.type,
    location.contact,
    location.commentaire
  ].filter(Boolean).join(' '));

  searchIndex.set(index, searchableText);

  return index;
}

/**
 * Met à jour un lieu existant
 * En mode API, appelle l'API pour persister les modifications
 */
export async function updateLocation(index: number, updates: Partial<Location>): Promise<boolean> {
  if (index < 0 || index >= locations.length) {
    return false;
  }

  if (useApi) {
    const loc = locations[index];
    if (loc.id) {
      try {
        await updateLocationApi(loc.id, updates);
      } catch (error) {
        console.error('Erreur lors de la mise à jour via API:', error);
        throw error;
      }
    }
  }

  locations[index] = { ...locations[index], ...updates };

  // Mettre à jour l'index de recherche
  const location = locations[index];
  const searchableText = normalizeText([
    location.nom,
    location.adresse,
    location.ville,
    location.codePostal,
    location.type,
    location.contact,
    location.commentaire
  ].filter(Boolean).join(' '));

  searchIndex.set(index, searchableText);

  return true;
}

/**
 * Supprime un lieu
 * En mode API, appelle l'API pour persister la suppression
 */
export async function removeLocation(index: number): Promise<boolean> {
  if (index < 0 || index >= locations.length) {
    return false;
  }

  if (useApi) {
    const loc = locations[index];
    if (loc.id) {
      try {
        await apiDeleteLocation(loc.id);
      } catch (error) {
        console.error('Erreur lors de la suppression via API:', error);
        throw error;
      }
    }
  }

  locations.splice(index, 1);
  buildSearchIndex(); // Reconstruire l'index car les indices ont changé

  return true;
}

/**
 * Vérifie si un lieu existe déjà (par nom et ville)
 */
export function locationExists(nom: string, ville: string): boolean {
  const nomNormalized = normalizeText(nom);
  const villeNormalized = normalizeText(ville);

  return locations.some(loc =>
    normalizeText(loc.nom) === nomNormalized &&
    normalizeText(loc.ville) === villeNormalized
  );
}

/**
 * Recherche des lieux similaires
 */
export function findSimilarLocations(location: Partial<Location>): number[] {
  const results: number[] = [];

  if (!location.nom) return results;

  const nomNormalized = normalizeText(location.nom);

  locations.forEach((loc, index) => {
    const locNomNormalized = normalizeText(loc.nom);

    // Correspondance exacte du nom
    if (locNomNormalized === nomNormalized) {
      results.push(index);
      return;
    }

    // Correspondance partielle (contient)
    if (locNomNormalized.includes(nomNormalized) || nomNormalized.includes(locNomNormalized)) {
      results.push(index);
    }
  });

  return results;
}

/**
 * Calcule les statistiques des données
 */
export function calculateStatistics() {
  const byType: Record<string, number> = {};
  const byLevel: Record<string, number> = {};
  const byCity: Record<string, number> = {};
  const byDepartment: Record<string, number> = {};
  let geolocated = 0;

  locations.forEach(loc => {
    // Par type
    if (loc.type) {
      byType[loc.type] = (byType[loc.type] || 0) + 1;
    }

    // Par niveau
    if (loc.niveau) {
      byLevel[loc.niveau] = (byLevel[loc.niveau] || 0) + 1;
    }

    // Par ville
    if (loc.ville) {
      byCity[loc.ville] = (byCity[loc.ville] || 0) + 1;
    }

    // Par département
    if (loc.codePostal) {
      const dept = loc.codePostal.slice(0, 2);
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    }

    // Géolocalisé
    if (loc.lat !== null && loc.lon !== null) {
      geolocated++;
    }
  });

  return {
    totalLocations: locations.length,
    totalCities: Object.keys(byCity).length,
    totalGeolocated: geolocated,
    percentGeolocated: locations.length > 0 ? (geolocated / locations.length) * 100 : 0,
    byType: Object.entries(byType)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    byLevel: Object.entries(byLevel)
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => a.level.localeCompare(b.level)),
    topCities: Object.entries(byCity)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    byDepartment: Object.entries(byDepartment)
      .map(([dept, count]) => ({ dept, count }))
      .sort((a, b) => b.count - a.count)
  };
}

/**
 * Exporte les données au format JSON
 */
export function exportAsJson(indices?: number[]): string {
  const data = indices
    ? indices.map(i => locations[i])
    : locations;

  return JSON.stringify(data, null, 2);
}
