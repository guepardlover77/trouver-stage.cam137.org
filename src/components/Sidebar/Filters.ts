// ============================================================================
// Composant Filters - Filtres multi-select et niveau
// ============================================================================

import { store, updateFilters, updateSort } from '../../store';
import type { SortOptions } from '../../types';

let container: HTMLElement | null = null;
let domainDropdown: HTMLElement | null = null;
let isDomainDropdownOpen = false;

/**
 * Crée le composant de filtres
 */
export function createFilters(parentContainer: HTMLElement): HTMLElement {
  container = document.createElement('div');
  container.className = 'filters';

  container.innerHTML = `
    <div class="filter-section">
      <label class="filter-label">Domaine d'activité</label>
      <div class="domain-filter-wrapper">
        <button type="button" class="domain-filter-toggle" aria-haspopup="listbox" aria-expanded="false">
          <span class="domain-filter-text">Tous les domaines</span>
          <svg class="domain-filter-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="domain-filter-dropdown" role="listbox" aria-multiselectable="true"></div>
      </div>
    </div>

    <div class="filter-section">
      <label class="filter-label">
        Niveau de stage
        <span class="level-display">1 - 5</span>
      </label>
      <div class="level-slider-container">
        <input type="range" class="level-slider level-min" min="1" max="5" value="1" step="1" aria-label="Niveau minimum">
        <input type="range" class="level-slider level-max" min="1" max="5" value="5" step="1" aria-label="Niveau maximum">
        <div class="level-track">
          <div class="level-track-fill"></div>
        </div>
        <div class="level-marks">
          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
        </div>
      </div>
    </div>

    <div class="filter-section">
      <label class="filter-label">Trier par</label>
      <div class="sort-controls">
        <select class="sort-select" aria-label="Champ de tri">
          <option value="nom">Nom</option>
          <option value="ville">Ville</option>
          <option value="niveau">Niveau</option>
          <option value="type">Type</option>
          <option value="distance">Distance</option>
        </select>
        <button type="button" class="sort-direction" aria-label="Inverser l'ordre" title="Ordre croissant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12l7-7 7 7"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="filter-section">
      <label class="filter-checkbox-wrapper">
        <input type="checkbox" class="filter-checkbox favorites-only">
        <span class="filter-checkbox-custom"></span>
        <span>Favoris uniquement</span>
      </label>
    </div>

    <div class="filter-actions">
      <button type="button" class="btn btn-secondary btn-reset-filters">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M6 6l.7-2.8A2 2 0 0 1 8.6 2h6.8a2 2 0 0 1 1.9 1.2L18 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
        </svg>
        Réinitialiser
      </button>
    </div>

    <div class="filters-summary" aria-live="polite"></div>
  `;

  parentContainer.appendChild(container);

  // Initialiser le dropdown des domaines
  domainDropdown = container.querySelector('.domain-filter-dropdown');
  populateDomainDropdown();

  // Event listeners
  setupEventListeners();

  return container;
}

/**
 * Remplit le dropdown des domaines
 */
function populateDomainDropdown(): void {
  if (!domainDropdown) return;

  const types = store.uniqueTypes;

  domainDropdown.innerHTML = `
    <div class="domain-filter-search">
      <input type="text" placeholder="Filtrer..." class="domain-search-input" aria-label="Filtrer les domaines">
    </div>
    <div class="domain-filter-options">
      ${types.map(type => `
        <label class="domain-option" data-value="${escapeHtml(type)}">
          <input type="checkbox" value="${escapeHtml(type)}" ${store.filters.domains.includes(type) ? 'checked' : ''}>
          <span class="domain-checkbox"></span>
          <span class="domain-label">${escapeHtml(type)}</span>
          <span class="domain-count">${countByType(type)}</span>
        </label>
      `).join('')}
    </div>
    <div class="domain-filter-actions">
      <button type="button" class="btn-link domain-select-all">Tout sélectionner</button>
      <button type="button" class="btn-link domain-clear-all">Tout effacer</button>
    </div>
  `;

  // Event: recherche dans les domaines
  const searchInput = domainDropdown.querySelector('.domain-search-input') as HTMLInputElement;
  searchInput?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase();
    domainDropdown?.querySelectorAll('.domain-option').forEach(option => {
      const label = option.querySelector('.domain-label')?.textContent?.toLowerCase() || '';
      (option as HTMLElement).style.display = label.includes(query) ? '' : 'none';
    });
  });

  // Event: changement de checkbox
  domainDropdown.querySelectorAll('.domain-option input').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const selectedDomains = getSelectedDomains();
      updateFilters({ domains: selectedDomains });
      updateDomainToggleText();
      updateFiltersSummary();
    });
  });

  // Event: tout sélectionner
  domainDropdown.querySelector('.domain-select-all')?.addEventListener('click', () => {
    domainDropdown?.querySelectorAll('.domain-option input').forEach(checkbox => {
      (checkbox as HTMLInputElement).checked = true;
    });
    updateFilters({ domains: types });
    updateDomainToggleText();
    updateFiltersSummary();
  });

  // Event: tout effacer
  domainDropdown.querySelector('.domain-clear-all')?.addEventListener('click', () => {
    domainDropdown?.querySelectorAll('.domain-option input').forEach(checkbox => {
      (checkbox as HTMLInputElement).checked = false;
    });
    updateFilters({ domains: [] });
    updateDomainToggleText();
    updateFiltersSummary();
  });
}

