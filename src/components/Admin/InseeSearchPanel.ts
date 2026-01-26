// ============================================================================
// Panneau de recherche INSEE (API Recherche Entreprises)
// ============================================================================

import type { Location } from '../../types';
import type { INSEEResult } from '../../types';
import { searchSirene, getDepartments, getNafCodesByDomain } from '../../services/insee.service';
import { showToast } from '../UI/Toast';

export interface InseeSearchPanelOptions {
  onAdd: (location: Location) => void;
}

/**
 * Crée le panneau de recherche INSEE
 */
export function createInseeSearchPanel(container: HTMLElement, options: InseeSearchPanelOptions): void {
  const { onAdd } = options;
  const departments = getDepartments();

  container.innerHTML = `
    <div class="admin-insee-panel">
      <div class="admin-insee-header">
        <h3><i class="fas fa-building"></i> Recherche INSEE</h3>
        <p>Recherchez des établissements dans la base de données officielle des entreprises françaises.</p>
      </div>

      <div class="admin-insee-form">
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label for="inseeDept"><i class="fas fa-map"></i> Département *</label>
            <select id="inseeDept" class="admin-input" required>
              ${departments.map(d => `<option value="${d.code}">${d.code} - ${d.nom}</option>`).join('')}
            </select>
          </div>

          <div class="admin-form-group">
            <label for="inseeDomain"><i class="fas fa-utensils"></i> Domaine</label>
            <select id="inseeDomain" class="admin-input">
              <option value="all">Tous les domaines</option>
              <option value="restauration">Restauration</option>
              <option value="hotellerie">Hôtellerie</option>
              <option value="commerce">Commerce alimentaire</option>
            </select>
          </div>
        </div>

        <div class="admin-form-row">
          <div class="admin-form-group admin-form-group-large">
            <label for="inseeCity"><i class="fas fa-city"></i> Ville (optionnel)</label>
            <input type="text" id="inseeCity" class="admin-input" placeholder="Ex: Niort, Parthenay...">
          </div>

          <div class="admin-form-group">
            <label for="inseeLimit"><i class="fas fa-list-ol"></i> Résultats max</label>
            <select id="inseeLimit" class="admin-input">
              <option value="10">10</option>
              <option value="25" selected>25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div class="admin-form-actions">
          <button type="button" class="admin-btn admin-btn-primary" id="inseeSearchBtn">
            <i class="fas fa-search"></i> Rechercher
          </button>
        </div>
      </div>

      <div class="admin-insee-results" id="inseeResults" style="display: none;">
        <div class="admin-insee-results-header">
          <h4><i class="fas fa-list"></i> Résultats (<span id="inseeResultsCount">0</span>)</h4>
          <button type="button" class="admin-btn admin-btn-sm admin-btn-secondary" id="inseeAddAllBtn">
            <i class="fas fa-plus-circle"></i> Tout ajouter
          </button>
        </div>
        <div class="admin-insee-results-list" id="inseeResultsList"></div>
      </div>

      <div class="admin-insee-loading" id="inseeLoading" style="display: none;">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Recherche en cours...</span>
      </div>

      <div class="admin-insee-empty" id="inseeEmpty" style="display: none;">
        <i class="fas fa-search"></i>
        <span>Aucun résultat trouvé. Essayez d'élargir vos critères de recherche.</span>
      </div>
    </div>
  `;

  // Elements
  const deptSelect = container.querySelector('#inseeDept') as HTMLSelectElement;
  const domainSelect = container.querySelector('#inseeDomain') as HTMLSelectElement;
  const cityInput = container.querySelector('#inseeCity') as HTMLInputElement;
  const limitSelect = container.querySelector('#inseeLimit') as HTMLSelectElement;
  const searchBtn = container.querySelector('#inseeSearchBtn') as HTMLButtonElement;
  const resultsSection = container.querySelector('#inseeResults') as HTMLElement;
  const resultsCount = container.querySelector('#inseeResultsCount') as HTMLElement;
  const resultsList = container.querySelector('#inseeResultsList') as HTMLElement;
  const loadingSection = container.querySelector('#inseeLoading') as HTMLElement;
  const emptySection = container.querySelector('#inseeEmpty') as HTMLElement;
  const addAllBtn = container.querySelector('#inseeAddAllBtn') as HTMLButtonElement;

  let currentResults: INSEEResult[] = [];

  // Search handler
  searchBtn.addEventListener('click', async () => {
    const departement = deptSelect.value;
    const domain = domainSelect.value as 'all' | 'restauration' | 'hotellerie' | 'commerce';
    const commune = cityInput.value.trim();
    const limit = parseInt(limitSelect.value, 10);

    // Get NAF codes for selected domain
    const codeNaf = getNafCodesByDomain(domain);

    // Show loading
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recherche...';
    resultsSection.style.display = 'none';
    emptySection.style.display = 'none';
    loadingSection.style.display = 'flex';

    try {
      currentResults = await searchSirene({
        departement,
        commune: commune || undefined,
        codeNaf,
        limit
      });

      if (currentResults.length === 0) {
        emptySection.style.display = 'flex';
        resultsSection.style.display = 'none';
      } else {
        renderResults(currentResults);
        resultsSection.style.display = 'block';
        emptySection.style.display = 'none';
      }
    } catch (error) {
      console.error('Erreur recherche INSEE:', error);
      showToast({ message: 'Erreur lors de la recherche', type: 'error' });
      emptySection.style.display = 'flex';
    }

    loadingSection.style.display = 'none';
    searchBtn.disabled = false;
    searchBtn.innerHTML = '<i class="fas fa-search"></i> Rechercher';
  });

  // Render results
  function renderResults(results: INSEEResult[]) {
    resultsCount.textContent = String(results.length);

    resultsList.innerHTML = results.map((result, index) => `
      <div class="admin-insee-result-item" data-index="${index}">
        <div class="admin-insee-result-info">
          <div class="admin-insee-result-name">${escapeHtml(result.nom)}</div>
          <div class="admin-insee-result-address">
            ${escapeHtml(result.adresse || 'Adresse non renseignée')},
            ${escapeHtml(result.codePostal)} ${escapeHtml(result.ville)}
          </div>
          <div class="admin-insee-result-meta">
            <span class="admin-insee-result-type"><i class="fas fa-tag"></i> ${escapeHtml(result.type)}</span>
            ${result.lat && result.lon ? '<span class="admin-insee-result-geo"><i class="fas fa-map-marker-alt"></i> Géolocalisé</span>' : ''}
            <span class="admin-insee-result-siret"><i class="fas fa-barcode"></i> ${escapeHtml(result.siret)}</span>
          </div>
        </div>
        <button type="button" class="admin-btn admin-btn-sm admin-btn-primary insee-add-btn" data-index="${index}">
          <i class="fas fa-plus"></i> Ajouter
        </button>
      </div>
    `).join('');

    // Add click handlers for individual add buttons
    resultsList.querySelectorAll('.insee-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.currentTarget as HTMLElement).dataset.index || '0', 10);
        addResult(index);
        // Mark as added
        const item = resultsList.querySelector(`[data-index="${index}"]`);
        if (item) {
          item.classList.add('added');
          (btn as HTMLButtonElement).disabled = true;
          (btn as HTMLButtonElement).innerHTML = '<i class="fas fa-check"></i> Ajouté';
        }
      });
    });
  }

  // Add single result
  function addResult(index: number) {
    const result = currentResults[index];
    if (!result) return;

    const location: Location = {
      nom: result.nom,
      adresse: result.adresse || '',
      codePostal: result.codePostal,
      ville: result.ville,
      type: result.type,
      niveau: '',
      telephone: '',
      email: '',
      contact: '',
      commentaire: `SIRET: ${result.siret}`,
      lat: result.lat || null,
      lon: result.lon || null
    };

    onAdd(location);
    showToast({ message: `${result.nom} ajouté`, type: 'success' });
  }

  // Add all results
  addAllBtn.addEventListener('click', () => {
    let added = 0;
    currentResults.forEach((result, index) => {
      const item = resultsList.querySelector(`[data-index="${index}"]`);
      if (item && !item.classList.contains('added')) {
        addResult(index);
        item.classList.add('added');
        const btn = item.querySelector('.insee-add-btn') as HTMLButtonElement;
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = '<i class="fas fa-check"></i> Ajouté';
        }
        added++;
      }
    });

    if (added > 0) {
      showToast({ message: `${added} lieu${added > 1 ? 'x' : ''} ajouté${added > 1 ? 's' : ''}`, type: 'success' });
    }
  });
}

/**
 * Échappe le HTML
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
