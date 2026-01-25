// ============================================================================
// Service API HTTP pour communiquer avec le backend
// ============================================================================

import type { Location } from '../types';

// Configuration de l'API
const API_BASE_URL = '/api/v1';

// Types de réponse API
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types pour les données de l'API (snake_case)
interface ApiLocation {
  id: number;
  nom: string;
  adresse: string;
  code_postal: string;
  ville: string;
  type: string;
  niveau: string | null;
  telephone: string | null;
  contact: string | null;
  email: string | null;
  commentaire: string | null;
  lat: number | null;
  lon: number | null;
  created_at?: string;
  updated_at?: string;
}

// Stockage du code admin
let adminCode: string | null = null;

/**
 * Définit le code admin pour les requêtes authentifiées
 */
export function setAdminCode(code: string | null): void {
  adminCode = code;
}

/**
 * Récupère le code admin actuel
 */
export function getAdminCode(): string | null {
  return adminCode;
}

/**
 * Vérifie si un code admin est valide
 */
export async function verifyAdminCode(code: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data: ApiResponse = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Error verifying admin code:', error);
    return false;
  }
}

/**
 * Convertit une location API (snake_case) vers le format frontend (camelCase)
 */
function apiToFrontend(apiLoc: ApiLocation): Location & { id?: number } {
  return {
    id: apiLoc.id,
    nom: apiLoc.nom,
    adresse: apiLoc.adresse,
    codePostal: apiLoc.code_postal,
    ville: apiLoc.ville,
    type: apiLoc.type,
    niveau: apiLoc.niveau || '',
    telephone: apiLoc.telephone || '',
    contact: apiLoc.contact || '',
    email: apiLoc.email || '',
    commentaire: apiLoc.commentaire || '',
    lat: apiLoc.lat,
    lon: apiLoc.lon,
  };
}

/**
 * Convertit une location frontend (camelCase) vers le format API (snake_case)
 */
function frontendToApi(loc: Location): Omit<ApiLocation, 'id' | 'created_at' | 'updated_at'> {
  return {
    nom: loc.nom,
    adresse: loc.adresse,
    code_postal: loc.codePostal,
    ville: loc.ville,
    type: loc.type,
    niveau: loc.niveau || null,
    telephone: loc.telephone || null,
    contact: loc.contact || null,
    email: loc.email || null,
    commentaire: loc.commentaire || null,
    lat: loc.lat,
    lon: loc.lon,
  };
}

/**
 * Headers communs pour les requêtes API
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (adminCode) {
    headers['X-Admin-Code'] = adminCode;
  }

  return headers;
}

/**
 * Récupère toutes les locations depuis l'API
 */
export async function fetchLocations(): Promise<Location[]> {
  const response = await fetch(`${API_BASE_URL}/locations?limit=10000`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: PaginatedResponse<ApiLocation> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch locations');
  }

  return data.data.map(apiToFrontend);
}

/**
 * Récupère une location par son ID
 */
export async function fetchLocationById(id: number): Promise<Location | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<ApiLocation> = await response.json();

    if (!data.success || !data.data) {
      return null;
    }

    return apiToFrontend(data.data);
  } catch (error) {
    console.error('Error fetching location:', error);
    return null;
  }
}

/**
 * Crée une nouvelle location
 */
export async function createLocation(location: Location): Promise<Location> {
  const response = await fetch(`${API_BASE_URL}/locations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(frontendToApi(location)),
  });

  const data: ApiResponse<ApiLocation> = await response.json();

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error || 'Failed to create location');
  }

  return apiToFrontend(data.data);
}

/**
 * Met à jour une location existante
 */
export async function updateLocationApi(id: number, updates: Partial<Location>): Promise<Location> {
  // Convertir les mises à jour partielles
  const apiUpdates: Record<string, unknown> = {};

  if (updates.nom !== undefined) apiUpdates.nom = updates.nom;
  if (updates.adresse !== undefined) apiUpdates.adresse = updates.adresse;
  if (updates.codePostal !== undefined) apiUpdates.code_postal = updates.codePostal;
  if (updates.ville !== undefined) apiUpdates.ville = updates.ville;
  if (updates.type !== undefined) apiUpdates.type = updates.type;
  if (updates.niveau !== undefined) apiUpdates.niveau = updates.niveau || null;
  if (updates.telephone !== undefined) apiUpdates.telephone = updates.telephone || null;
  if (updates.contact !== undefined) apiUpdates.contact = updates.contact || null;
  if (updates.email !== undefined) apiUpdates.email = updates.email || null;
  if (updates.commentaire !== undefined) apiUpdates.commentaire = updates.commentaire || null;
  if (updates.lat !== undefined) apiUpdates.lat = updates.lat;
  if (updates.lon !== undefined) apiUpdates.lon = updates.lon;

  const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(apiUpdates),
  });

  const data: ApiResponse<ApiLocation> = await response.json();

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error || 'Failed to update location');
  }

  return apiToFrontend(data.data);
}

/**
 * Supprime une location
 */
export async function deleteLocation(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  const data: ApiResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to delete location');
  }

  return true;
}

/**
 * Récupère tous les types uniques
 */
export async function fetchUniqueTypes(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/locations/types`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse<string[]> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch types');
  }

  return data.data;
}

/**
 * Récupère toutes les villes uniques
 */
export async function fetchUniqueCities(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/locations/cities`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse<string[]> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch cities');
  }

  return data.data;
}

/**
 * Vérifie si l'API est disponible
 */
export async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    const data: ApiResponse = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}
