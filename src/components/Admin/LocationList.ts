// ============================================================================
// Liste des lieux avec actions de gestion
// ============================================================================

import type { Location } from '../../types';
import { store } from '../../store';

export interface LocationListOptions {
  onEdit: (index: number) => void;
  onDelete: (indices: number[]) => void;
  onLocate: (index: number) => void;
}

interface ListState {
  page: number;
  perPage: number;
  search: string;
  sortField: keyof Location | null;
  sortDir: 'asc' | 'desc';
  selected: Set<number>;
}

/**
 * Crée la liste de gestion des lieux
 */
export function createLocationList(container: HTMLElement, options: LocationListOptions): void {
  const { onEdit, onDelete, onLocate } = options;

  const state: ListState = {
    page: 1,
    perPage: 20,
    search: '',
    sortField: 'nom',
    sortDir: 'asc',
    selected: new Set()
  };

  function render() {
    const locations = store.locations;
    let filtered = locations.map((_, i) => i);

    // Filter by search
    if (state.search) {
      const searchLower = state.search.toLowerCase();
      filtered = filtered.filter(i => {
        const loc = locations[i];
        return (
          loc.nom.toLowerCase().includes(searchLower) ||
          loc.ville.toLowerCase().includes(searchLower) ||
          loc.codePostal.includes(searchLower) ||
          loc.type.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort
    if (state.sortField) {
      filtered.sort((a, b) => {
        const aVal = locations[a][state.sortField!] || '';
        const bVal = locations[b][state.sortField!] || '';
        const cmp = String(aVal).localeCompare(String(bVal), 'fr', { numeric: true });
        return state.sortDir === 'asc' ? cmp : -cmp;
      });
    }

    // Pagination
    const totalPages = Math.ceil(filtered.length / state.perPage);
    const startIdx = (state.page - 1) * state.perPage;
    const pageItems = filtered.slice(startIdx, startIdx + state.perPage);

    container.innerHTML = `
      <div class="admin-list-header">
        <div class="admin-list-search">
          <i class="fas fa-search"></i>
          <input type="text" class="admin-input" placeholder="Rechercher..."
                 value="${escapeHtml(state.search)}" id="listSearchInput">
        </div>
        <div class="admin-list-info">
          ${filtered.length} lieu${filtered.length > 1 ? 'x' : ''} trouvé${filtered.length > 1 ? 's' : ''}
        </div>
        <div class="admin-list-bulk-actions" style="display: ${state.selected.size > 0 ? 'flex' : 'none'}">
          <span>${state.selected.size} sélectionné${state.selected.size > 1 ? 's' : ''}</span>
          <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" id="bulkDeleteBtn">
            <i class="fas fa-trash"></i> Supprimer
          </button>
        </div>
      </div>

      <div class="admin-list-table-container">
        <table class="admin-list-table">
          <thead>
            <tr>
              <th class="admin-list-th-check">
                <input type="checkbox" id="selectAllCheck" ${state.selected.size === pageItems.length && pageItems.length > 0 ? 'checked' : ''}>
              </th>
              <th class="admin-list-th-sortable" data-field="nom">
                Nom ${getSortIcon('nom')}
              </th>
              <th class="admin-list-th-sortable" data-field="ville">
                Ville ${getSortIcon('ville')}
              </th>
              <th class="admin-list-th-sortable" data-field="type">
                Type ${getSortIcon('type')}
              </th>
              <th class="admin-list-th-sortable" data-field="niveau">
                Niveau ${getSortIcon('niveau')}
              </th>
              <th>Géoloc</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.length === 0 ? `
              <tr>
                <td colspan="7" class="admin-list-empty">
                  <i class="fas fa-inbox"></i>
                  <p>Aucun lieu trouvé</p>
                </td>
              </tr>
            ` : pageItems.map(index => {
              const loc = locations[index];
              const hasCoords = loc.lat !== null && loc.lon !== null;
              return `
                <tr data-index="${index}" class="${state.selected.has(index) ? 'selected' : ''}">
                  <td>
                    <input type="checkbox" class="row-check" ${state.selected.has(index) ? 'checked' : ''}>
                  </td>
                  <td class="admin-list-cell-nom" title="${escapeHtml(loc.nom)}">
                    ${escapeHtml(truncate(loc.nom, 30))}
                  </td>
                  <td>
                    ${escapeHtml(loc.ville)} <span class="admin-list-cp">(${loc.codePostal})</span>
                  </td>
                  <td>
                    <span class="admin-list-type">${escapeHtml(truncate(loc.type, 20))}</span>
                  </td>
                  <td>
                    ${loc.niveau ? `<span class="admin-list-niveau niveau-${loc.niveau}">${loc.niveau}</span>` : '-'}
                  </td>
                  <td>
                    <span class="admin-list-geo ${hasCoords ? 'yes' : 'no'}">
                      <i class="fas fa-${hasCoords ? 'check' : 'times'}"></i>
                    </span>
                  </td>
                  <td class="admin-list-actions">
                    <button type="button" class="admin-btn-icon btn-locate" title="Localiser sur la carte">
                      <i class="fas fa-map-marker-alt"></i>
                    </button>
                    <button type="button" class="admin-btn-icon btn-edit" title="Modifier">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="admin-btn-icon btn-delete" title="Supprimer">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      ${totalPages > 1 ? `
        <div class="admin-list-pagination">
          <button type="button" class="admin-btn admin-btn-sm" id="prevPageBtn" ${state.page <= 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="admin-list-page-info">
            Page ${state.page} / ${totalPages}
          </span>
          <button type="button" class="admin-btn admin-btn-sm" id="nextPageBtn" ${state.page >= totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      ` : ''}
    `;

    // Event handlers
    const searchInput = container.querySelector('#listSearchInput') as HTMLInputElement;
    searchInput?.addEventListener('input', debounce(() => {
      state.search = searchInput.value;
      state.page = 1;
      state.selected.clear();
      render();
    }, 300));

    // Sort headers
    container.querySelectorAll('.admin-list-th-sortable').forEach(th => {
      th.addEventListener('click', () => {
        const field = (th as HTMLElement).dataset.field as keyof Location;
        if (state.sortField === field) {
          state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortField = field;
          state.sortDir = 'asc';
        }
        render();
      });
    });

    // Select all
    const selectAllCheck = container.querySelector('#selectAllCheck') as HTMLInputElement;
    selectAllCheck?.addEventListener('change', () => {
      if (selectAllCheck.checked) {
        pageItems.forEach(i => state.selected.add(i));
      } else {
        pageItems.forEach(i => state.selected.delete(i));
      }
      render();
    });

    // Row checkboxes
    container.querySelectorAll('.row-check').forEach(check => {
      check.addEventListener('change', (e) => {
        const tr = (e.target as HTMLElement).closest('tr');
        const index = parseInt(tr?.dataset.index || '-1', 10);
        if ((e.target as HTMLInputElement).checked) {
          state.selected.add(index);
        } else {
          state.selected.delete(index);
        }
        render();
      });
    });

    // Bulk delete
    const bulkDeleteBtn = container.querySelector('#bulkDeleteBtn');
    bulkDeleteBtn?.addEventListener('click', () => {
      if (state.selected.size > 0) {
        if (confirm(`Supprimer ${state.selected.size} lieu${state.selected.size > 1 ? 'x' : ''} ?`)) {
          onDelete(Array.from(state.selected).sort((a, b) => b - a));
          state.selected.clear();
          state.page = 1;
          render();
        }
      }
    });

    // Row actions
    container.querySelectorAll('tr[data-index]').forEach(tr => {
      const index = parseInt((tr as HTMLElement).dataset.index || '-1', 10);

      tr.querySelector('.btn-locate')?.addEventListener('click', (e) => {
        e.stopPropagation();
        onLocate(index);
      });

      tr.querySelector('.btn-edit')?.addEventListener('click', (e) => {
        e.stopPropagation();
        onEdit(index);
      });

      tr.querySelector('.btn-delete')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Supprimer "${locations[index].nom}" ?`)) {
          onDelete([index]);
          state.selected.delete(index);
          render();
        }
      });
    });

    // Pagination
    const prevBtn = container.querySelector('#prevPageBtn');
    const nextBtn = container.querySelector('#nextPageBtn');

    prevBtn?.addEventListener('click', () => {
      if (state.page > 1) {
        state.page--;
        render();
      }
    });

    nextBtn?.addEventListener('click', () => {
      if (state.page < totalPages) {
        state.page++;
        render();
      }
    });
  }

  function getSortIcon(field: string): string {
    if (state.sortField !== field) return '<i class="fas fa-sort admin-sort-inactive"></i>';
    return state.sortDir === 'asc'
      ? '<i class="fas fa-sort-up"></i>'
      : '<i class="fas fa-sort-down"></i>';
  }

  // Initial render
  render();

  // Re-render when data changes
  window.addEventListener('admin-data-changed', () => {
    render();
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

/**
 * Tronque le texte
 */
function truncate(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

/**
 * Debounce
 */
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
