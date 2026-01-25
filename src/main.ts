// ============================================================================
// Point d'entrée principal de l'application - Carte des Lieux de Stage
// ============================================================================

import { store, initializeStore, setLocations, on, updateFilters } from './store';
import { loadData } from './services/data.service';
import { createThemeToggle, initTheme } from './components/UI/ThemeToggle';
import { showToast, initToastContainer } from './components/UI/Toast';
import { initMap, refreshMarkers, fitToMarkers, invalidateSize, toggleHeatmap, focusOnMarker } from './components/Map/Map';
import { openAdminPanel } from './components/Admin';

// Import des styles
import './styles/main.css';

// ============================================================================
// Initialisation de l'application
// ============================================================================

async function initApp(): Promise<void> {
  console.log('🚀 Initialisation de l\'application...');

  try {
    // Initialiser le conteneur de toasts
    initToastContainer();

    // Initialiser le store avec l'état persisté
    await initializeStore();

    // Initialiser le thème
    initTheme();

    // Créer la structure de l'application
    createAppLayout();

    // Charger les données
    await loadDataAndInitialize();

    // Configurer les événements globaux
    setupGlobalEvents();

    // Masquer l'overlay de chargement
    hideLoadingOverlay();

    console.log('✅ Application initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    showToast({
      message: 'Erreur lors du chargement de l\'application',
      type: 'error',
      duration: 5000
    });
    hideLoadingOverlay();
  }
}

/**
 * Crée la structure de l'application
 */
function createAppLayout(): void {
  const container = document.querySelector('.container');
  if (!container) {
    console.error('Container principal non trouvé');
    return;
  }

  // Nettoyer le container existant (legacy)
  const existingSidebar = container.querySelector('.sidebar');
  if (existingSidebar) {
    // Garder la structure existante pour la compatibilité
    // Le composant Sidebar moderne sera intégré progressivement
  }

  // Créer le toggle de thème dans le header
  const headerRight = document.querySelector('.header-right');
  if (headerRight) {
    const themeContainer = document.createElement('div');
    themeContainer.className = 'theme-toggle-container';
    headerRight.prepend(themeContainer);
    createThemeToggle(themeContainer);
  }

  // Initialiser la carte
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    initMap(mapContainer);
  }
}

/**
 * Charge les données et initialise les composants
 */
async function loadDataAndInitialize(): Promise<void> {
  // Afficher l'état de chargement
  updateLoadingState('Chargement des données...');

  // Charger les données
  const locations = await loadData();
  setLocations(locations);

  // Mettre à jour le compteur
  updateResultsCount();

  // Rafraîchir les marqueurs
  refreshMarkers();

  // Ajuster la vue
  setTimeout(() => {
    fitToMarkers();
  }, 100);

  showToast({
    message: `${locations.length} lieux de stage chargés`,
    type: 'success',
    duration: 3000
  });
}

/**
 * Configure les événements globaux
 */
function setupGlobalEvents(): void {
  // Écouter les changements de filtre
  on('FILTER_CHANGED', () => {
    updateResultsCount();
    renderResultsList();
  });

  // Écouter les changements de données
  on('DATA_LOADED', () => {
    updateResultsCount();
    renderResultsList();
  });

  // Écouter le toggle de la sidebar
  window.addEventListener('sidebar-toggle', () => {
    invalidateSize();
  });

  // Écouter la demande de localisation sur la carte
  window.addEventListener('locate-on-map', ((event: CustomEvent) => {
    const { index } = event.detail;
    if (index !== undefined) {
      focusOnMarker(index, { zoom: 15, openPopup: true });
    }
  }) as EventListener);

  // Écouter la sélection d'un lieu
  window.addEventListener('location-selected', ((event: CustomEvent) => {
    const { index } = event.detail;
    if (index !== undefined) {
      highlightResult(index);
    }
  }) as EventListener);

  // Gérer le redimensionnement
  window.addEventListener('resize', () => {
    invalidateSize();
  });

  // Raccourcis clavier globaux
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K pour focus sur la recherche
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('searchInput') as HTMLInputElement;
      searchInput?.focus();
    }

    // Escape pour fermer les modales
    if (e.key === 'Escape') {
      closeAllModals();
    }

    // H pour toggle heatmap
    if (e.key === 'h' && !isInputFocused()) {
      toggleHeatmap(!store.heatmapEnabled);
    }
  });

  // Intégration avec les boutons existants (legacy)
  setupLegacyIntegration();
}

