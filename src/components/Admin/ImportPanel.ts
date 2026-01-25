// ============================================================================
// Panneau d'import Excel/CSV
// ============================================================================

import type { Location } from '../../types';
import { geocodeAddress } from '../../services/geocoding.service';
import { locationExists } from '../../services/data.service';

export interface ImportOptions {
  onImport: (locations: Location[]) => void;
  onCancel: () => void;
}

interface ParsedData {
  headers: string[];
  rows: string[][];
}

interface ColumnMapping {
  nom: number;
  adresse: number;
  codePostal: number;
  ville: number;
  type: number;
  niveau: number;
  telephone: number;
  email: number;
  contact: number;
  commentaire: number;
  lat: number;
  lon: number;
}

// Column name patterns for auto-mapping
const COLUMN_PATTERNS: Record<keyof ColumnMapping, RegExp[]> = {
  nom: [/^nom$/i, /^name$/i, /^établissement$/i, /^entreprise$/i, /^raison/i],
  adresse: [/^adresse$/i, /^address$/i, /^rue$/i, /^voie$/i],
  codePostal: [/^code.?postal$/i, /^cp$/i, /^postal/i, /^zip/i],
  ville: [/^ville$/i, /^city$/i, /^commune$/i, /^localité$/i],
  type: [/^type$/i, /^catégorie$/i, /^category$/i, /^activité$/i],
  niveau: [/^niveau$/i, /^level$/i, /^niv$/i],
  telephone: [/^t[ée]l[ée]?phone$/i, /^tel$/i, /^phone$/i, /^mobile$/i],
  email: [/^e?.?mail$/i, /^courriel$/i],
  contact: [/^contact$/i, /^responsable$/i, /^interlocuteur$/i],
  commentaire: [/^commentaire$/i, /^comment$/i, /^note$/i, /^remarque$/i],
  lat: [/^lat$/i, /^latitude$/i],
  lon: [/^lon$/i, /^lng$/i, /^longitude$/i]
};

/**
 * Crée le panneau d'import
 */
