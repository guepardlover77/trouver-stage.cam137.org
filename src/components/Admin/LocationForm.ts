// ============================================================================
// Formulaire d'ajout/modification de lieu de stage
// ============================================================================

import type { Location } from '../../types';
import { geocodeAddress, autocompleteAddress } from '../../services/geocoding.service';
import { findSimilarLocations, getAllLocations } from '../../services/data.service';
import { store } from '../../store';

interface AddressSuggestion {
  label: string;
  lat: number;
  lon: number;
  type: string;
}

export interface LocationFormOptions {
  location?: Location;
  index?: number;
  onSave: (location: Location, index?: number) => void;
  onCancel: () => void;
}

/**
 * Crée le formulaire d'ajout/modification
 */
export function createLocationForm(container: HTMLElement, options: LocationFormOptions): void {
  const { location, index, onSave, onCancel } = options;
  const isEdit = index !== undefined;
  const types = store.uniqueTypes;

  container.innerHTML = `
    <form class="admin-location-form" id="locationForm">
      <h3 class="admin-form-title">
        <i class="fas fa-${isEdit ? 'edit' : 'plus-circle'}"></i>
        ${isEdit ? 'Modifier le lieu' : 'Ajouter un nouveau lieu'}
      </h3>

      <div class="admin-form-section">
        <h4><i class="fas fa-building"></i> Informations générales</h4>

        <div class="admin-form-row">
          <div class="admin-form-group admin-form-group-large">
            <label for="nom">Nom de l'établissement *</label>
            <input type="text" id="nom" name="nom" class="admin-input" required
                   value="${escapeHtml(location?.nom || '')}"
                   placeholder="Ex: Restaurant Le Bon Goût">
            <span class="admin-form-error" id="nomError"></span>
          </div>
          <div class="admin-form-group">
            <label for="type">Type d'établissement *</label>
            <select id="type" name="type" class="admin-input" required>
              <option value="">-- Sélectionner --</option>
              ${types.map(t => `<option value="${escapeHtml(t)}" ${location?.type === t ? 'selected' : ''}>${escapeHtml(t)}</option>`).join('')}
              <option value="__autre__">Autre (saisir)</option>
            </select>
            <input type="text" id="typeAutre" class="admin-input admin-input-autre" style="display: none;"
                   placeholder="Saisir le nouveau type">
          </div>
        </div>

        <div class="admin-form-row">
          <div class="admin-form-group">
            <label for="niveau">Niveau</label>
            <select id="niveau" name="niveau" class="admin-input">
              <option value="">-- Non spécifié --</option>
              <option value="1" ${location?.niveau === '1' ? 'selected' : ''}>Niveau 1</option>
              <option value="2" ${location?.niveau === '2' ? 'selected' : ''}>Niveau 2</option>
              <option value="3" ${location?.niveau === '3' ? 'selected' : ''}>Niveau 3</option>
              <option value="4" ${location?.niveau === '4' ? 'selected' : ''}>Niveau 4</option>
              <option value="5" ${location?.niveau === '5' ? 'selected' : ''}>Niveau 5</option>
            </select>
          </div>
        </div>
      </div>

      <div class="admin-form-section">
        <h4><i class="fas fa-map-marker-alt"></i> Adresse</h4>

        <div class="admin-form-group admin-address-autocomplete">
          <label for="adresse">Adresse *</label>
          <div class="admin-autocomplete-wrapper">
            <input type="text" id="adresse" name="adresse" class="admin-input" required
                   value="${escapeHtml(location?.adresse || '')}"
                   placeholder="Commencez à taper une adresse..."
                   autocomplete="off">
            <div class="admin-autocomplete-spinner" id="autocompleteSpinner" style="display: none;">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
            <ul class="admin-autocomplete-list" id="autocompleteList"></ul>
          </div>
          <small class="admin-form-hint">L'adresse sera auto-complétée et les coordonnées GPS seront récupérées automatiquement</small>
        </div>

        <div class="admin-form-row">
          <div class="admin-form-group">
            <label for="codePostal">Code postal *</label>
            <input type="text" id="codePostal" name="codePostal" class="admin-input" required
                   value="${escapeHtml(location?.codePostal || '')}"
                   pattern="[0-9]{5}" maxlength="5"
                   placeholder="Ex: 79200">
            <span class="admin-form-error" id="codePostalError"></span>
          </div>
          <div class="admin-form-group admin-form-group-large">
            <label for="ville">Ville *</label>
            <input type="text" id="ville" name="ville" class="admin-input" required
                   value="${escapeHtml(location?.ville || '')}"
                   placeholder="Ex: Parthenay">
          </div>
        </div>

        <div class="admin-form-row admin-form-coords" id="coordsSection">
          <div class="admin-form-group">
            <label for="lat">Latitude</label>
            <input type="number" id="lat" name="lat" class="admin-input admin-coord-input"
                   value="${location?.lat ?? ''}"
                   step="0.000001" min="-90" max="90"
                   placeholder="46.6453">
          </div>
          <div class="admin-form-group">
            <label for="lon">Longitude</label>
            <input type="number" id="lon" name="lon" class="admin-input admin-coord-input"
                   value="${location?.lon ?? ''}"
                   step="0.000001" min="-180" max="180"
                   placeholder="-0.2489">
          </div>
          <div class="admin-form-group admin-form-group-btn">
            <button type="button" class="admin-btn admin-btn-secondary" id="geocodeBtn">
              <i class="fas fa-crosshairs"></i> Géocoder
            </button>
          </div>
        </div>
        <div class="admin-geocode-result" id="geocodeResult" style="display: none;"></div>
      </div>

      <div class="admin-form-section">
        <h4><i class="fas fa-address-book"></i> Contact</h4>

        <div class="admin-form-row">
          <div class="admin-form-group">
            <label for="telephone">Téléphone</label>
            <input type="tel" id="telephone" name="telephone" class="admin-input"
                   value="${escapeHtml(location?.telephone || '')}"
                   placeholder="Ex: 05 49 94 00 00">
            <span class="admin-form-error" id="telephoneError"></span>
          </div>
          <div class="admin-form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" class="admin-input"
                   value="${escapeHtml(location?.email || '')}"
                   placeholder="Ex: contact@restaurant.fr">
            <span class="admin-form-error" id="emailError"></span>
          </div>
        </div>

        <div class="admin-form-group">
          <label for="contact">Nom du contact</label>
          <input type="text" id="contact" name="contact" class="admin-input"
                 value="${escapeHtml(location?.contact || '')}"
                 placeholder="Ex: M. Dupont">
        </div>
      </div>

      <div class="admin-form-section">
        <h4><i class="fas fa-comment"></i> Notes</h4>

        <div class="admin-form-group">
          <label for="commentaire">Commentaire</label>
          <textarea id="commentaire" name="commentaire" class="admin-input admin-textarea"
                    rows="3" placeholder="Informations complémentaires...">${escapeHtml(location?.commentaire || '')}</textarea>
        </div>
      </div>

      <div class="admin-form-duplicates" id="duplicatesWarning" style="display: none;">
        <i class="fas fa-exclamation-triangle"></i>
        <span>Lieux similaires détectés :</span>
        <ul id="duplicatesList"></ul>
      </div>

      <div class="admin-form-actions">
        <button type="button" class="admin-btn admin-btn-cancel" id="cancelBtn">
          <i class="fas fa-times"></i> Annuler
        </button>
        <button type="submit" class="admin-btn admin-btn-primary" id="saveBtn">
          <i class="fas fa-save"></i> ${isEdit ? 'Enregistrer' : 'Ajouter'}
        </button>
      </div>
    </form>
  `;

  const form = container.querySelector('#locationForm') as HTMLFormElement;
  const typeSelect = form.querySelector('#type') as HTMLSelectElement;
  const typeAutre = form.querySelector('#typeAutre') as HTMLInputElement;
  const geocodeBtn = form.querySelector('#geocodeBtn') as HTMLButtonElement;
  const geocodeResult = form.querySelector('#geocodeResult') as HTMLElement;
  const nomInput = form.querySelector('#nom') as HTMLInputElement;
  const villeInput = form.querySelector('#ville') as HTMLInputElement;
  const duplicatesWarning = form.querySelector('#duplicatesWarning') as HTMLElement;
  const duplicatesList = form.querySelector('#duplicatesList') as HTMLUListElement;
  const cancelBtn = form.querySelector('#cancelBtn') as HTMLButtonElement;

  // Autocomplete elements
  const adresseInput = form.querySelector('#adresse') as HTMLInputElement;
  const autocompleteList = form.querySelector('#autocompleteList') as HTMLUListElement;
  const autocompleteSpinner = form.querySelector('#autocompleteSpinner') as HTMLElement;
  const coordsSection = form.querySelector('#coordsSection') as HTMLElement;
  const latInput = form.querySelector('#lat') as HTMLInputElement;
  const lonInput = form.querySelector('#lon') as HTMLInputElement;
  const codePostalInput = form.querySelector('#codePostal') as HTMLInputElement;

  let currentSuggestions: AddressSuggestion[] = [];
  let selectedIndex = -1;

  // Type "Autre" handling
  typeSelect.addEventListener('change', () => {
    if (typeSelect.value === '__autre__') {
      typeAutre.style.display = 'block';
      typeAutre.required = true;
      typeAutre.focus();
    } else {
      typeAutre.style.display = 'none';
      typeAutre.required = false;
      typeAutre.value = '';
    }
  });

  // ============================================================================
  // Address Autocomplete
  // ============================================================================

  const showAutocompleteList = () => {
    autocompleteList.classList.add('visible');
  };

  const hideAutocompleteList = () => {
    autocompleteList.classList.remove('visible');
    selectedIndex = -1;
  };

  const updateAutocompleteList = (suggestions: AddressSuggestion[]) => {
    currentSuggestions = suggestions;
    selectedIndex = -1;

    if (suggestions.length === 0) {
      hideAutocompleteList();
      return;
    }

    autocompleteList.innerHTML = suggestions.map((s, i) => `
      <li class="admin-autocomplete-item" data-index="${i}">
        <i class="fas fa-map-marker-alt"></i>
        <span>${escapeHtml(s.label)}</span>
      </li>
    `).join('');

    showAutocompleteList();
  };

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    // Parse the label to extract address components
    // Format: "numero rue, code_postal ville" or "lieu-dit, code_postal ville"
    const parts = suggestion.label.split(',');
    let adresse = '';
    let codePostal = '';
    let ville = '';

    if (parts.length >= 2) {
      adresse = parts[0].trim();
      // The last part usually contains "code_postal ville"
      const lastPart = parts[parts.length - 1].trim();
      const cpMatch = lastPart.match(/^(\d{5})\s+(.+)$/);
      if (cpMatch) {
        codePostal = cpMatch[1];
        ville = cpMatch[2];
      } else {
        ville = lastPart;
      }
    } else {
      adresse = suggestion.label;
    }

    // Update form fields
    adresseInput.value = adresse;
    if (codePostal) codePostalInput.value = codePostal;
    if (ville) villeInput.value = ville;

    // Update coordinates with animation
    updateCoordsWithAnimation(suggestion.lat, suggestion.lon);

    hideAutocompleteList();
  };

  const updateCoordsWithAnimation = (lat: number, lon: number) => {
    // Add animation class
    coordsSection.classList.add('coords-updating');
    latInput.classList.add('coord-flash');
    lonInput.classList.add('coord-flash');

    // Update values
    latInput.value = lat.toFixed(6);
    lonInput.value = lon.toFixed(6);

    // Show success message
    geocodeResult.innerHTML = `<i class="fas fa-check-circle"></i> Coordonnées GPS récupérées automatiquement`;
    geocodeResult.className = 'admin-geocode-result success';
    geocodeResult.style.display = 'flex';

    // Remove animation class after animation completes
    setTimeout(() => {
      coordsSection.classList.remove('coords-updating');
      latInput.classList.remove('coord-flash');
      lonInput.classList.remove('coord-flash');
    }, 600);
  };

  // Debounced autocomplete search
  const searchAutocomplete = debounce(async (query: string) => {
    if (query.length < 3) {
      hideAutocompleteList();
      autocompleteSpinner.style.display = 'none';
      return;
    }

    autocompleteSpinner.style.display = 'flex';

    try {
      const suggestions = await autocompleteAddress(query);
      updateAutocompleteList(suggestions);
    } catch (error) {
      console.error('Autocomplete error:', error);
      hideAutocompleteList();
    }

    autocompleteSpinner.style.display = 'none';
  }, 300);

  // Input event for autocomplete
  adresseInput.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value;
    searchAutocomplete(query);
  });

  // Keyboard navigation
  adresseInput.addEventListener('keydown', (e) => {
    if (!autocompleteList.classList.contains('visible')) return;

    const items = autocompleteList.querySelectorAll('.admin-autocomplete-item');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && currentSuggestions[selectedIndex]) {
          selectSuggestion(currentSuggestions[selectedIndex]);
        }
        return;
      case 'Escape':
        hideAutocompleteList();
        return;
      default:
        return;
    }

    // Update visual selection
    items.forEach((item, i) => {
      item.classList.toggle('selected', i === selectedIndex);
    });
  });

  // Click on suggestion
  autocompleteList.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.admin-autocomplete-item');
    if (item) {
      const index = parseInt(item.getAttribute('data-index') || '0', 10);
      if (currentSuggestions[index]) {
        selectSuggestion(currentSuggestions[index]);
      }
    }
  });

  // Hide autocomplete on blur (with delay to allow click)
  adresseInput.addEventListener('blur', () => {
    setTimeout(hideAutocompleteList, 200);
  });

  // Show autocomplete on focus if there's content
  adresseInput.addEventListener('focus', () => {
    if (adresseInput.value.length >= 3 && currentSuggestions.length > 0) {
      showAutocompleteList();
    }
  });

  // ============================================================================
  // Manual Geocoding Button
  // ============================================================================

  geocodeBtn.addEventListener('click', async () => {
    const adresse = adresseInput.value.trim();
    const codePostal = codePostalInput.value.trim();
    const ville = villeInput.value.trim();

    if (!adresse || !codePostal || !ville) {
      geocodeResult.innerHTML = '<i class="fas fa-exclamation-circle"></i> Remplissez l\'adresse, le code postal et la ville';
      geocodeResult.className = 'admin-geocode-result error';
      geocodeResult.style.display = 'flex';
      return;
    }

    geocodeBtn.disabled = true;
    geocodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recherche...';
    geocodeResult.style.display = 'none';

    try {
      const result = await geocodeAddress(adresse, codePostal, ville);
      if (result) {
        updateCoordsWithAnimation(result.lat, result.lon);
        geocodeResult.innerHTML = `<i class="fas fa-check-circle"></i> Coordonnées trouvées (confiance: ${Math.round(result.confidence * 100)}%)`;
        geocodeResult.className = 'admin-geocode-result success';
      } else {
        geocodeResult.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Adresse non trouvée. Vérifiez ou saisissez les coordonnées manuellement.';
        geocodeResult.className = 'admin-geocode-result warning';
      }
    } catch (error) {
      geocodeResult.innerHTML = '<i class="fas fa-times-circle"></i> Erreur lors du géocodage';
      geocodeResult.className = 'admin-geocode-result error';
    }

    geocodeResult.style.display = 'flex';
    geocodeBtn.disabled = false;
    geocodeBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Géocoder';
  });

  // Duplicate detection
  const checkDuplicates = debounce(() => {
    const nom = nomInput.value.trim();
    const ville = villeInput.value.trim();

    if (nom.length < 3) {
      duplicatesWarning.style.display = 'none';
      return;
    }

    const similar = findSimilarLocations({ nom, ville });
    // Filter out current location if editing
    const filtered = isEdit ? similar.filter(i => i !== index) : similar;

    if (filtered.length > 0) {
      const locations = getAllLocations();
      duplicatesList.innerHTML = filtered.slice(0, 3).map(i => {
        const loc = locations[i];
        return `<li>${escapeHtml(loc.nom)} - ${escapeHtml(loc.ville)} (${loc.codePostal})</li>`;
      }).join('');
      duplicatesWarning.style.display = 'flex';
    } else {
      duplicatesWarning.style.display = 'none';
    }
  }, 500);

  nomInput.addEventListener('input', checkDuplicates);
  villeInput.addEventListener('input', checkDuplicates);

  // Validation
  const validateField = (field: HTMLInputElement, errorId: string, validator: (value: string) => string | null) => {
    const error = validator(field.value.trim());
    const errorEl = form.querySelector(`#${errorId}`) as HTMLElement;
    if (error) {
      field.classList.add('error');
      errorEl.textContent = error;
      errorEl.style.display = 'block';
      return false;
    } else {
      field.classList.remove('error');
      errorEl.style.display = 'none';
      return true;
    }
  };

  // Real-time validation
  codePostalInput.addEventListener('blur', () => {
    validateField(codePostalInput, 'codePostalError', (value) => {
      if (!/^\d{5}$/.test(value)) return 'Le code postal doit contenir 5 chiffres';
      return null;
    });
  });

  const telephoneInput = form.querySelector('#telephone') as HTMLInputElement;
  telephoneInput.addEventListener('blur', () => {
    validateField(telephoneInput, 'telephoneError', (value) => {
      if (value && !/^[\d\s.+-]{10,}$/.test(value.replace(/\s/g, ''))) {
        return 'Format de téléphone invalide';
      }
      return null;
    });
  });

  const emailInput = form.querySelector('#email') as HTMLInputElement;
  emailInput.addEventListener('blur', () => {
    validateField(emailInput, 'emailError', (value) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Format d\'email invalide';
      }
      return null;
    });
  });

  // Cancel
  cancelBtn.addEventListener('click', () => {
    onCancel();
  });

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate required fields
    let valid = true;

    valid = validateField(nomInput, 'nomError', (v) => v ? null : 'Le nom est obligatoire') && valid;
    valid = validateField(codePostalInput, 'codePostalError', (v) => {
      if (!v) return 'Le code postal est obligatoire';
      if (!/^\d{5}$/.test(v)) return 'Le code postal doit contenir 5 chiffres';
      return null;
    }) && valid;

    // Get type value
    let typeValue = typeSelect.value;
    if (typeValue === '__autre__') {
      typeValue = typeAutre.value.trim();
      if (!typeValue) {
        valid = false;
        typeAutre.classList.add('error');
      }
    }

    if (!valid) {
      return;
    }

    const newLocation: Location = {
      nom: nomInput.value.trim(),
      adresse: adresseInput.value.trim(),
      codePostal: codePostalInput.value.trim(),
      ville: villeInput.value.trim(),
      type: typeValue,
      niveau: (form.querySelector('#niveau') as HTMLSelectElement).value,
      telephone: telephoneInput.value.trim(),
      email: emailInput.value.trim(),
      contact: (form.querySelector('#contact') as HTMLInputElement).value.trim(),
      commentaire: (form.querySelector('#commentaire') as HTMLTextAreaElement).value.trim(),
      lat: latInput.value ? parseFloat(latInput.value) : null,
      lon: lonInput.value ? parseFloat(lonInput.value) : null
    };

    onSave(newLocation, index);
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
 * Debounce
 */
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
