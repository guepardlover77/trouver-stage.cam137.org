// ============================================================================
// Service de géocodage (BAN + Nominatim)
// ============================================================================

import type { GeocodingResult } from '../types';
import { setSessionCache, getSessionCache } from './storage.service';

const BAN_API_URL = 'https://api-adresse.data.gouv.fr/search/';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Géocode une adresse en utilisant l'API BAN puis Nominatim en fallback
 */
export async function geocodeAddress(
  adresse: string,
  codePostal: string,
  ville: string
): Promise<GeocodingResult | null> {
  const cacheKey = `geo:${adresse}:${codePostal}:${ville}`;
  const cached = getSessionCache<GeocodingResult>(cacheKey);
  if (cached) return cached;

  // Essayer l'API BAN d'abord (meilleure qualité pour la France)
  const banResult = await geocodeWithBAN(adresse, codePostal, ville);
  if (banResult) {
    setSessionCache(cacheKey, banResult, 30 * 60 * 1000); // 30 min
    return banResult;
  }

  // Fallback sur Nominatim
  const nominatimResult = await geocodeWithNominatim(adresse, codePostal, ville);
  if (nominatimResult) {
    setSessionCache(cacheKey, nominatimResult, 30 * 60 * 1000);
    return nominatimResult;
  }

  return null;
}

/**
 * Géocode avec l'API BAN (Base Adresse Nationale)
 */
async function geocodeWithBAN(
  adresse: string,
  codePostal: string,
  ville: string
): Promise<GeocodingResult | null> {
  try {
    const query = `${adresse} ${codePostal} ${ville}`;
    const url = new URL(BAN_API_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '1');
    if (codePostal) {
      url.searchParams.set('postcode', codePostal);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`BAN API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [lon, lat] = feature.geometry.coordinates;
      const score = feature.properties.score || 0;

      // Seuil de confiance minimum
      if (score < 0.3) {
        return null;
      }

      return {
        lat,
        lon,
        confidence: score,
        source: 'ban',
        label: feature.properties.label
      };
    }

    return null;
  } catch (error) {
    console.warn('Erreur API BAN:', error);
    return null;
  }
}

/**
 * Géocode avec Nominatim (OpenStreetMap)
 */
async function geocodeWithNominatim(
  adresse: string,
  codePostal: string,
  ville: string
): Promise<GeocodingResult | null> {
  try {
    const query = `${adresse}, ${codePostal} ${ville}, France`;
    const url = new URL(NOMINATIM_API_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'fr');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'CarteStages/2.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      const importance = parseFloat(result.importance) || 0;

      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        confidence: importance,
        source: 'nominatim',
        label: result.display_name
      };
    }

    return null;
  } catch (error) {
    console.warn('Erreur Nominatim:', error);
    return null;
  }
}

/**
 * Géocode par code postal uniquement (centre-ville)
 */
export async function geocodePostalCode(codePostal: string): Promise<GeocodingResult | null> {
  const cacheKey = `geo:cp:${codePostal}`;
  const cached = getSessionCache<GeocodingResult>(cacheKey);
  if (cached) return cached;

  try {
    const url = new URL(BAN_API_URL);
    url.searchParams.set('q', codePostal);
    url.searchParams.set('type', 'municipality');
    url.searchParams.set('limit', '1');

    const response = await fetch(url.toString());
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [lon, lat] = feature.geometry.coordinates;

      const result: GeocodingResult = {
        lat,
        lon,
        confidence: 0.8,
        source: 'ban',
        label: feature.properties.label
      };

      setSessionCache(cacheKey, result, 60 * 60 * 1000); // 1h
      return result;
    }

    return null;
  } catch (error) {
    console.warn('Erreur géocodage code postal:', error);
    return null;
  }
}

/**
 * Géocodage inverse (coordonnées → adresse)
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ adresse: string; ville: string; codePostal: string } | null> {
  const cacheKey = `geo:rev:${lat.toFixed(5)}:${lon.toFixed(5)}`;
  const cached = getSessionCache<{ adresse: string; ville: string; codePostal: string }>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const props = data.features[0].properties;

      const result = {
        adresse: props.name || '',
        ville: props.city || '',
        codePostal: props.postcode || ''
      };

      setSessionCache(cacheKey, result, 60 * 60 * 1000);
      return result;
    }

    return null;
  } catch (error) {
    console.warn('Erreur géocodage inverse:', error);
    return null;
  }
}

/**
 * Recherche d'autocomplétion d'adresses
 */
export async function autocompleteAddress(query: string): Promise<{
  label: string;
  lat: number;
  lon: number;
  type: string;
}[]> {
  if (query.length < 3) {
    return [];
  }

  const cacheKey = `geo:auto:${query}`;
  const cached = getSessionCache<{ label: string; lat: number; lon: number; type: string }[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = new URL(BAN_API_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '5');
    url.searchParams.set('autocomplete', '1');

    const response = await fetch(url.toString());
    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    const results = (data.features || []).map((feature: any) => ({
      label: feature.properties.label,
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
      type: feature.properties.type
    }));

    setSessionCache(cacheKey, results, 5 * 60 * 1000);
    return results;
  } catch (error) {
    console.warn('Erreur autocomplétion:', error);
    return [];
  }
}

/**
 * Recherche de communes
 */
export async function searchCommunes(query: string): Promise<{
  nom: string;
  codePostal: string;
  codeDepartement: string;
  lat: number;
  lon: number;
}[]> {
  if (query.length < 2) {
    return [];
  }

  try {
    const url = new URL(BAN_API_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'municipality');
    url.searchParams.set('limit', '10');

    const response = await fetch(url.toString());
    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return (data.features || []).map((feature: any) => ({
      nom: feature.properties.city || feature.properties.name,
      codePostal: feature.properties.postcode || '',
      codeDepartement: feature.properties.context?.split(',')[0]?.trim() || '',
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0]
    }));
  } catch (error) {
    console.warn('Erreur recherche communes:', error);
    return [];
  }
}

/**
 * Géocode plusieurs adresses en batch (avec rate limiting)
 */
export async function batchGeocode(
  items: { adresse: string; codePostal: string; ville: string }[],
  onProgress?: (current: number, total: number) => void
): Promise<(GeocodingResult | null)[]> {
  const results: (GeocodingResult | null)[] = [];
  const total = items.length;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const result = await geocodeAddress(item.adresse, item.codePostal, item.ville);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, total);
    }

    // Rate limiting: 100ms entre chaque requête
    if (i < items.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}
