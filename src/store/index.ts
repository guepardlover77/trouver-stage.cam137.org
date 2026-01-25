// ============================================================================
// Store centralisé de l'application
// ============================================================================

import type {
  AppState,
  Location,
  Filters,
  SortOptions,
  Theme,
  ViewMode,
  AppEvent,
  EventListener
} from '../types';
import { reactive, batch } from './reactivity';
import { loadPersistedState, persistState } from '../services/storage.service';

// État initial
const initialFilters: Filters = {
  search: '',
  domains: [],
  levelMin: 1,
  levelMax: 5,
  distanceKm: null,
  referencePoint: null,
  favoritesOnly: false
};

const initialSortOptions: SortOptions = {
  field: 'nom',
  direction: 'asc'
};

const initialState: AppState = {
  // Données
  locations: [],
  filteredIndices: [],
  searchIndex: new Map(),

  // UI State
  isLoading: true,
  theme: 'auto',
  viewMode: 'split',
  sidebarCollapsed: false,
  detailPanelOpen: false,
  selectedLocationIndex: null,

  // Filtres
  filters: initialFilters,
  sortOptions: initialSortOptions,

  // Fonctionnalités
  favorites: new Set(),
  compareList: [],
  personalNotes: new Map(),

  // Carte
  mapCenter: { lat: 46.5, lon: -0.3 },
  mapZoom: 9,
  heatmapEnabled: false,
  clusteringEnabled: true,
  userLocation: null,

  // Stats
  uniqueTypes: [],
  uniqueCities: []
};

// Créer le store réactif
export const store = reactive<AppState>(initialState);

// Event bus pour la communication inter-composants
type EventMap = {
  [K in AppEvent['type']]: Set<EventListener<K>>;
};

const eventListeners: Partial<EventMap> = {};

/**
 * Émet un événement
 */
export function emit<T extends AppEvent['type']>(
  type: T,
  payload: Extract<AppEvent, { type: T }>['payload']
) {
  const listeners = eventListeners[type] as Set<EventListener<T>> | undefined;
  if (listeners) {
    listeners.forEach(listener => {
      listener({ type, payload } as Extract<AppEvent, { type: T }>);
    });
  }
}

/**
 * S'abonne à un événement
 */
export function on<T extends AppEvent['type']>(
  type: T,
  listener: EventListener<T>
): () => void {
  if (!eventListeners[type]) {
    eventListeners[type] = new Set() as any;
  }
  (eventListeners[type] as Set<EventListener<T>>).add(listener);

  return () => {
    (eventListeners[type] as Set<EventListener<T>>).delete(listener);
  };
}

// ============================================================================
// Actions du store
// ============================================================================

/**
 * Charge les données des lieux
 */
export function setLocations(locations: Location[]) {
  batch(() => {
    store.locations = locations;
    store.filteredIndices = locations.map((_, i) => i);
    store.uniqueTypes = [...new Set(locations.map(l => l.type).filter(Boolean))].sort();
    store.uniqueCities = [...new Set(locations.map(l => l.ville).filter(Boolean))].sort();
    buildSearchIndex();
  });

  emit('DATA_LOADED', locations);
}

/**
 * Construit l'index de recherche
 */