/**
 * Intègre les fonctionnalités avec l'interface legacy
 */
function setupLegacyIntegration(): void {
  // Bouton admin
  const adminBtn = document.getElementById('adminBtn');
  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      openAdminPanel();
    });
  }

  // Bouton de recherche existant
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      updateFilters({ search: searchInput.value });
    }, 300));
  }

  // Boutons d'export existants
  const exportCSV = document.getElementById('exportCSV');
  const exportJSON = document.getElementById('exportJSON');
  const exportPDF = document.getElementById('exportPDF');

  if (exportCSV) {
    exportCSV.addEventListener('click', async () => {
      const { exportAsCsv } = await import('./services/export.service');
      await exportAsCsv(store.filteredIndices);
      showToast({ message: 'Export CSV téléchargé', type: 'success' });
    });
  }

  if (exportJSON) {
    exportJSON.addEventListener('click', async () => {
      const { exportAsJson } = await import('./services/export.service');
      await exportAsJson(store.filteredIndices);
      showToast({ message: 'Export JSON téléchargé', type: 'success' });
    });
  }

  if (exportPDF) {
    exportPDF.addEventListener('click', async () => {
      const { exportAsPdf } = await import('./services/export.service');
      await exportAsPdf(store.filteredIndices);
      showToast({ message: 'Export PDF généré', type: 'success' });
    });
  }

  // Bouton reset
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Reset des filtres dans l'UI
      if (searchInput) searchInput.value = '';
      const domaineFilter = document.getElementById('domaineFilter') as HTMLSelectElement;
      const niveauFilter = document.getElementById('niveauFilter') as HTMLSelectElement;
      if (domaineFilter) domaineFilter.value = '';
      if (niveauFilter) niveauFilter.value = '';

      // Reset dans le store
      updateFilters({
        search: '',
        domains: [],
        levelMin: 1,
        levelMax: 5,
        distanceKm: null,
        referencePoint: null,
        favoritesOnly: false
      });
    });
  }

  // Connecter le filtre de domaine legacy au store
  const domaineFilter = document.getElementById('domaineFilter') as HTMLSelectElement;
  if (domaineFilter) {
    // Remplir le dropdown avec les types uniques
    function populateDomainFilter() {
      const types = store.uniqueTypes;
      domaineFilter.innerHTML = '<option value="">Tous</option>';
      types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        domaineFilter.appendChild(option);
      });
    }

    // Mettre à jour le filtre quand la sélection change
    domaineFilter.addEventListener('change', () => {
      const selectedDomain = domaineFilter.value;
      updateFilters({
        domains: selectedDomain ? [selectedDomain] : []
      });
    });

    // Remplir initialement et écouter les changements de données
    populateDomainFilter();
    on('DATA_LOADED', populateDomainFilter);
  }

  // Connecter le filtre de niveau legacy au store
  const niveauFilter = document.getElementById('niveauFilter') as HTMLSelectElement;
  if (niveauFilter) {
    niveauFilter.addEventListener('change', () => {
      const selectedNiveau = niveauFilter.value;
      if (selectedNiveau) {
        updateFilters({
          levelMin: parseInt(selectedNiveau),
          levelMax: parseInt(selectedNiveau)
        });
      } else {
        updateFilters({
          levelMin: 1,
          levelMax: 5
        });
      }
    });
  }
}

/**
 * Met à jour le compteur de résultats
 */
function updateResultsCount(): void {
  const countEl = document.getElementById('resultsCount');
  if (!countEl) return;

  const total = store.locations.length;
  const filtered = store.filteredIndices.length;
  const span = countEl.querySelector('span');

  if (span) {
    if (filtered === total) {
      span.textContent = `${total} lieu${total > 1 ? 'x' : ''} de stage`;
    } else {
      span.textContent = `${filtered} / ${total} lieu${filtered > 1 ? 'x' : ''}`;
    }
  }
}

/**
 * Génère la liste des résultats de recherche
 */