/**
 * Compte les lieux par type
 */
function countByType(type: string): number {
  return store.locations.filter(loc => loc.type === type).length;
}

/**
 * Récupère les domaines sélectionnés
 */
function getSelectedDomains(): string[] {
  const selected: string[] = [];
  domainDropdown?.querySelectorAll('.domain-option input:checked').forEach(checkbox => {
    selected.push((checkbox as HTMLInputElement).value);
  });
  return selected;
}

/**
 * Met à jour le texte du toggle domaine
 */
function updateDomainToggleText(): void {
  const toggle = container?.querySelector('.domain-filter-text');
  if (!toggle) return;

  const selected = store.filters.domains;
  if (selected.length === 0) {
    toggle.textContent = 'Tous les domaines';
  } else if (selected.length === 1) {
    toggle.textContent = selected[0];
  } else {
    toggle.textContent = `${selected.length} domaines`;
  }
}

/**
 * Configure les event listeners
 */
function setupEventListeners(): void {
  if (!container) return;

  // Toggle dropdown domaines
  const domainToggle = container.querySelector('.domain-filter-toggle');
  domainToggle?.addEventListener('click', toggleDomainDropdown);

  // Fermer au clic extérieur
  document.addEventListener('click', (e) => {
    const wrapper = container?.querySelector('.domain-filter-wrapper');
    if (isDomainDropdownOpen && wrapper && !wrapper.contains(e.target as Node)) {
      closeDomainDropdown();
    }
  });

  // Sliders de niveau
  const levelMin = container.querySelector('.level-min') as HTMLInputElement;
  const levelMax = container.querySelector('.level-max') as HTMLInputElement;

  levelMin?.addEventListener('input', () => {
    const min = parseInt(levelMin.value);
    const max = parseInt(levelMax.value);
    if (min > max) {
      levelMax.value = levelMin.value;
    }
    updateLevelDisplay();
    updateFilters({ levelMin: min, levelMax: Math.max(min, max) });
    updateFiltersSummary();
  });

  levelMax?.addEventListener('input', () => {
    const min = parseInt(levelMin.value);
    const max = parseInt(levelMax.value);
    if (max < min) {
      levelMin.value = levelMax.value;
    }
    updateLevelDisplay();
    updateFilters({ levelMin: Math.min(min, max), levelMax: max });
    updateFiltersSummary();
  });

  // Tri
  const sortSelect = container.querySelector('.sort-select') as HTMLSelectElement;
  const sortDirection = container.querySelector('.sort-direction') as HTMLButtonElement;

  sortSelect?.addEventListener('change', () => {
    updateSort({
      field: sortSelect.value as SortOptions['field'],
      direction: store.sortOptions.direction
    });
  });

  sortDirection?.addEventListener('click', () => {
    const newDirection = store.sortOptions.direction === 'asc' ? 'desc' : 'asc';
    updateSort({ ...store.sortOptions, direction: newDirection });
    updateSortDirectionButton();
  });

  // Favoris uniquement
  const favoritesCheckbox = container.querySelector('.favorites-only') as HTMLInputElement;
  favoritesCheckbox?.addEventListener('change', () => {
    updateFilters({ favoritesOnly: favoritesCheckbox.checked });
    updateFiltersSummary();
  });

  // Reset
  const resetBtn = container.querySelector('.btn-reset-filters');
  resetBtn?.addEventListener('click', resetFilters);
}

