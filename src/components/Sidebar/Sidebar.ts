// ============================================================================
// Composant Sidebar - Barre latérale rétractable
// ============================================================================

import { store, toggleSidebar, on } from '../../store';
import { createSearchAutocomplete } from './SearchAutocomplete';
import { createFilters } from './Filters';
import { createResultsList } from './ResultsList';

let sidebar: HTMLElement | null = null;
let toggleBtn: HTMLButtonElement | null = null;

/**
 * Crée la sidebar complète
 */
export function createSidebar(container: HTMLElement): HTMLElement {
  sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.setAttribute('role', 'complementary');
  sidebar.setAttribute('aria-label', 'Filtres et résultats');

  // Bouton toggle
  toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'sidebar-toggle';
  toggleBtn.setAttribute('aria-label', 'Réduire la barre latérale');
  toggleBtn.setAttribute('aria-expanded', 'true');
  toggleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  `;

  // Header
  const header = document.createElement('div');
  header.className = 'sidebar-header';
  header.innerHTML = `
    <h2 class="sidebar-title">Recherche</h2>
    <div class="sidebar-actions">
      <button type="button" class="btn-icon btn-collapse-all" aria-label="Réduire tout" title="Réduire tout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      </button>
    </div>
  `;

  // Contenu
  const content = document.createElement('div');
  content.className = 'sidebar-content';

  // Section recherche
  const searchSection = document.createElement('section');
  searchSection.className = 'sidebar-section search-section';
  createSearchAutocomplete(searchSection);

  // Section filtres
  const filtersSection = document.createElement('section');
  filtersSection.className = 'sidebar-section filters-section';
  filtersSection.innerHTML = `
    <button type="button" class="section-toggle" aria-expanded="true">
      <span class="section-title">Filtres</span>
      <svg class="section-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
    <div class="section-content"></div>
  `;
  const filtersContent = filtersSection.querySelector('.section-content') as HTMLElement;
  createFilters(filtersContent);

  // Section résultats
  const resultsSection = document.createElement('section');
  resultsSection.className = 'sidebar-section results-section';
  resultsSection.innerHTML = `
    <div class="results-header">
      <span class="results-count" aria-live="polite"></span>
      <div class="results-actions">
        <button type="button" class="btn-icon btn-export" aria-label="Exporter" title="Exporter les résultats">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="results-list-container"></div>
  `;
  const resultsContainer = resultsSection.querySelector('.results-list-container') as HTMLElement;
  createResultsList(resultsContainer);

  // Assembler
  content.appendChild(searchSection);
  content.appendChild(filtersSection);
  content.appendChild(resultsSection);

  sidebar.appendChild(toggleBtn);
  sidebar.appendChild(header);
  sidebar.appendChild(content);

  container.appendChild(sidebar);

  // Events
  setupEvents();

  // État initial
  updateSidebarState();

  return sidebar;
}

/**
 * Configure les événements
 */
function setupEvents(): void {
  // Toggle sidebar
  toggleBtn?.addEventListener('click', () => {
    toggleSidebar();
    updateSidebarState();
  });

  // Toggle sections
  sidebar?.querySelectorAll('.section-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const section = toggle.closest('.sidebar-section');
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isExpanded));
      section?.classList.toggle('collapsed', isExpanded);
    });
  });

  // Collapse all
  sidebar?.querySelector('.btn-collapse-all')?.addEventListener('click', () => {
    sidebar?.querySelectorAll('.section-toggle').forEach(toggle => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.closest('.sidebar-section')?.classList.add('collapsed');
    });
  });

  // Export button
  sidebar?.querySelector('.btn-export')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-export-modal'));
  });

  // Écouter les changements de store
  on('FILTER_CHANGED', updateResultsCount);
  on('DATA_LOADED', updateResultsCount);

  // Responsive: fermer sidebar sur mobile après sélection
  window.addEventListener('location-selected', () => {
    if (window.innerWidth < 768 && !store.sidebarCollapsed) {
      toggleSidebar();
      updateSidebarState();
    }
  });

  // Raccourci clavier pour toggle sidebar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      toggleSidebar();
      updateSidebarState();
    }
  });
}

/**
 * Met à jour l'état visuel de la sidebar
 */
function updateSidebarState(): void {
  if (!sidebar || !toggleBtn) return;

  const isCollapsed = store.sidebarCollapsed;
  sidebar.classList.toggle('collapsed', isCollapsed);
  toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
  toggleBtn.setAttribute('aria-label',
    isCollapsed ? 'Étendre la barre latérale' : 'Réduire la barre latérale'
  );

  // Notifier le reste de l'application
  window.dispatchEvent(new CustomEvent('sidebar-toggle', {
    detail: { collapsed: isCollapsed }
  }));
}

/**
 * Met à jour le compteur de résultats
 */
function updateResultsCount(): void {
  const countEl = sidebar?.querySelector('.results-count');
  if (!countEl) return;

  const total = store.locations.length;
  const filtered = store.filteredIndices.length;

  if (filtered === total) {
    countEl.textContent = `${total} lieu${total > 1 ? 'x' : ''}`;
  } else {
    countEl.textContent = `${filtered} / ${total} lieu${filtered > 1 ? 'x' : ''}`;
  }
}

/**
 * Retourne l'état de la sidebar
 */
export function isSidebarCollapsed(): boolean {
  return store.sidebarCollapsed;
}

/**
 * Force l'ouverture de la sidebar
 */
export function openSidebar(): void {
  if (store.sidebarCollapsed) {
    toggleSidebar();
    updateSidebarState();
  }
}

/**
 * Force la fermeture de la sidebar
 */
export function closeSidebar(): void {
  if (!store.sidebarCollapsed) {
    toggleSidebar();
    updateSidebarState();
  }
}

/**
 * Scroll vers un résultat spécifique
 */
export function scrollToResult(index: number): void {
  const resultsContainer = sidebar?.querySelector('.results-list-container');
  const item = resultsContainer?.querySelector(`[data-index="${index}"]`);
  if (item) {
    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    item.classList.add('highlight');
    setTimeout(() => item.classList.remove('highlight'), 2000);
  }
}
