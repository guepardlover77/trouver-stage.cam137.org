// ============================================================================
// Composant Map - Carte interactive Leaflet
// ============================================================================

import type { Location, MarkerOptions } from '../../types';
import {
  store,
  on,
  updateMapView,
  generateLocationId,
  toggleFavorite
} from '../../store';
import { haversineDistance, formatDistance } from '../../utils/distance';
import { debounce } from '../../utils/helpers';

// Variables du module (types any pour compatibilité CDN Leaflet)
let map: any = null;
let markersLayer: any = null;
let heatmapLayer: any = null;
let markers: Map<number, any> = new Map();
let userLocationMarker: any = null;

// Configuration des icônes
const MARKER_COLORS = {
  default: '#3b82f6',
  matching: '#ef4444',
  favorite: '#f59e0b',
  selected: '#10b981'
};

/**
 * Crée une icône de marqueur personnalisée
 */
function createMarkerIcon(options: MarkerOptions): any {
  const { color, isMatching, isFavorite, isSelected } = options;

  let iconColor = color || MARKER_COLORS.default;
  if (isSelected) iconColor = MARKER_COLORS.selected;
  else if (isFavorite) iconColor = MARKER_COLORS.favorite;
  else if (isMatching) iconColor = MARKER_COLORS.matching;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-pin" style="--marker-color: ${iconColor}">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        ${isFavorite ? '<span class="marker-star">★</span>' : ''}
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42]
  });
}

/**
 * Crée le contenu du popup
 */
function createPopupContent(location: Location, index: number): string {
  const id = generateLocationId(location);
  const isFav = store.favorites.has(id);
  const note = store.personalNotes.get(id);
  const userLoc = store.userLocation;

  let distanceInfo = '';
  if (userLoc && location.lat && location.lon) {
    const dist = haversineDistance(userLoc.lat, userLoc.lon, location.lat, location.lon);
    distanceInfo = `<p class="popup-distance">📍 ${formatDistance(dist)}</p>`;
  }

  return `
    <div class="popup-content" data-index="${index}">
      <div class="popup-header">
        <h3 class="popup-title">${location.nom}</h3>
        <button class="popup-fav-btn ${isFav ? 'active' : ''}"
                data-location-id="${id}"
                title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
          ${isFav ? '★' : '☆'}
        </button>
      </div>

      <div class="popup-body">
        <p class="popup-address">
          ${location.adresse}<br>
          ${location.codePostal} ${location.ville}
        </p>

        ${location.type ? `<p class="popup-type"><span class="tag">${location.type}</span></p>` : ''}
        ${location.niveau ? `<p class="popup-level">Niveau: ${location.niveau}</p>` : ''}
        ${distanceInfo}

        ${location.telephone ? `
          <p class="popup-phone">
            <a href="tel:${location.telephone.replace(/\s/g, '')}">${location.telephone}</a>
          </p>
        ` : ''}

        ${location.email ? `
          <p class="popup-email">
            <a href="mailto:${location.email}">${location.email}</a>
          </p>
        ` : ''}

        ${location.contact ? `<p class="popup-contact">Contact: ${location.contact}</p>` : ''}
        ${location.commentaire ? `<p class="popup-comment">${location.commentaire}</p>` : ''}
        ${note ? `<p class="popup-note"><strong>Note:</strong> ${note}</p>` : ''}
      </div>

      <div class="popup-actions">
        ${location.telephone ? `
          <a href="tel:${location.telephone.replace(/\s/g, '')}" class="popup-btn popup-btn-call">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Appeler
          </a>
        ` : ''}
        <button class="popup-btn popup-btn-directions"
                data-lat="${location.lat}"
                data-lon="${location.lon}"
                data-name="${encodeURIComponent(location.nom)}">
          🧭 Itinéraire
        </button>
      </div>
    </div>
  `;
}

/**
 * Initialise la carte
 */
