// ============================================================================
// Types principaux de l'application Carte des Lieux de Stage
// ============================================================================

/**
 * Représente un lieu de stage
 */
export interface Location {
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  type: string;
  niveau: string;
  telephone: string;
  contact: string;
  email: string;
  commentaire: string;
  lat: number | null;
  lon: number | null;
}

/**
 * Location avec ID interne pour le tracking
 */
export interface LocationWithId extends Location {
  id: string;
}

/**
 * Filtres actifs de l'application
 */
export interface Filters {
  search: string;
  domains: string[];
  levelMin: number;
  levelMax: number;
  distanceKm: number | null;
  referencePoint: { lat: number; lon: number } | null;
  favoritesOnly: boolean;
}

/**
 * Options de tri
 */
export interface SortOptions {
  field: 'nom' | 'ville' | 'niveau' | 'distance' | 'type';
  direction: 'asc' | 'desc';
}

/**
 * Thème de l'application
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Mode de vue
 */
export type ViewMode = 'map' | 'list' | 'split';

/**
 * État global de l'application
 */
export interface AppState {
  // Données
  locations: Location[];
  filteredIndices: number[];
  searchIndex: Map<number, string>;

  // UI State
  isLoading: boolean;
  theme: Theme;
  viewMode: ViewMode;
  sidebarCollapsed: boolean;
  detailPanelOpen: boolean;
  selectedLocationIndex: number | null;

  // Filtres
  filters: Filters;
  sortOptions: SortOptions;

  // Fonctionnalités
  favorites: Set<string>;
  compareList: string[];
  personalNotes: Map<string, string>;

  // Carte
  mapCenter: { lat: number; lon: number };
  mapZoom: number;
  heatmapEnabled: boolean;
  clusteringEnabled: boolean;
  userLocation: { lat: number; lon: number } | null;

  // Stats
  uniqueTypes: string[];
  uniqueCities: string[];
}

/**
 * Configuration d'un toast
 */
export interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

/**
 * Toast actif
 */
export interface Toast extends ToastConfig {
  id: string;
  createdAt: number;
}

/**
 * Résultat de géocodage
 */
export interface GeocodingResult {
  lat: number;
  lon: number;
  confidence: number;
  source: 'ban' | 'nominatim';
  label?: string;
}

/**
 * Résultat de recherche INSEE
 */
export interface INSEEResult {
  siret: string;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  activitePrincipale: string;
  type: string;
  lat?: number;
  lon?: number;
}

/**
 * Options d'export
 */
export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf' | 'xlsx';
  includeAll: boolean;
  fields?: (keyof Location)[];
}

/**
 * Statistiques du dashboard
 */
export interface Statistics {
  totalLocations: number;
  totalCities: number;
  totalGeolocated: number;
  percentGeolocated: number;
  byType: { type: string; count: number }[];
  byLevel: { level: string; count: number }[];
  topCities: { city: string; count: number }[];
  byDepartment: { dept: string; count: number }[];
}

/**
 * Options de la liste virtuelle
 */
export interface VirtualListOptions {
  itemHeight: number;
  overscan: number;
  containerHeight: number;
}

/**
 * État d'un élément de liste virtuelle
 */
export interface VirtualListState {
  startIndex: number;
  endIndex: number;
  offsetY: number;
  visibleItems: number[];
}

/**
 * Configuration du panneau de détail
 */
export interface DetailPanelConfig {
  showNotes: boolean;
  showQRCode: boolean;
  showExport: boolean;
  showCompare: boolean;
}

/**
 * Événements de l'application
 */
export type AppEvent =
  | { type: 'FILTER_CHANGED'; payload: Partial<Filters> }
  | { type: 'SORT_CHANGED'; payload: SortOptions }
  | { type: 'LOCATION_SELECTED'; payload: number | null }
  | { type: 'THEME_CHANGED'; payload: Theme }
  | { type: 'FAVORITE_TOGGLED'; payload: string }
  | { type: 'COMPARE_TOGGLED'; payload: string }
  | { type: 'NOTE_UPDATED'; payload: { id: string; note: string } }
  | { type: 'DATA_LOADED'; payload: Location[] }
  | { type: 'MAP_MOVED'; payload: { center: { lat: number; lon: number }; zoom: number } };

/**
 * Listener d'événement
 */
export type EventListener<T extends AppEvent['type']> = (
  event: Extract<AppEvent, { type: T }>
) => void;

/**
 * Options de marqueur carte
 */
export interface MarkerOptions {
  color: string;
  isMatching: boolean;
  isFavorite: boolean;
  isSelected: boolean;
}

/**
 * Bounds de la carte
 */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Zone dessinée pour filtrage
 */
export type DrawnZone =
  | { type: 'circle'; center: { lat: number; lon: number }; radius: number }
  | { type: 'rectangle'; bounds: MapBounds }
  | { type: 'polygon'; points: { lat: number; lon: number }[] };

/**
 * Configuration de persistance
 */
export interface PersistenceConfig {
  key: string;
  storage: 'localStorage' | 'indexedDB';
  version: number;
}

/**
 * État persisté
 */
export interface PersistedState {
  theme: Theme;
  favorites: string[];
  personalNotes: Record<string, string>;
  sidebarCollapsed: boolean;
  mapCenter: { lat: number; lon: number };
  mapZoom: number;
  lastFilters: Partial<Filters>;
}
