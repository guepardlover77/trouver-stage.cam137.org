// ============================================================================
// Composant ResultsList - Liste des résultats avec favoris
// ============================================================================

import { store, toggleFavorite, selectLocation, generateLocationId, on } from '../../store';
import { createVirtualList, VirtualList } from '../../utils/virtualList';
import type { Location } from '../../types';
import { formatDistance, haversineDistance } from '../../utils/distance';

let container: HTMLElement | null = null;
let virtualList: VirtualList | null = null;
const ITEM_HEIGHT = 100; // Hauteur approximative d'un item

/**
 * Crée la liste des résultats
 */
export function createResultsList(parentContainer: HTMLElement): HTMLElement {
  container = document.createElement('div');
  container.className = 'results-list';
  container.setAttribute('role', 'list');
  container.setAttribute('aria-label', 'Liste des établissements');

  parentContainer.appendChild(container);

  // Écouter les changements
  on('FILTER_CHANGED', refreshList);
  on('SORT_CHANGED', refreshList);
  on('DATA_LOADED', initVirtualList);
  on('FAVORITE_TOGGLED', refreshList);

  // Délégation d'événements
  container.addEventListener('click', handleClick);

  return container;
}

/**
 * Initialise la liste virtuelle
 */
function initVirtualList(): void {
  if (!container) return;

  if (virtualList) {
    virtualList.destroy();
  }

  virtualList = createVirtualList({
    container,
    itemHeight: ITEM_HEIGHT,
    totalItems: store.filteredIndices.length,
    overscan: 5,
    renderItem: renderResultItem
  });
}

/**
 * Rafraîchit la liste
 */
function refreshList(): void {
  if (virtualList) {
    virtualList.setTotalItems(store.filteredIndices.length);
    virtualList.refresh();
  } else {
    initVirtualList();
  }
}

/**
 * Rend un item de résultat
 */
function renderResultItem(virtualIndex: number): HTMLElement {
  const locationIndex = store.filteredIndices[virtualIndex];
  const location = store.locations[locationIndex];
  const locationId = generateLocationId(location);
  const isFavorite = store.favorites.has(locationId);
  const isSelected = store.selectedLocationIndex === locationIndex;

  const item = document.createElement('article');
  item.className = `result-item ${isSelected ? 'selected' : ''} ${isFavorite ? 'favorite' : ''}`;
  item.setAttribute('role', 'listitem');
  item.setAttribute('tabindex', '0');
  item.dataset.index = String(locationIndex);
  item.dataset.id = locationId;

  // Niveau avec couleur
  const levelColor = getLevelColor(location.niveau);

  // Distance si position utilisateur disponible
  let distanceHtml = '';
  if (store.userLocation && location.lat && location.lon) {
    const dist = haversineDistance(
      store.userLocation.lat, store.userLocation.lon,
      location.lat, location.lon
    );
    distanceHtml = `<span class="result-distance">${formatDistance(dist)}</span>`;
  }

  item.innerHTML = `
    <div class="result-header">
      <h3 class="result-name">${escapeHtml(location.nom)}</h3>
      <button type="button"
              class="btn-favorite ${isFavorite ? 'active' : ''}"
              aria-label="${isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}"
              aria-pressed="${isFavorite}">
        <svg viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
    </div>
    <div class="result-address">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      <span>${escapeHtml(location.adresse)}, ${location.codePostal} ${escapeHtml(location.ville)}</span>
    </div>
    <div class="result-meta">
      <span class="result-type">${escapeHtml(location.type)}</span>
      ${location.niveau ? `<span class="result-level" style="--level-color: ${levelColor}">Niveau ${location.niveau}</span>` : ''}
      ${distanceHtml}
    </div>
    <div class="result-actions">
      <button type="button" class="btn-action btn-detail" title="Voir les détails">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </button>
      <button type="button" class="btn-action btn-locate" title="Localiser sur la carte">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
      ${location.telephone ? `
        <a href="tel:${location.telephone}" class="btn-action btn-call" title="Appeler">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </a>
      ` : ''}
    </div>
  `;

  return item;
}

/**
 * Gère les clics sur la liste
 */
function handleClick(e: Event): void {
  const target = e.target as HTMLElement;
  const item = target.closest('.result-item') as HTMLElement;
  if (!item) return;

  const index = parseInt(item.dataset.index || '-1', 10);
  const locationId = item.dataset.id || '';

  // Clic sur favori
  if (target.closest('.btn-favorite')) {
    e.stopPropagation();
    toggleFavorite(locationId);
    return;
  }

  // Clic sur détail
  if (target.closest('.btn-detail')) {
    e.stopPropagation();
    selectLocation(index);
    window.dispatchEvent(new CustomEvent('open-detail-panel', { detail: { index } }));
    return;
  }

  // Clic sur localiser
  if (target.closest('.btn-locate')) {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('locate-on-map', { detail: { index } }));
    return;
  }

  // Clic sur appel (laisser le lien gérer)
  if (target.closest('.btn-call')) {
    return;
  }

  // Clic sur l'item entier
  selectLocation(index);
  window.dispatchEvent(new CustomEvent('location-selected', { detail: { index } }));
}

/**
 * Retourne une couleur selon le niveau
 */
function getLevelColor(niveau: string): string {
  if (!niveau) return '#94a3b8';

  const match = niveau.match(/(\d)/);
  if (!match) return '#94a3b8';

  const level = parseInt(match[1], 10);

  // Gradient de vert (facile) à violet (difficile)
  const colors = [
    '#22c55e', // 1 - vert
    '#84cc16', // 2 - lime
    '#eab308', // 3 - jaune
    '#f97316', // 4 - orange
    '#8b5cf6'  // 5 - violet
  ];

  return colors[level - 1] || '#94a3b8';
}

/**
 * Scroll vers un index dans la liste
 */
export function scrollToResultIndex(locationIndex: number): void {
  const virtualIndex = store.filteredIndices.indexOf(locationIndex);
  if (virtualIndex >= 0 && virtualList) {
    virtualList.scrollToIndex(virtualIndex, 'center');
  }
}

/**
 * Met en surbrillance un résultat
 */
export function highlightResult(locationIndex: number): void {
  const item = container?.querySelector(`[data-index="${locationIndex}"]`);
  if (item) {
    // Retirer la surbrillance précédente
    container?.querySelectorAll('.result-item.highlighted').forEach(el => {
      el.classList.remove('highlighted');
    });

    item.classList.add('highlighted');

    // Retirer après animation
    setTimeout(() => {
      item.classList.remove('highlighted');
    }, 2000);
  }
}

function escapeHtml(text: string): string {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
