// ============================================================================
// Panneau principal d'administration
// ============================================================================

import type { Location } from '../../types';
import { store, setLocations, emit } from '../../store';
import { addLocation, updateLocation, removeLocation, getAllLocations } from '../../services/data.service';
import { showToast } from '../UI/Toast';
import { requireAuth, logout, createChangeCodeForm } from './AdminAuth';
import { createLocationForm } from './LocationForm';
import { createLocationList } from './LocationList';
import { createImportPanel } from './ImportPanel';
import { createInseeSearchPanel } from './InseeSearchPanel';
import { refreshMarkers, focusOnMarker } from '../Map/Map';

type Tab = 'add' | 'insee' | 'import' | 'manage' | 'settings';

let currentTab: Tab = 'add';
let editingIndex: number | undefined = undefined;
let modalElement: HTMLElement | null = null;

/**
 * Ouvre le panneau d'administration
 */
export function openAdminPanel(): void {
  requireAuth(() => {
    createAdminModal();
  });
}

/**
 * Ferme le panneau d'administration
 */
export function closeAdminPanel(): void {
  if (modalElement) {
    modalElement.classList.add('closing');
    setTimeout(() => {
      modalElement?.remove();
      modalElement = null;
    }, 300);
  }
}

/**
 * Crée le modal d'administration
 */
function createAdminModal(): void {
  // Remove existing modal if any
  if (modalElement) {
    modalElement.remove();
  }

  modalElement = document.createElement('div');
  modalElement.className = 'admin-modal-overlay';
  modalElement.innerHTML = `
    <div class="admin-modal">
      <div class="admin-modal-header">
        <h2><i class="fas fa-cog"></i> Administration des Lieux de Stage</h2>
        <button type="button" class="admin-modal-close" id="closeAdminBtn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <nav class="admin-tabs">
        <button type="button" class="admin-tab ${currentTab === 'add' ? 'active' : ''}" data-tab="add">
          <i class="fas fa-plus-circle"></i>
          <span>Ajouter</span>
        </button>
        <button type="button" class="admin-tab ${currentTab === 'insee' ? 'active' : ''}" data-tab="insee">
          <i class="fas fa-building"></i>
          <span>INSEE</span>
        </button>
        <button type="button" class="admin-tab ${currentTab === 'import' ? 'active' : ''}" data-tab="import">
          <i class="fas fa-file-import"></i>
          <span>Importer</span>
        </button>
        <button type="button" class="admin-tab ${currentTab === 'manage' ? 'active' : ''}" data-tab="manage">
          <i class="fas fa-list"></i>
          <span>Gérer</span>
        </button>
        <button type="button" class="admin-tab ${currentTab === 'settings' ? 'active' : ''}" data-tab="settings">
          <i class="fas fa-cog"></i>
          <span>Paramètres</span>
        </button>
      </nav>

      <div class="admin-content" id="adminContent">
        <!-- Content will be rendered here -->
      </div>
    </div>
  `;

  document.body.appendChild(modalElement);

  // Setup events
  const closeBtn = modalElement.querySelector('#closeAdminBtn') as HTMLButtonElement;
  closeBtn.addEventListener('click', closeAdminPanel);

  // Close on backdrop click
  modalElement.addEventListener('click', (e) => {
    if (e.target === modalElement) {
      closeAdminPanel();
    }
  });

  // Tab navigation
  modalElement.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const newTab = (tab as HTMLElement).dataset.tab as Tab;
      switchTab(newTab);
    });
  });

  // Keyboard shortcut to close
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeAdminPanel();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  document.addEventListener('keydown', handleKeydown);

  // Render initial tab
  renderTab(currentTab);
}

/**
 * Change d'onglet
 */
function switchTab(tab: Tab): void {
  currentTab = tab;
  editingIndex = undefined;

  // Update tab buttons
  modalElement?.querySelectorAll('.admin-tab').forEach(btn => {
    btn.classList.toggle('active', (btn as HTMLElement).dataset.tab === tab);
  });

  renderTab(tab);
}

/**
 * Affiche le contenu de l'onglet
 */
function renderTab(tab: Tab): void {
  const content = modalElement?.querySelector('#adminContent') as HTMLElement;
  if (!content) return;

  switch (tab) {
    case 'add':
      renderAddTab(content);
      break;
    case 'insee':
      renderInseeTab(content);
      break;
    case 'import':
      renderImportTab(content);
      break;
    case 'manage':
      renderManageTab(content);
      break;
    case 'settings':
      renderSettingsTab(content);
      break;
  }
}

/**
 * Onglet Ajouter
 */
function renderAddTab(content: HTMLElement): void {
  const locationToEdit = editingIndex !== undefined ? store.locations[editingIndex] : undefined;

  createLocationForm(content, {
    location: locationToEdit,
    index: editingIndex,
    onSave: (location, index) => {
      if (index !== undefined) {
        // Update existing
        updateLocation(index, location);
        syncStore();
        showToast({ message: 'Lieu modifié avec succès', type: 'success' });
      } else {
        // Add new
        addLocation(location);
        syncStore();
        showToast({ message: 'Lieu ajouté avec succès', type: 'success' });
      }
      editingIndex = undefined;
      renderAddTab(content);
    },
    onCancel: () => {
      editingIndex = undefined;
      if (editingIndex !== undefined) {
        switchTab('manage');
      }
    }
  });
}