function buildSearchIndex() {
  store.searchIndex.clear();

  store.locations.forEach((location, index) => {
    const searchableText = [
      location.nom,
      location.adresse,
      location.ville,
      location.codePostal,
      location.type,
      location.contact,
      location.commentaire
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    store.searchIndex.set(index, searchableText);
  });
}

/**
 * Met à jour les filtres
 */
export function updateFilters(newFilters: Partial<Filters>) {
  batch(() => {
    store.filters = { ...store.filters, ...newFilters };
    applyFiltersAndSort();
  });

  emit('FILTER_CHANGED', newFilters);
}

/**
 * Met à jour le tri
 */
export function updateSort(sortOptions: SortOptions) {
  batch(() => {
    store.sortOptions = sortOptions;
    applyFiltersAndSort();
  });

  emit('SORT_CHANGED', sortOptions);
}

/**
 * Applique les filtres et le tri
 */
export function applyFiltersAndSort() {
  const { filters, sortOptions, locations, searchIndex, favorites, userLocation } = store;

  // Normaliser le terme de recherche
  const searchNormalized = filters.search
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Filtrer
  let indices = locations.map((_, i) => i);

  // Filtre de recherche
  if (searchNormalized) {
    indices = indices.filter(i => {
      const text = searchIndex.get(i) || '';
      return text.includes(searchNormalized);
    });
  }

  // Filtre par domaines
  if (filters.domains.length > 0) {
    indices = indices.filter(i => {
      const location = locations[i];
      return filters.domains.includes(location.type);
    });
  }

  // Filtre par niveau
  indices = indices.filter(i => {
    const location = locations[i];
    const niveau = parseNiveau(location.niveau);
    if (niveau === null) return true; // Inclure les lieux sans niveau spécifié
    return niveau >= filters.levelMin && niveau <= filters.levelMax;
  });

  // Filtre par distance
  if (filters.distanceKm !== null && filters.referencePoint) {
    const refPoint = filters.referencePoint;
    indices = indices.filter(i => {
      const location = locations[i];
      if (location.lat === null || location.lon === null) return false;
      const distance = haversineDistance(
        refPoint.lat, refPoint.lon,
        location.lat, location.lon
      );
      return distance <= filters.distanceKm!;
    });
  }

  // Filtre favoris uniquement
  if (filters.favoritesOnly) {
    indices = indices.filter(i => {
      const location = locations[i];
      const id = generateLocationId(location);
      return favorites.has(id);
    });
  }

  // Trier
  indices.sort((a, b) => {
    const locA = locations[a];
    const locB = locations[b];
    let comparison = 0;

    switch (sortOptions.field) {
      case 'nom':
        comparison = locA.nom.localeCompare(locB.nom, 'fr');
        break;
      case 'ville':
        comparison = locA.ville.localeCompare(locB.ville, 'fr');
        break;
      case 'niveau':
        const niveauA = parseNiveau(locA.niveau) ?? 99;
        const niveauB = parseNiveau(locB.niveau) ?? 99;
        comparison = niveauA - niveauB;
        break;
      case 'type':
        comparison = locA.type.localeCompare(locB.type, 'fr');
        break;
      case 'distance':
        if (userLocation) {
          const distA = locA.lat && locA.lon
            ? haversineDistance(userLocation.lat, userLocation.lon, locA.lat, locA.lon)
            : Infinity;
          const distB = locB.lat && locB.lon
            ? haversineDistance(userLocation.lat, userLocation.lon, locB.lat, locB.lon)
            : Infinity;
          comparison = distA - distB;
        }
        break;
    }

    return sortOptions.direction === 'asc' ? comparison : -comparison;
  });

  store.filteredIndices = indices;
}

/**
 * Parse un niveau (peut être "2", "2-3", etc.)
 */
function parseNiveau(niveau: string): number | null {
  if (!niveau) return null;
  const match = niveau.match(/(\d)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Calcule la distance entre deux points (formule de Haversine)
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Génère un ID unique pour un lieu
 */
export function generateLocationId(location: Location): string {
  return `${location.nom}-${location.codePostal}-${location.ville}`
    .toLowerCase()
    .replace(/\s+/g, '-');
}

/**
 * Toggle un favori
 */
export function toggleFavorite(locationId: string) {
  if (store.favorites.has(locationId)) {
    store.favorites.delete(locationId);
  } else {
    store.favorites.add(locationId);
  }

  // Re-filtrer si on affiche uniquement les favoris
  if (store.filters.favoritesOnly) {
    applyFiltersAndSort();
  }

  emit('FAVORITE_TOGGLED', locationId);
  persistCurrentState();
}

/**
 * Sélectionne un lieu pour le détail
 */
export function selectLocation(index: number | null) {
  store.selectedLocationIndex = index;
  store.detailPanelOpen = index !== null;
  emit('LOCATION_SELECTED', index);
}

/**
 * Change le thème
 */
export function setTheme(theme: Theme) {
  store.theme = theme;
  applyTheme(theme);
  emit('THEME_CHANGED', theme);
  persistCurrentState();
}

/**
 * Applique le thème au document
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

/**
 * Toggle la sidebar
 */
export function toggleSidebar() {
  store.sidebarCollapsed = !store.sidebarCollapsed;
  persistCurrentState();
}

/**
 * Met à jour la position utilisateur
 */
export function setUserLocation(location: { lat: number; lon: number } | null) {
  store.userLocation = location;

  // Si tri par distance, re-trier
  if (store.sortOptions.field === 'distance') {
    applyFiltersAndSort();
  }
}

/**
 * Toggle la heatmap
 */
export function toggleHeatmap() {
  store.heatmapEnabled = !store.heatmapEnabled;
}

/**
 * Toggle le clustering
 */
export function toggleClustering() {
  store.clusteringEnabled = !store.clusteringEnabled;
}

/**
 * Ajoute un nouveau lieu au store
 */
export function addLocationToStore(location: Location) {
  batch(() => {
    store.locations = [...store.locations, location];
    store.filteredIndices = store.locations.map((_, i) => i);
    store.uniqueTypes = [...new Set(store.locations.map(l => l.type).filter(Boolean))].sort();
    store.uniqueCities = [...new Set(store.locations.map(l => l.ville).filter(Boolean))].sort();
    buildSearchIndex();
  });
  applyFiltersAndSort();
  emit('DATA_LOADED', store.locations);
}

/**
 * Met à jour un lieu existant dans le store
 */
export function updateLocationInStore(index: number, updates: Partial<Location>) {
  if (index < 0 || index >= store.locations.length) return false;

  batch(() => {
    const newLocations = [...store.locations];
    newLocations[index] = { ...newLocations[index], ...updates };
    store.locations = newLocations;
    store.uniqueTypes = [...new Set(store.locations.map(l => l.type).filter(Boolean))].sort();
    store.uniqueCities = [...new Set(store.locations.map(l => l.ville).filter(Boolean))].sort();
    buildSearchIndex();
  });
  applyFiltersAndSort();
  emit('DATA_LOADED', store.locations);
  return true;
}

/**
 * Supprime un lieu du store
 */
export function removeLocationFromStore(index: number) {
  if (index < 0 || index >= store.locations.length) return false;

  batch(() => {
    const newLocations = store.locations.filter((_, i) => i !== index);
    store.locations = newLocations;
    store.filteredIndices = newLocations.map((_, i) => i);
    store.uniqueTypes = [...new Set(newLocations.map(l => l.type).filter(Boolean))].sort();
    store.uniqueCities = [...new Set(newLocations.map(l => l.ville).filter(Boolean))].sort();
    buildSearchIndex();
  });
  applyFiltersAndSort();
  emit('DATA_LOADED', store.locations);
  return true;
}

/**
 * Ajoute/retire un lieu de la liste de comparaison
 */
export function toggleCompare(locationId: string) {
  const index = store.compareList.indexOf(locationId);
  if (index === -1) {
    if (store.compareList.length < 3) {
      store.compareList.push(locationId);
    }
  } else {
    store.compareList.splice(index, 1);
  }
  emit('COMPARE_TOGGLED', locationId);
}

/**
 * Met à jour une note personnelle
 */
export function updateNote(locationId: string, note: string) {
  if (note.trim()) {
    store.personalNotes.set(locationId, note);
  } else {
    store.personalNotes.delete(locationId);
  }
  emit('NOTE_UPDATED', { id: locationId, note });
  persistCurrentState();
}

/**
 * Met à jour la position de la carte
 */
export function updateMapView(center: { lat: number; lon: number }, zoom: number) {
  store.mapCenter = center;
  store.mapZoom = zoom;
  emit('MAP_MOVED', { center, zoom });
}

/**
 * Persiste l'état courant
 */
function persistCurrentState() {
  persistState({
    theme: store.theme,
    favorites: Array.from(store.favorites),
    personalNotes: Object.fromEntries(store.personalNotes),
    sidebarCollapsed: store.sidebarCollapsed,
    mapCenter: store.mapCenter,
    mapZoom: store.mapZoom,
    lastFilters: {
      domains: store.filters.domains,
      levelMin: store.filters.levelMin,
      levelMax: store.filters.levelMax
    }
  });
}

/**
 * Initialise le store avec l'état persisté
 */
export async function initializeStore() {
  const persisted = await loadPersistedState();

  if (persisted) {
    batch(() => {
      store.theme = persisted.theme;
      store.favorites = new Set(persisted.favorites);
      store.personalNotes = new Map(Object.entries(persisted.personalNotes));
      store.sidebarCollapsed = persisted.sidebarCollapsed;
      store.mapCenter = persisted.mapCenter;
      store.mapZoom = persisted.mapZoom;

      if (persisted.lastFilters) {
        store.filters = { ...store.filters, ...persisted.lastFilters };
      }
    });

    applyTheme(store.theme);
  }

  // Écouter les changements de préférence système
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (store.theme === 'auto') {
      applyTheme('auto');
    }
  });
}

// Export pour debug
if (import.meta.env.DEV) {
  (window as any).__store = store;
}
