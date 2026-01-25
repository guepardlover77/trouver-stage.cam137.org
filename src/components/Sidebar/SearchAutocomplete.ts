// ============================================================================
// Composant SearchAutocomplete - Recherche avec suggestions
// ============================================================================

import { debounce } from '../../utils/helpers';
import { store, updateFilters } from '../../store';

export interface SearchSuggestion {
  type: 'location' | 'city' | 'type';
  value: string;
  label: string;
  sublabel?: string;
  index?: number;
}

let input: HTMLInputElement | null = null;
let dropdown: HTMLElement | null = null;
let suggestions: SearchSuggestion[] = [];
let selectedIndex = -1;
let isOpen = false;

/**
 * Crée le composant de recherche avec autocomplétion
 */
export function createSearchAutocomplete(container: HTMLElement): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'search-autocomplete';

  // Input de recherche
  input = document.createElement('input');
  input.type = 'text';
  input.className = 'search-input';
  input.placeholder = 'Rechercher par nom, ville, type...';
  input.setAttribute('aria-label', 'Rechercher par nom, ville ou type');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('role', 'combobox');

  // Icône de recherche
  const icon = document.createElement('span');
  icon.className = 'search-icon';
  icon.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  `;

  // Bouton effacer
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'search-clear';
  clearBtn.setAttribute('aria-label', 'Effacer la recherche');
  clearBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  `;
  clearBtn.style.display = 'none';

  // Dropdown de suggestions
  dropdown = document.createElement('div');
  dropdown.className = 'search-dropdown';
  dropdown.setAttribute('role', 'listbox');
  dropdown.setAttribute('aria-label', 'Suggestions');

  wrapper.appendChild(icon);
  wrapper.appendChild(input);
  wrapper.appendChild(clearBtn);
  wrapper.appendChild(dropdown);

  container.appendChild(wrapper);

  // Events
  const debouncedSearch = debounce(handleSearch, 150);

  input.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value;
    clearBtn.style.display = value ? 'flex' : 'none';
    debouncedSearch(value);
  });

  input.addEventListener('keydown', handleKeydown);
  input.addEventListener('focus', () => {
    if (suggestions.length > 0) {
      openDropdown();
    }
  });

  input.addEventListener('blur', () => {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => closeDropdown(), 150);
  });

  clearBtn.addEventListener('click', () => {
    if (input) {
      input.value = '';
      input.focus();
      clearBtn.style.display = 'none';
      closeDropdown();
      updateFilters({ search: '' });
    }
  });

  return wrapper;
}

/**
 * Gère la recherche
 */
function handleSearch(query: string): void {
  if (!query.trim()) {
    suggestions = [];
    closeDropdown();
    updateFilters({ search: '' });
    return;
  }

  // Mettre à jour le filtre
  updateFilters({ search: query });

  // Générer les suggestions
  suggestions = generateSuggestions(query);

  if (suggestions.length > 0) {
    renderSuggestions();
    openDropdown();
  } else {
    closeDropdown();
  }
}

/**
 * Génère les suggestions basées sur la requête
 */
function generateSuggestions(query: string): SearchSuggestion[] {
  const results: SearchSuggestion[] = [];
  const queryLower = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Recherche dans les lieux
  store.locations.forEach((loc, index) => {
    const nomNormalized = loc.nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (nomNormalized.includes(queryLower)) {
      results.push({
        type: 'location',
        value: loc.nom,
        label: loc.nom,
        sublabel: `${loc.ville} - ${loc.type}`,
        index
      });
    }
  });

  // Limiter les résultats de lieux
  const locationResults = results.slice(0, 5);

  // Recherche dans les villes (uniques) - priorité aux villes
  const cities = new Set<string>();
  store.locations.forEach(loc => {
    const villeNormalized = loc.ville.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (villeNormalized.includes(queryLower) && !cities.has(loc.ville)) {
      cities.add(loc.ville);
    }
  });

  const cityResults: SearchSuggestion[] = Array.from(cities).slice(0, 5).map(city => ({
    type: 'city',
    value: city,
    label: city,
    sublabel: 'Rechercher dans cette ville'
  }));

  // Recherche dans les types (uniques)
  const types = new Set<string>();
  store.locations.forEach(loc => {
    const typeNormalized = loc.type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (typeNormalized.includes(queryLower) && !types.has(loc.type)) {
      types.add(loc.type);
    }
  });

  const typeResults: SearchSuggestion[] = Array.from(types).slice(0, 3).map(type => ({
    type: 'type',
    value: type,
    label: type,
    sublabel: 'Type d\'établissement'
  }));

  return [...locationResults, ...cityResults, ...typeResults];
}

/**
 * Affiche les suggestions
 */