/**
 * Onglet Recherche INSEE
 */
function renderInseeTab(content: HTMLElement): void {
  createInseeSearchPanel(content, {
    onAdd: (location) => {
      addLocation(location);
      syncStore();
    }
  });
}

/**
 * Onglet Importer
 */
function renderImportTab(content: HTMLElement): void {
  createImportPanel(content, {
    onImport: (locations) => {
      let added = 0;
      for (const loc of locations) {
        addLocation(loc);
        added++;
      }
      syncStore();
      showToast({
        message: `${added} lieu${added > 1 ? 'x' : ''} importé${added > 1 ? 's' : ''} avec succès`,
        type: 'success'
      });
      switchTab('manage');
    },
    onCancel: () => {
      // Stay on import tab
    }
  });
}

/**
 * Onglet Gérer
 */
function renderManageTab(content: HTMLElement): void {
  createLocationList(content, {
    onEdit: (index) => {
      editingIndex = index;
      switchTab('add');
    },
    onDelete: (indices) => {
      // Delete from highest to lowest to maintain indices
      indices.sort((a, b) => b - a).forEach(index => {
        removeLocation(index);
      });
      syncStore();
      showToast({
        message: `${indices.length} lieu${indices.length > 1 ? 'x' : ''} supprimé${indices.length > 1 ? 's' : ''}`,
        type: 'success'
      });
      // Trigger re-render
      window.dispatchEvent(new CustomEvent('admin-data-changed'));
    },
    onLocate: (index) => {
      closeAdminPanel();
      setTimeout(() => {
        focusOnMarker(index, { zoom: 15, openPopup: true });
      }, 300);
    }
  });
}

/**
 * Onglet Paramètres
 */
function renderSettingsTab(content: HTMLElement): void {
  content.innerHTML = `
    <div class="admin-settings">
      <div class="admin-settings-section">
        <h3><i class="fas fa-key"></i> Sécurité</h3>
        <div id="changeCodeContainer"></div>
      </div>

      <div class="admin-settings-section">
        <h3><i class="fas fa-download"></i> Export des données</h3>
        <p class="admin-settings-desc">Téléchargez toutes les données au format JSON pour sauvegarde.</p>
        <button type="button" class="admin-btn admin-btn-secondary" id="exportDataBtn">
          <i class="fas fa-download"></i> Exporter les données (JSON)
        </button>
      </div>

      <div class="admin-settings-section">
        <h3><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="admin-stats-grid" id="statsGrid">
          <!-- Stats will be rendered here -->
        </div>
      </div>

      <div class="admin-settings-section">
        <h3><i class="fas fa-sign-out-alt"></i> Session</h3>
        <p class="admin-settings-desc">Déconnectez-vous de l'interface d'administration.</p>
        <button type="button" class="admin-btn admin-btn-danger" id="logoutBtn">
          <i class="fas fa-sign-out-alt"></i> Se déconnecter
        </button>
      </div>
    </div>
  `;

  // Change code form
  const changeCodeContainer = content.querySelector('#changeCodeContainer') as HTMLElement;
  createChangeCodeForm(changeCodeContainer);

  // Export data
  const exportBtn = content.querySelector('#exportDataBtn') as HTMLButtonElement;
  exportBtn.addEventListener('click', () => {
    const data = getAllLocations();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lieux-stage-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ message: 'Données exportées', type: 'success' });
  });

  // Stats
  renderStats(content.querySelector('#statsGrid') as HTMLElement);

  // Logout
  const logoutBtn = content.querySelector('#logoutBtn') as HTMLButtonElement;
  logoutBtn.addEventListener('click', () => {
    logout();
    closeAdminPanel();
    showToast({ message: 'Déconnexion réussie', type: 'info' });
  });
}

/**
 * Affiche les statistiques
 */
function renderStats(container: HTMLElement): void {
  const locations = store.locations;
  const totalLocations = locations.length;
  const geolocated = locations.filter(l => l.lat !== null && l.lon !== null).length;
  const uniqueCities = new Set(locations.map(l => l.ville)).size;
  const uniqueTypes = new Set(locations.map(l => l.type)).size;

  container.innerHTML = `
    <div class="admin-stat-card">
      <i class="fas fa-map-marker-alt"></i>
      <div class="admin-stat-value">${totalLocations}</div>
      <div class="admin-stat-label">Lieux de stage</div>
    </div>
    <div class="admin-stat-card">
      <i class="fas fa-crosshairs"></i>
      <div class="admin-stat-value">${geolocated}</div>
      <div class="admin-stat-label">Géolocalisés</div>
    </div>
    <div class="admin-stat-card">
      <i class="fas fa-city"></i>
      <div class="admin-stat-value">${uniqueCities}</div>
      <div class="admin-stat-label">Villes</div>
    </div>
    <div class="admin-stat-card">
      <i class="fas fa-tags"></i>
      <div class="admin-stat-value">${uniqueTypes}</div>
      <div class="admin-stat-label">Types</div>
    </div>
  `;
}

/**
 * Synchronise le store avec les données du service
 */
function syncStore(): void {
  const locations = getAllLocations();
  setLocations(locations);
  refreshMarkers();
}