/**
 * Toggle le dropdown domaines
 */
function toggleDomainDropdown(): void {
  if (isDomainDropdownOpen) {
    closeDomainDropdown();
  } else {
    openDomainDropdown();
  }
}

function openDomainDropdown(): void {
  isDomainDropdownOpen = true;
  domainDropdown?.classList.add('open');
  container?.querySelector('.domain-filter-toggle')?.setAttribute('aria-expanded', 'true');

  // Focus sur la recherche
  const searchInput = domainDropdown?.querySelector('.domain-search-input') as HTMLInputElement;
  searchInput?.focus();
}

function closeDomainDropdown(): void {
  isDomainDropdownOpen = false;
  domainDropdown?.classList.remove('open');
  container?.querySelector('.domain-filter-toggle')?.setAttribute('aria-expanded', 'false');
}

/**
 * Met à jour l'affichage du niveau
 */
function updateLevelDisplay(): void {
  const levelMin = container?.querySelector('.level-min') as HTMLInputElement;
  const levelMax = container?.querySelector('.level-max') as HTMLInputElement;
  const display = container?.querySelector('.level-display');
  const fill = container?.querySelector('.level-track-fill') as HTMLElement;

  if (!levelMin || !levelMax || !display) return;

  const min = parseInt(levelMin.value);
  const max = parseInt(levelMax.value);

  display.textContent = min === max ? String(min) : `${min} - ${max}`;

  // Mettre à jour la barre de remplissage
  if (fill) {
    const left = ((min - 1) / 4) * 100;
    const right = 100 - ((max - 1) / 4) * 100;
    fill.style.left = `${left}%`;
    fill.style.right = `${right}%`;
  }
}

/**
 * Met à jour le bouton de direction du tri
 */
function updateSortDirectionButton(): void {
  const btn = container?.querySelector('.sort-direction') as HTMLButtonElement;
  if (!btn) return;

  const isAsc = store.sortOptions.direction === 'asc';
  btn.innerHTML = isAsc
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7-7 7 7"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7 7 7-7"/></svg>`;
  btn.title = isAsc ? 'Ordre croissant' : 'Ordre décroissant';
}

/**
 * Met à jour le résumé des filtres
 */
function updateFiltersSummary(): void {
  const summary = container?.querySelector('.filters-summary');
  if (!summary) return;

  const parts: string[] = [];

  if (store.filters.domains.length > 0) {
    parts.push(`${store.filters.domains.length} domaine(s)`);
  }

  if (store.filters.levelMin > 1 || store.filters.levelMax < 5) {
    parts.push(`Niveau ${store.filters.levelMin}-${store.filters.levelMax}`);
  }

  if (store.filters.favoritesOnly) {
    parts.push('Favoris');
  }

  if (store.filters.search) {
    parts.push(`"${store.filters.search}"`);
  }

  if (parts.length > 0) {
    summary.innerHTML = `<span class="filters-active">Filtres actifs: ${parts.join(', ')}</span>`;
  } else {
    summary.innerHTML = '';
  }
}

/**
 * Réinitialise tous les filtres
 */
function resetFilters(): void {
  // Reset domaines
  domainDropdown?.querySelectorAll('.domain-option input').forEach(checkbox => {
    (checkbox as HTMLInputElement).checked = false;
  });

  // Reset niveau
  const levelMin = container?.querySelector('.level-min') as HTMLInputElement;
  const levelMax = container?.querySelector('.level-max') as HTMLInputElement;
  if (levelMin) levelMin.value = '1';
  if (levelMax) levelMax.value = '5';
  updateLevelDisplay();

  // Reset favoris
  const favoritesCheckbox = container?.querySelector('.favorites-only') as HTMLInputElement;
  if (favoritesCheckbox) favoritesCheckbox.checked = false;

  // Reset tri
  const sortSelect = container?.querySelector('.sort-select') as HTMLSelectElement;
  if (sortSelect) sortSelect.value = 'nom';

  // Appliquer
  updateFilters({
    search: '',
    domains: [],
    levelMin: 1,
    levelMax: 5,
    favoritesOnly: false
  });

  updateSort({ field: 'nom', direction: 'asc' });
  updateDomainToggleText();
  updateSortDirectionButton();
  updateFiltersSummary();
}

/**
 * Rafraîchit les types disponibles
 */
export function refreshTypes(): void {
  populateDomainDropdown();
  updateDomainToggleText();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