function renderResultsList(): void {
  const listEl = document.getElementById('resultsList');
  if (!listEl) return;

  const indices = store.filteredIndices;

  // Limiter à 50 résultats pour les performances
  const maxResults = 50;
  const displayIndices = indices.slice(0, maxResults);

  if (displayIndices.length === 0) {
    listEl.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>Aucun résultat trouvé</p>
      </div>
    `;
    return;
  }

  const html = displayIndices.map(index => {
    const loc = store.locations[index];
    const levelColor = getLevelColor(loc.niveau);

    return `
      <div class="result-item" data-index="${index}">
        <div class="result-item-header">
          <span class="result-item-name">${escapeHtml(loc.nom)}</span>
          ${loc.niveau ? `<span class="result-item-niveau" style="background: linear-gradient(135deg, ${levelColor} 0%, ${levelColor} 100%)">Niv. ${loc.niveau}</span>` : ''}
        </div>
        <div class="result-item-ville">
          <i class="fas fa-map-marker-alt"></i>
          ${escapeHtml(loc.ville)} (${loc.codePostal})
        </div>
        <div class="result-item-type">
          <i class="fas fa-utensils"></i>
          ${escapeHtml(loc.type)}
        </div>
        <div class="result-item-actions">
          <button class="result-item-btn btn-locate" title="Localiser sur la carte">
            <i class="fas fa-crosshairs"></i> Localiser
          </button>
          ${loc.telephone ? `
            <a href="tel:${loc.telephone}" class="result-item-btn btn-call" title="Appeler">
              <i class="fas fa-phone"></i> Appeler
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  listEl.innerHTML = html;

  // Ajouter un message si plus de résultats
  if (indices.length > maxResults) {
    const moreEl = document.createElement('div');
    moreEl.className = 'results-more';
    moreEl.innerHTML = `<p>+ ${indices.length - maxResults} autres résultats (affiner la recherche)</p>`;
    listEl.appendChild(moreEl);
  }

  // Ajouter les événements de clic
  listEl.querySelectorAll('.result-item').forEach(item => {
    const index = parseInt((item as HTMLElement).dataset.index || '-1', 10);

    // Clic sur localiser
    item.querySelector('.btn-locate')?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent('locate-on-map', { detail: { index } }));
    });

    // Clic sur l'item entier
    item.addEventListener('click', () => {
      // Retirer la classe active des autres items
      listEl.querySelectorAll('.result-item.active').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      window.dispatchEvent(new CustomEvent('locate-on-map', { detail: { index } }));
    });
  });
}

/**
 * Retourne une couleur selon le niveau
 */
function getLevelColor(niveau: string): string {
  if (!niveau) return '#94a3b8';
  const match = niveau.match(/(\d)/);
  if (!match) return '#94a3b8';
  const level = parseInt(match[1], 10);
  const colors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#8b5cf6'];
  return colors[level - 1] || '#94a3b8';
}

/**
 * Échappe le HTML pour éviter les injections XSS
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Met en évidence un résultat dans la liste
 */
function highlightResult(index: number): void {
  const resultsList = document.getElementById('resultsList');
  if (!resultsList) return;

  const item = resultsList.querySelector(`[data-index="${index}"]`);
  if (item) {
    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    item.classList.add('highlight');
    setTimeout(() => item.classList.remove('highlight'), 2000);
  }
}

/**
 * Met à jour le texte de chargement
 */
function updateLoadingState(text: string): void {
  const loadingText = document.querySelector('.loading-text');
  if (loadingText) {
    loadingText.textContent = text;
  }
}

/**
 * Masque l'overlay de chargement
 */
function hideLoadingOverlay(): void {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
  }
}

/**
 * Ferme toutes les modales
 */
function closeAllModals(): void {
  // Fermer les modales legacy
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => {
    (modal as HTMLElement).style.display = 'none';
  });

  // Fermer le modal admin si ouvert
  const adminModal = document.querySelector('.admin-modal-overlay');
  if (adminModal) {
    adminModal.classList.add('closing');
    setTimeout(() => adminModal.remove(), 300);
  }

  // Fermer le modal d'auth admin si ouvert
  const authModal = document.querySelector('.admin-auth-modal');
  if (authModal) {
    authModal.remove();
  }
}

/**
 * Vérifie si un input est actuellement focus
 */
function isInputFocused(): boolean {
  const active = document.activeElement;
  return active instanceof HTMLInputElement ||
         active instanceof HTMLTextAreaElement ||
         active instanceof HTMLSelectElement;
}

/**
 * Debounce simple
 */
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ============================================================================
// Lancement de l'application
// ============================================================================

// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Export pour debug en mode développement
if (import.meta.env.DEV) {
  (window as any).__app = {
    store,
    refreshMarkers,
    fitToMarkers,
    showToast,
    openAdminPanel
  };
}