export function initMap(container: HTMLElement): any {
  // Créer la carte
  map = L.map(container, {
    center: [store.mapCenter.lat, store.mapCenter.lon],
    zoom: store.mapZoom,
    zoomControl: true,
    attributionControl: true
  });

  // Ajouter le tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  // Créer le groupe de clusters avec configuration optimisée
  markersLayer = L.markerClusterGroup({
    // Performances
    chunkedLoading: true,
    chunkInterval: 200,
    chunkDelay: 50,
    removeOutsideVisibleBounds: true,
    animate: true,
    animateAddingMarkers: false,

    // Comportement
    maxClusterRadius: 60,
    spiderfyOnMaxZoom: true,
    spiderfyDistanceMultiplier: 1.5,
    showCoverageOnHover: true,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 18,

    // Icône personnalisée avec infos
    iconCreateFunction: (cluster: any) => {
      const count = cluster.getChildCount();
      const markers = cluster.getAllChildMarkers();

      // Calculer les stats du cluster
      let matchingCount = 0;
      let favoriteCount = 0;
      const types = new Set<string>();

      markers.forEach((marker: any) => {
        const clusterIndex = (window as any).__clusterMarkerIndex as Map<number, any> | undefined;
        const idx = Array.from(clusterIndex?.entries() || [])
          .find(([_, m]: [number, any]) => m === marker)?.[0];
        if (idx !== undefined) {
          const loc = store.locations[idx];
          if (loc) {
            types.add(loc.type);
            if (store.filteredIndices.includes(idx)) matchingCount++;
            if (store.favorites.has(generateLocationId(loc))) favoriteCount++;
          }
        }
      });

      // Déterminer la taille et couleur
      let sizeClass = 'small';
      let size = 40;
      if (count > 100) { sizeClass = 'xlarge'; size = 60; }
      else if (count > 50) { sizeClass = 'large'; size = 50; }
      else if (count > 20) { sizeClass = 'medium'; size = 45; }

      // Couleur basée sur le ratio de correspondance
      const matchRatio = count > 0 ? matchingCount / count : 0;
      let colorClass = 'default';
      if (matchRatio > 0.7) colorClass = 'hot';
      else if (matchRatio > 0.3) colorClass = 'warm';

      // Indicateur de favoris
      const favIndicator = favoriteCount > 0
        ? `<span class="cluster-fav">★${favoriteCount}</span>`
        : '';

      return L.divIcon({
        html: `
          <div class="cluster-marker cluster-${sizeClass} cluster-${colorClass}">
            <span class="cluster-count">${count}</span>
            ${favIndicator}
          </div>
        `,
        className: 'marker-cluster-custom',
        iconSize: L.point(size, size)
      });
    }
  });

  // Stocker la référence des marqueurs pour le cluster
  (window as any).__clusterMarkerIndex = markers;

  map.addLayer(markersLayer);

  // Événements des clusters
  markersLayer.on('clustermouseover', (e: any) => {
    const cluster = e.layer;
    const count = cluster.getChildCount();
    const markers = cluster.getAllChildMarkers();

    // Collecter les infos des lieux
    const cities = new Map<string, number>();
    const types = new Map<string, number>();
    let matchingCount = 0;

    markers.forEach((marker: any) => {
      const clusterIndex = (window as any).__clusterMarkerIndex as Map<number, any> | undefined;
      const idx = Array.from(clusterIndex?.entries() || [])
        .find(([_, m]: [number, any]) => m === marker)?.[0];
      if (idx !== undefined) {
        const loc = store.locations[idx];
        if (loc) {
          cities.set(loc.ville, (cities.get(loc.ville) || 0) + 1);
          types.set(loc.type, (types.get(loc.type) || 0) + 1);
          if (store.filteredIndices.includes(idx)) matchingCount++;
        }
      }
    });

    // Top 3 villes
    const topCities = Array.from(cities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([city, n]) => `${city} (${n})`)
      .join(', ');

    // Top 3 types
    const topTypes = Array.from(types.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, n]) => `${type} (${n})`)
      .join(', ');

    const tooltipContent = `
      <div class="cluster-tooltip">
        <strong>${count} établissements</strong>
        ${matchingCount > 0 ? `<br><span class="cluster-tooltip-match">✓ ${matchingCount} correspondent aux filtres</span>` : ''}
        <hr>
        <small><strong>Villes:</strong> ${topCities || 'N/A'}</small><br>
        <small><strong>Types:</strong> ${topTypes || 'N/A'}</small>
      </div>
    `;

    cluster.bindTooltip(tooltipContent, {
      direction: 'top',
      className: 'cluster-tooltip-container',
      offset: [0, -20]
    }).openTooltip();
  });

  markersLayer.on('clustermouseout', (e: any) => {
    e.layer.closeTooltip();
  });

  // Événements de la carte
  const debouncedMapMove = debounce(() => {
    if (map) {
      const center = map.getCenter();
      updateMapView({ lat: center.lat, lon: center.lng }, map.getZoom());
    }
  }, 300);

  map.on('moveend', debouncedMapMove);
  map.on('zoomend', debouncedMapMove);

  // Gestionnaire de clic sur les popups
  map.on('popupopen', (e: any) => {
    const popup = e.popup;
    const content = popup.getElement();
    if (!content) return;

    // Bouton favori
    content.querySelectorAll('.popup-fav-btn').forEach((btn: Element) => {
      btn.addEventListener('click', (event: Event) => {
        event.stopPropagation();
        const locationId = (btn as HTMLElement).dataset.locationId;
        if (locationId) {
          toggleFavorite(locationId);
          btn.classList.toggle('active');
          btn.textContent = btn.classList.contains('active') ? '★' : '☆';
        }
      });
    });

    // Bouton itinéraire
    content.querySelectorAll('.popup-btn-directions').forEach((btn: Element) => {
      btn.addEventListener('click', () => {
        const lat = (btn as HTMLElement).dataset.lat;
        const lon = (btn as HTMLElement).dataset.lon;
        const name = decodeURIComponent((btn as HTMLElement).dataset.name || '');
        if (lat && lon) {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&destination_place_id=${name}`;
          window.open(url, '_blank');
        }
      });
    });
  });

  // Écouter les événements du store
  setupStoreListeners();

  return map;
}

/**
 * Configure les écouteurs d'événements du store
 */
function setupStoreListeners(): void {
  // Données chargées
  on('DATA_LOADED', () => {
    refreshMarkers();
    fitToMarkers();
  });

  // Filtres changés
  on('FILTER_CHANGED', () => {
    updateMarkerStyles();
  });

  // Lieu sélectionné
  on('LOCATION_SELECTED', (event) => {
    const index = event.payload;
    if (index !== null) {
      focusOnMarker(index);
    }
  });

  // Favori basculé
  on('FAVORITE_TOGGLED', () => {
    updateMarkerStyles();
  });
}

/**
 * Rafraîchit tous les marqueurs
 */
export function refreshMarkers(): void {
  if (!markersLayer) return;

  markersLayer.clearLayers();
  markers.clear();

  const { locations, filteredIndices, favorites } = store;
  const filteredSet = new Set(filteredIndices);

  locations.forEach((location, index) => {
    if (location.lat === null || location.lon === null) return;

    const id = generateLocationId(location);
    const isMatching = filteredSet.has(index);
    const isFavorite = favorites.has(id);
    const isSelected = store.selectedLocationIndex === index;

    const icon = createMarkerIcon({
      color: MARKER_COLORS.default,
      isMatching,
      isFavorite,
      isSelected
    });

    const marker = L.marker([location.lat, location.lon], { icon });
    marker.bindPopup(() => createPopupContent(location, index), {
      maxWidth: 320,
      className: 'custom-popup'
    });

    marker.on('click', () => {
      window.dispatchEvent(new CustomEvent('location-selected', { detail: { index } }));
    });

    markers.set(index, marker);
    markersLayer!.addLayer(marker);
  });
}

/**
 * Met à jour le style des marqueurs sans les recréer
 */
function updateMarkerStyles(): void {
  const { filteredIndices, favorites, selectedLocationIndex, locations } = store;
  const filteredSet = new Set(filteredIndices);

  markers.forEach((marker, index) => {
    const location = locations[index];
    if (!location) return;

    const id = generateLocationId(location);
    const isMatching = filteredSet.has(index);
    const isFavorite = favorites.has(id);
    const isSelected = selectedLocationIndex === index;

    const icon = createMarkerIcon({
      color: MARKER_COLORS.default,
      isMatching,
      isFavorite,
      isSelected
    });

    marker.setIcon(icon);
  });
}

/**
 * Focus sur un marqueur spécifique
 */
export function focusOnMarker(index: number, options: { zoom?: number; openPopup?: boolean } = {}): void {
  const marker = markers.get(index);
  if (!marker || !map) return;

  const { zoom = 15, openPopup = true } = options;
  const latLng = marker.getLatLng();

  map.setView(latLng, zoom, { animate: true });

  if (openPopup) {
    // Attendre la fin de l'animation
    setTimeout(() => {
      marker.openPopup();
    }, 300);
  }

  // Mettre à jour le style
  updateMarkerStyles();
}

/**
 * Ajuste la vue pour afficher tous les marqueurs filtrés
 */
export function fitToMarkers(padding: number = 50): void {
  if (!map || !markersLayer) return;

  const { locations, filteredIndices } = store;
  const points: any[] = [];

  filteredIndices.forEach(index => {
    const location = locations[index];
    if (location.lat !== null && location.lon !== null) {
      points.push(L.latLng(location.lat, location.lon));
    }
  });

  if (points.length === 0) return;

  if (points.length === 1) {
    map.setView(points[0], 14);
  } else {
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [padding, padding] });
  }
}

/**
 * Active/désactive la heatmap
 */
export function toggleHeatmap(enabled: boolean): void {
  if (!map) return;

  if (enabled) {
    const { locations, filteredIndices } = store;
    const heatData: [number, number, number][] = [];

    filteredIndices.forEach(index => {
      const location = locations[index];
      if (location.lat !== null && location.lon !== null) {
        heatData.push([location.lat, location.lon, 1]);
      }
    });

    if (heatmapLayer) {
      map.removeLayer(heatmapLayer);
    }

    heatmapLayer = (L as any).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    }).addTo(map);
  } else if (heatmapLayer) {
    map.removeLayer(heatmapLayer);
    heatmapLayer = null;
  }
}

/**
 * Active/désactive le clustering
 */
export function toggleClustering(enabled: boolean): void {
  if (!map || !markersLayer) return;

  if (enabled) {
    markersLayer.enableClustering();
  } else {
    markersLayer.disableClustering();
  }
}

/**
 * Affiche la position de l'utilisateur
 */
export function showUserLocation(lat: number, lon: number): void {
  if (!map) return;

  if (userLocationMarker) {
    map.removeLayer(userLocationMarker);
  }

  const icon = L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="user-location-pulse"></div>
      <div class="user-location-dot"></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  userLocationMarker = L.marker([lat, lon], { icon }).addTo(map);
  userLocationMarker.bindPopup('Votre position');
}

/**
 * Centre la carte sur la position de l'utilisateur
 */
export function centerOnUserLocation(): void {
  if (!map || !store.userLocation) return;
  map.setView([store.userLocation.lat, store.userLocation.lon], 14, { animate: true });
}

/**
 * Retourne l'instance de la carte
 */
export function getMap(): any {
  return map;
}

/**
 * Invalide la taille de la carte (à appeler après redimensionnement)
 */
export function invalidateSize(): void {
  if (map) {
    setTimeout(() => map!.invalidateSize(), 100);
  }
}

/**
 * Détruit la carte
 */
export function destroyMap(): void {
  if (map) {
    map.remove();
    map = null;
  }
  markersLayer = null;
  heatmapLayer = null;
  markers.clear();
  userLocationMarker = null;
}