function renderSuggestions(): void {
  if (!dropdown) return;

  const groupedSuggestions = {
    location: suggestions.filter(s => s.type === 'location'),
    city: suggestions.filter(s => s.type === 'city'),
    type: suggestions.filter(s => s.type === 'type')
  };

  let html = '';

  if (groupedSuggestions.location.length > 0) {
    html += `<div class="search-group">
      <div class="search-group-label">Établissements</div>
      ${groupedSuggestions.location.map((s, i) =>
        createSuggestionHTML(s, i)
      ).join('')}
    </div>`;
  }

  if (groupedSuggestions.city.length > 0) {
    const offset = groupedSuggestions.location.length;
    html += `<div class="search-group">
      <div class="search-group-label">📍 Villes</div>
      ${groupedSuggestions.city.map((s, i) =>
        createSuggestionHTML(s, offset + i)
      ).join('')}
    </div>`;
  }

  if (groupedSuggestions.type.length > 0) {
    const offset = groupedSuggestions.location.length + groupedSuggestions.city.length;
    html += `<div class="search-group">
      <div class="search-group-label">Types</div>
      ${groupedSuggestions.type.map((s, i) =>
        createSuggestionHTML(s, offset + i)
      ).join('')}
    </div>`;
  }

  dropdown.innerHTML = html;

  // Events sur les suggestions
  dropdown.querySelectorAll('.search-suggestion').forEach((el, i) => {
    el.addEventListener('click', () => selectSuggestion(i));
    el.addEventListener('mouseenter', () => {
      selectedIndex = i;
      updateSelection();
    });
  });
}

function createSuggestionHTML(suggestion: SearchSuggestion, index: number): string {
  const icon = suggestion.type === 'location' ? 'map-pin' :
               suggestion.type === 'city' ? 'building' : 'tag';

  return `
    <div class="search-suggestion" role="option" data-index="${index}">
      <span class="search-suggestion-icon">${getIcon(icon)}</span>
      <div class="search-suggestion-content">
        <div class="search-suggestion-label">${escapeHtml(suggestion.label)}</div>
        ${suggestion.sublabel ? `<div class="search-suggestion-sublabel">${escapeHtml(suggestion.sublabel)}</div>` : ''}
      </div>
    </div>
  `;
}

function getIcon(name: string): string {
  const icons: Record<string, string> = {
    'map-pin': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    'building': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/></svg>`,
    'tag': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`
  };
  return icons[name] || '';
}

/**
 * Gère les touches clavier
 */
function handleKeydown(e: KeyboardEvent): void {
  if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    if (suggestions.length > 0) {
      openDropdown();
    }
    return;
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
      updateSelection();
      break;

    case 'ArrowUp':
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateSelection();
      break;

    case 'Enter':
      if (selectedIndex >= 0) {
        e.preventDefault();
        selectSuggestion(selectedIndex);
      }
      break;

    case 'Escape':
      closeDropdown();
      break;
  }
}

/**
 * Met à jour la sélection visuelle
 */
function updateSelection(): void {
  if (!dropdown) return;

  dropdown.querySelectorAll('.search-suggestion').forEach((el, i) => {
    el.classList.toggle('selected', i === selectedIndex);
    if (i === selectedIndex) {
      el.scrollIntoView({ block: 'nearest' });
    }
  });

  input?.setAttribute('aria-activedescendant',
    selectedIndex >= 0 ? `suggestion-${selectedIndex}` : ''
  );
}

/**
 * Sélectionne une suggestion
 */
function selectSuggestion(index: number): void {
  const suggestion = suggestions[index];
  if (!suggestion || !input) return;

  if (suggestion.type === 'location' && suggestion.index !== undefined) {
    // Sélectionner le lieu spécifique
    input.value = suggestion.value;
    updateFilters({ search: suggestion.value });
    // Dispatch un événement pour sélectionner le lieu sur la carte
    window.dispatchEvent(new CustomEvent('location-selected', {
      detail: { index: suggestion.index }
    }));
  } else if (suggestion.type === 'city') {
    // Filtrer par ville
    input.value = suggestion.value;
    updateFilters({ search: suggestion.value });
  } else if (suggestion.type === 'type') {
    // Ajouter le type aux filtres de domaines
    input.value = '';
    updateFilters({
      search: '',
      domains: [...store.filters.domains, suggestion.value]
    });
  }

  closeDropdown();
}

/**
 * Ouvre le dropdown
 */
function openDropdown(): void {
  if (!dropdown || !input) return;

  isOpen = true;
  selectedIndex = -1;
  dropdown.classList.add('open');
  input.setAttribute('aria-expanded', 'true');
}

/**
 * Ferme le dropdown
 */
function closeDropdown(): void {
  if (!dropdown || !input) return;

  isOpen = false;
  selectedIndex = -1;
  dropdown.classList.remove('open');
  input.setAttribute('aria-expanded', 'false');
}

/**
 * Définit la valeur de recherche
 */
export function setSearchValue(value: string): void {
  if (input) {
    input.value = value;
    const clearBtn = input.parentElement?.querySelector('.search-clear') as HTMLElement;
    if (clearBtn) {
      clearBtn.style.display = value ? 'flex' : 'none';
    }
  }
}

/**
 * Vide la recherche
 */
export function clearSearch(): void {
  if (input) {
    input.value = '';
    const clearBtn = input.parentElement?.querySelector('.search-clear') as HTMLElement;
    if (clearBtn) {
      clearBtn.style.display = 'none';
    }
    closeDropdown();
    updateFilters({ search: '' });
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