export function createImportPanel(container: HTMLElement, options: ImportOptions): void {
  const { onImport, onCancel } = options;

  let parsedData: ParsedData | null = null;
  let mapping: ColumnMapping = createEmptyMapping();
  let importSettings = {
    skipDuplicates: true,
    autoGeocode: true
  };

  renderDropZone();

  function renderDropZone() {
    container.innerHTML = `
      <div class="admin-import-panel">
        <h3 class="admin-form-title">
          <i class="fas fa-file-import"></i>
          Importer des lieux depuis un fichier
        </h3>

        <div class="admin-import-dropzone" id="dropzone">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Glissez-déposez un fichier ici</p>
          <span>ou</span>
          <label class="admin-btn admin-btn-secondary">
            <i class="fas fa-folder-open"></i> Parcourir
            <input type="file" accept=".csv,.xlsx,.xls" id="fileInput" style="display: none;">
          </label>
          <p class="admin-import-formats">Formats acceptés : CSV, Excel (.xlsx, .xls)</p>
        </div>

        <div class="admin-import-help">
          <h4><i class="fas fa-info-circle"></i> Format attendu</h4>
          <p>Le fichier doit contenir une ligne d'en-tête avec au minimum les colonnes :</p>
          <ul>
            <li><strong>Nom</strong> - Nom de l'établissement</li>
            <li><strong>Adresse</strong> - Adresse postale</li>
            <li><strong>Code postal</strong> - Code postal (5 chiffres)</li>
            <li><strong>Ville</strong> - Nom de la ville</li>
          </ul>
          <p>Colonnes optionnelles : Type, Niveau, Téléphone, Email, Contact, Commentaire, Latitude, Longitude</p>
        </div>

        <div class="admin-form-actions">
          <button type="button" class="admin-btn admin-btn-cancel" id="cancelBtn">
            <i class="fas fa-times"></i> Annuler
          </button>
        </div>
      </div>
    `;

    setupDropZone();
  }

  function setupDropZone() {
    const dropzone = container.querySelector('#dropzone') as HTMLElement;
    const fileInput = container.querySelector('#fileInput') as HTMLInputElement;
    const cancelBtn = container.querySelector('#cancelBtn') as HTMLButtonElement;

    // Drag events
    ['dragenter', 'dragover'].forEach(event => {
      dropzone.addEventListener(event, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(event => {
      dropzone.addEventListener(event, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
      }
    });

    cancelBtn.addEventListener('click', () => {
      onCancel();
    });
  }

  async function handleFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase();

    container.innerHTML = `
      <div class="admin-import-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Lecture du fichier...</p>
      </div>
    `;

    try {
      if (ext === 'csv') {
        parsedData = await parseCSV(file);
      } else if (ext === 'xlsx' || ext === 'xls') {
        parsedData = await parseExcel(file);
      } else {
        throw new Error('Format de fichier non supporté');
      }

      if (parsedData.rows.length === 0) {
        throw new Error('Le fichier est vide');
      }

      // Auto-map columns
      mapping = autoMapColumns(parsedData.headers);

      renderPreview();
    } catch (error) {
      container.innerHTML = `
        <div class="admin-import-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Erreur lors de la lecture du fichier</p>
          <span>${(error as Error).message}</span>
          <button type="button" class="admin-btn admin-btn-secondary" id="retryBtn">
            <i class="fas fa-redo"></i> Réessayer
          </button>
        </div>
      `;
      container.querySelector('#retryBtn')?.addEventListener('click', renderDropZone);
    }
  }

  function renderPreview() {
    if (!parsedData) return;

    const previewRows = parsedData.rows.slice(0, 5);
    const totalRows = parsedData.rows.length;

    container.innerHTML = `
      <div class="admin-import-preview">
        <h3 class="admin-form-title">
          <i class="fas fa-table"></i>
          Aperçu et mapping des colonnes
        </h3>

        <div class="admin-import-stats">
          <span><i class="fas fa-file"></i> ${totalRows} lignes détectées</span>
          <span><i class="fas fa-columns"></i> ${parsedData.headers.length} colonnes</span>
        </div>

        <div class="admin-import-mapping">
          <h4>Correspondance des colonnes</h4>
          <p class="admin-import-mapping-desc">Associez chaque champ avec la colonne correspondante du fichier.</p>

          <div class="admin-import-mapping-grid">
            ${renderMappingSelects()}
          </div>
        </div>

        <div class="admin-import-preview-table-container">
          <h4>Aperçu des données</h4>
          <table class="admin-import-preview-table">
            <thead>
              <tr>
                ${parsedData.headers.map((h, i) => `
                  <th class="${isMapped(i) ? 'mapped' : ''}">
                    ${escapeHtml(h)}
                    ${isMapped(i) ? `<span class="mapped-badge">${getMappedField(i)}</span>` : ''}
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${previewRows.map(row => `
                <tr>
                  ${row.map((cell, i) => `
                    <td class="${isMapped(i) ? 'mapped' : ''}">${escapeHtml(truncate(cell, 30))}</td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${totalRows > 5 ? `<p class="admin-import-more">... et ${totalRows - 5} autres lignes</p>` : ''}
        </div>

        <div class="admin-import-options">
          <h4>Options d'import</h4>
          <label class="admin-checkbox">
            <input type="checkbox" id="skipDuplicates" ${importSettings.skipDuplicates ? 'checked' : ''}>
            <span>Ignorer les doublons (même nom et ville)</span>
          </label>
          <label class="admin-checkbox">
            <input type="checkbox" id="autoGeocode" ${importSettings.autoGeocode ? 'checked' : ''}>
            <span>Géocoder automatiquement les adresses</span>
          </label>
        </div>

        <div class="admin-form-actions">
          <button type="button" class="admin-btn admin-btn-cancel" id="backBtn">
            <i class="fas fa-arrow-left"></i> Retour
          </button>
          <button type="button" class="admin-btn admin-btn-primary" id="importBtn" ${!isValidMapping() ? 'disabled' : ''}>
            <i class="fas fa-file-import"></i> Importer ${totalRows} lieu${totalRows > 1 ? 'x' : ''}
          </button>
        </div>
      </div>
    `;

    setupPreviewEvents();
  }

  function renderMappingSelects(): string {
    const fields: { key: keyof ColumnMapping; label: string; required: boolean }[] = [
      { key: 'nom', label: 'Nom *', required: true },
      { key: 'adresse', label: 'Adresse *', required: true },
      { key: 'codePostal', label: 'Code postal *', required: true },
      { key: 'ville', label: 'Ville *', required: true },
      { key: 'type', label: 'Type', required: false },
      { key: 'niveau', label: 'Niveau', required: false },
      { key: 'telephone', label: 'Téléphone', required: false },
      { key: 'email', label: 'Email', required: false },
      { key: 'contact', label: 'Contact', required: false },
      { key: 'commentaire', label: 'Commentaire', required: false },
      { key: 'lat', label: 'Latitude', required: false },
      { key: 'lon', label: 'Longitude', required: false }
    ];

    return fields.map(({ key, label, required }) => `
      <div class="admin-import-mapping-item ${required ? 'required' : ''}">
        <label>${label}</label>
        <select class="admin-input" data-field="${key}">
          <option value="-1">${required ? '-- Sélectionner --' : '-- Non importé --'}</option>
          ${parsedData!.headers.map((h, i) => `
            <option value="${i}" ${mapping[key] === i ? 'selected' : ''}>${escapeHtml(h)}</option>
          `).join('')}
        </select>
      </div>
    `).join('');
  }

  function setupPreviewEvents() {
    // Mapping selects
    container.querySelectorAll('.admin-import-mapping-item select').forEach(select => {
      select.addEventListener('change', () => {
        const field = (select as HTMLSelectElement).dataset.field as keyof ColumnMapping;
        mapping[field] = parseInt((select as HTMLSelectElement).value, 10);
        renderPreview();
      });
    });

    // Options
    const skipDuplicates = container.querySelector('#skipDuplicates') as HTMLInputElement;
    const autoGeocode = container.querySelector('#autoGeocode') as HTMLInputElement;

    skipDuplicates?.addEventListener('change', () => {
      importSettings.skipDuplicates = skipDuplicates.checked;
    });

    autoGeocode?.addEventListener('change', () => {
      importSettings.autoGeocode = autoGeocode.checked;
    });

    // Buttons
    container.querySelector('#backBtn')?.addEventListener('click', renderDropZone);
    container.querySelector('#importBtn')?.addEventListener('click', startImport);
  }

  async function startImport() {
    if (!parsedData || !isValidMapping()) return;

    const totalRows = parsedData.rows.length;
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    const locations: Location[] = [];

    container.innerHTML = `
      <div class="admin-import-progress">
        <h3><i class="fas fa-cog fa-spin"></i> Import en cours...</h3>
        <div class="admin-progress-bar">
          <div class="admin-progress-fill" id="progressFill" style="width: 0%"></div>
        </div>
        <p class="admin-progress-text" id="progressText">0 / ${totalRows}</p>
        <p class="admin-progress-status" id="progressStatus">Préparation...</p>
      </div>
    `;

    const progressFill = container.querySelector('#progressFill') as HTMLElement;
    const progressText = container.querySelector('#progressText') as HTMLElement;
    const progressStatus = container.querySelector('#progressStatus') as HTMLElement;

    for (let i = 0; i < parsedData.rows.length; i++) {
      const row = parsedData.rows[i];

      // Update progress
      const percent = Math.round(((i + 1) / totalRows) * 100);
      progressFill.style.width = `${percent}%`;
      progressText.textContent = `${i + 1} / ${totalRows}`;

      try {
        const location = rowToLocation(row);

        // Check for duplicates
        if (importSettings.skipDuplicates && locationExists(location.nom, location.ville)) {
          skipped++;
          progressStatus.textContent = `Ignoré: ${location.nom} (doublon)`;
          continue;
        }

        // Geocode if needed
        if (importSettings.autoGeocode && location.lat === null) {
          progressStatus.textContent = `Géocodage: ${location.nom}...`;
          const geo = await geocodeAddress(location.adresse, location.codePostal, location.ville);
          if (geo) {
            location.lat = geo.lat;
            location.lon = geo.lon;
          }
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        locations.push(location);
        imported++;
        progressStatus.textContent = `Importé: ${location.nom}`;
      } catch (error) {
        errors++;
        progressStatus.textContent = `Erreur ligne ${i + 1}`;
      }
    }

    // Show results
    renderResults(imported, skipped, errors, locations);
  }

  function renderResults(imported: number, skipped: number, errors: number, locations: Location[]) {
    container.innerHTML = `
      <div class="admin-import-results">
        <h3><i class="fas fa-check-circle"></i> Import terminé</h3>

        <div class="admin-import-results-stats">
          <div class="stat success">
            <i class="fas fa-check"></i>
            <span class="number">${imported}</span>
            <span class="label">importé${imported > 1 ? 's' : ''}</span>
          </div>
          <div class="stat warning">
            <i class="fas fa-forward"></i>
            <span class="number">${skipped}</span>
            <span class="label">ignoré${skipped > 1 ? 's' : ''}</span>
          </div>
          <div class="stat error">
            <i class="fas fa-times"></i>
            <span class="number">${errors}</span>
            <span class="label">erreur${errors > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div class="admin-form-actions">
          <button type="button" class="admin-btn admin-btn-secondary" id="importMoreBtn">
            <i class="fas fa-plus"></i> Importer un autre fichier
          </button>
          <button type="button" class="admin-btn admin-btn-primary" id="finishBtn">
            <i class="fas fa-check"></i> Terminer
          </button>
        </div>
      </div>
    `;

    container.querySelector('#importMoreBtn')?.addEventListener('click', renderDropZone);
    container.querySelector('#finishBtn')?.addEventListener('click', () => {
      if (locations.length > 0) {
        onImport(locations);
      } else {
        onCancel();
      }
    });
  }

  function rowToLocation(row: string[]): Location {
    return {
      nom: getCell(row, mapping.nom) || '',
      adresse: getCell(row, mapping.adresse) || '',
      codePostal: getCell(row, mapping.codePostal) || '',
      ville: getCell(row, mapping.ville) || '',
      type: getCell(row, mapping.type) || '',
      niveau: getCell(row, mapping.niveau) || '',
      telephone: getCell(row, mapping.telephone) || '',
      email: getCell(row, mapping.email) || '',
      contact: getCell(row, mapping.contact) || '',
      commentaire: getCell(row, mapping.commentaire) || '',
      lat: parseCoord(getCell(row, mapping.lat)),
      lon: parseCoord(getCell(row, mapping.lon))
    };
  }

  function getCell(row: string[], index: number): string {
    if (index < 0 || index >= row.length) return '';
    return row[index].trim();
  }

  function parseCoord(value: string): number | null {
    if (!value) return null;
    const num = parseFloat(value.replace(',', '.'));
    return isNaN(num) ? null : num;
  }

  function isMapped(colIndex: number): boolean {
    return Object.values(mapping).includes(colIndex);
  }

  function getMappedField(colIndex: number): string {
    for (const [key, value] of Object.entries(mapping)) {
      if (value === colIndex) return key;
    }
    return '';
  }

  function isValidMapping(): boolean {
    return (
      mapping.nom >= 0 &&
      mapping.adresse >= 0 &&
      mapping.codePostal >= 0 &&
      mapping.ville >= 0
    );
  }
}

/**
 * Parse un fichier CSV
 */
async function parseCSV(file: File): Promise<ParsedData> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('Fichier vide');
  }

  // Detect delimiter
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';

  const parseRow = (line: string): string[] => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        cells.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current);
    return cells;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(parseRow);

  return { headers, rows };
}

/**
 * Parse un fichier Excel
 */
async function parseExcel(file: File): Promise<ParsedData> {
  // Dynamic import of xlsx library
  const XLSX = await import('xlsx');

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Get first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];

  if (data.length === 0) {
    throw new Error('Feuille vide');
  }

  const headers = (data[0] as unknown[]).map(String);
  const rows = data.slice(1).map(row => (row as unknown[]).map(String));

  return { headers, rows };
}

/**
 * Auto-mapping des colonnes
 */
function autoMapColumns(headers: string[]): ColumnMapping {
  const mapping = createEmptyMapping();

  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().trim();

    for (const [field, patterns] of Object.entries(COLUMN_PATTERNS)) {
      if ((mapping as any)[field] === -1) {
        for (const pattern of patterns) {
          if (pattern.test(normalized)) {
            (mapping as any)[field] = index;
            break;
          }
        }
      }
    }
  });

  return mapping;
}

/**
 * Crée un mapping vide
 */
function createEmptyMapping(): ColumnMapping {
  return {
    nom: -1,
    adresse: -1,
    codePostal: -1,
    ville: -1,
    type: -1,
    niveau: -1,
    telephone: -1,
    email: -1,
    contact: -1,
    commentaire: -1,
    lat: -1,
    lon: -1
  };
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
