// ============================================================================
// Service de persistance (localStorage + IndexedDB)
// ============================================================================

import { get, set, del, keys } from 'idb-keyval';
import type { PersistedState } from '../types';

const STORAGE_KEY = 'carte-stages-state';
const STORAGE_VERSION = 1;
const NOTES_STORE_KEY = 'carte-stages-notes';

/**
 * Sauvegarde l'état dans localStorage
 */
export function persistState(state: PersistedState): void {
  try {
    const data = {
      version: STORAGE_VERSION,
      ...state,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde de l\'état:', error);
  }
}

/**
 * Charge l'état depuis localStorage
 */
export async function loadPersistedState(): Promise<PersistedState | null> {
  try {
    // Charger depuis localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);

    // Vérifier la version
    if (data.version !== STORAGE_VERSION) {
      console.log('Version de stockage différente, migration...');
      return migrateState(data);
    }

    // Charger les notes depuis IndexedDB (plus de capacité)
    const notes = await loadNotesFromIndexedDB();

    return {
      theme: data.theme || 'auto',
      favorites: data.favorites || [],
      personalNotes: notes || data.personalNotes || {},
      sidebarCollapsed: data.sidebarCollapsed || false,
      mapCenter: data.mapCenter || { lat: 46.5, lon: -0.3 },
      mapZoom: data.mapZoom || 9,
      lastFilters: data.lastFilters || {}
    };
  } catch (error) {
    console.warn('Erreur lors du chargement de l\'état:', error);
    return null;
  }
}

/**
 * Migre l'état d'une ancienne version
 */
function migrateState(oldData: any): PersistedState {
  // Pour l'instant, retourner les valeurs par défaut
  // Ajouter la logique de migration si nécessaire
  return {
    theme: oldData.theme || 'auto',
    favorites: oldData.favorites || [],
    personalNotes: oldData.personalNotes || {},
    sidebarCollapsed: false,
    mapCenter: { lat: 46.5, lon: -0.3 },
    mapZoom: 9,
    lastFilters: {}
  };
}

/**
 * Sauvegarde les notes dans IndexedDB
 */
export async function saveNotesToIndexedDB(notes: Record<string, string>): Promise<void> {
  try {
    await set(NOTES_STORE_KEY, notes);
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde des notes dans IndexedDB:', error);
    // Fallback sur localStorage
    try {
      localStorage.setItem(NOTES_STORE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Impossible de sauvegarder les notes:', e);
    }
  }
}

/**
 * Charge les notes depuis IndexedDB
 */
export async function loadNotesFromIndexedDB(): Promise<Record<string, string> | null> {
  try {
    const notes = await get<Record<string, string>>(NOTES_STORE_KEY);
    return notes || null;
  } catch (error) {
    console.warn('Erreur lors du chargement des notes depuis IndexedDB:', error);
    // Fallback sur localStorage
    try {
      const stored = localStorage.getItem(NOTES_STORE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }
}

/**
 * Efface toutes les données persistées
 */
export async function clearPersistedData(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(NOTES_STORE_KEY);
    await del(NOTES_STORE_KEY);
  } catch (error) {
    console.warn('Erreur lors de l\'effacement des données:', error);
  }
}

/**
 * Exporte toutes les données utilisateur
 */
export async function exportUserData(): Promise<{
  favorites: string[];
  notes: Record<string, string>;
  preferences: Partial<PersistedState>;
}> {
  const state = await loadPersistedState();

  return {
    favorites: state?.favorites || [],
    notes: state?.personalNotes || {},
    preferences: {
      theme: state?.theme,
      sidebarCollapsed: state?.sidebarCollapsed,
      mapCenter: state?.mapCenter,
      mapZoom: state?.mapZoom
    }
  };
}

/**
 * Importe les données utilisateur
 */
export async function importUserData(data: {
  favorites?: string[];
  notes?: Record<string, string>;
  preferences?: Partial<PersistedState>;
}): Promise<void> {
  const currentState = await loadPersistedState();

  const newState: PersistedState = {
    theme: data.preferences?.theme || currentState?.theme || 'auto',
    favorites: data.favorites || currentState?.favorites || [],
    personalNotes: data.notes || currentState?.personalNotes || {},
    sidebarCollapsed: data.preferences?.sidebarCollapsed ?? currentState?.sidebarCollapsed ?? false,
    mapCenter: data.preferences?.mapCenter || currentState?.mapCenter || { lat: 46.5, lon: -0.3 },
    mapZoom: data.preferences?.mapZoom ?? currentState?.mapZoom ?? 9,
    lastFilters: currentState?.lastFilters || {}
  };

  persistState(newState);

  if (data.notes) {
    await saveNotesToIndexedDB(data.notes);
  }
}

/**
 * Vérifie l'espace de stockage disponible
 */
export async function checkStorageQuota(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
} | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentUsed: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0
      };
    } catch (error) {
      return null;
    }
  }
  return null;
}

/**
 * Cache pour les données temporaires (session only)
 */
const sessionCache = new Map<string, { data: any; expires: number }>();

export function setSessionCache(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
  sessionCache.set(key, {
    data,
    expires: Date.now() + ttlMs
  });
}

export function getSessionCache<T>(key: string): T | null {
  const cached = sessionCache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expires) {
    sessionCache.delete(key);
    return null;
  }

  return cached.data as T;
}

export function clearSessionCache(): void {
  sessionCache.clear();
}
