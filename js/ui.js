/**
 * Module de l'Interface Utilisateur
 * @module ui
 */

const UI = (function() {
    'use strict';

    // Références aux éléments DOM
    const elements = {};
    
    // Pagination
    let currentPage = 0;
    const ITEMS_PER_PAGE = 50;

    /**
     * Initialise les références aux éléments DOM
     */
    function init() {
        elements.loadingOverlay = document.getElementById('loadingOverlay');
        elements.loadingText = elements.loadingOverlay?.querySelector('.loading-text');
        elements.loadingSubtext = elements.loadingOverlay?.querySelector('.loading-subtext');
        elements.resultsCount = document.getElementById('resultsCount');
        elements.resultsList = document.getElementById('resultsList');
        elements.searchInput = document.getElementById('searchInput');
        elements.domaineFilter = document.getElementById('domaineFilter');
        elements.niveauFilter = document.getElementById('niveauFilter');
        elements.resetBtn = document.getElementById('resetBtn');
        elements.exportCSV = document.getElementById('exportCSV');
        elements.exportJSON = document.getElementById('exportJSON');
        elements.exportPDF = document.getElementById('exportPDF');
        elements.inseeModal = document.getElementById('inseeModal');
    }

    /**
     * Affiche l'overlay de chargement
     * @param {string} text - Texte principal
     * @param {string} subtext - Sous-texte
     */
    function showLoading(text = 'Chargement...', subtext = '') {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.classList.remove('hidden');
            if (elements.loadingText) elements.loadingText.textContent = text;
            if (elements.loadingSubtext) elements.loadingSubtext.textContent = subtext;
        }
    }

    /**
     * Cache l'overlay de chargement
     */
    function hideLoading() {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.classList.add('hidden');
        }
    }

    /**
     * Met à jour le texte de chargement
     * @param {string} text - Texte principal
     * @param {string} subtext - Sous-texte
     */
    function updateLoadingText(text, subtext) {
        if (elements.loadingText) elements.loadingText.textContent = text;
        if (elements.loadingSubtext) elements.loadingSubtext.textContent = subtext;
    }

    /**
     * Met à jour le compteur de résultats
     * @param {number} count - Nombre de résultats
     */
    function updateResultsCount(count) {
        if (elements.resultsCount) {
            elements.resultsCount.innerHTML = `
                <i class="fas fa-map-marker-alt"></i> 
                <span>${count} lieu${count > 1 ? 'x' : ''} de stage trouvé${count > 1 ? 's' : ''}</span>
            `;
        }
    }

    /**
     * Met à jour la liste des résultats
     * @param {Array} data - Données filtrées
     * @param {Function} onFocus - Callback pour le bouton "Voir"
     */
    function updateResultsList(data, onFocus) {
        currentPage = 0;
        
        if (elements.resultsList) {
            renderResultsPage(data, 0);
            
            // Scroll infini
            elements.resultsList.onscroll = Utils.debounce(function() {
                if (elements.resultsList.scrollTop + elements.resultsList.clientHeight >= elements.resultsList.scrollHeight - 100) {
                    loadMoreResults(data);
                }
            }, 100);

            // Délégation d'événements pour les boutons "Voir"
            elements.resultsList.onclick = function(e) {
                const btn = e.target.closest('.btn-voir');
                if (btn && onFocus) {
                    const index = parseInt(btn.dataset.index);
                    onFocus(index);

                    // Highlight
                    document.querySelectorAll('.result-item').forEach(el => el.classList.remove('active'));
                    btn.closest('.result-item').classList.add('active');
                }
            };
        }
    }

    /**
     * Rend une page de résultats
     * @param {Array} data - Données
     * @param {number} page - Numéro de page
     */
    function renderResultsPage(data, page) {
        if (!elements.resultsList) return;

        if (page === 0) {
            elements.resultsList.innerHTML = '';
        }

        const start = page * ITEMS_PER_PAGE;
        const end = Math.min(start + ITEMS_PER_PAGE, data.length);

        const fragment = document.createDocumentFragment();

        for (let i = start; i < end; i++) {
            const item = data[i];
            const div = document.createElement('div');
            div.className = 'result-item';
            div.dataset.index = i;

            const niveauText = item.niveau || '-';
            const escapedNom = (item.nom || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

            div.innerHTML = `
                <div class="result-item-header">
                    <div class="result-item-name">${item.nom || 'Sans nom'}</div>
                    <div class="result-item-niveau">Niv. ${niveauText}</div>
                </div>
                <div class="result-item-ville"><i class="fas fa-map-marker-alt"></i> ${item.ville || ''}</div>
                <div class="result-item-type">${item.type || ''}</div>
                <div class="result-item-actions">
                    <button class="result-item-btn btn-voir" data-index="${i}" data-nom="${escapedNom}">
                        <i class="fas fa-eye"></i> Voir
                    </button>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((item.adresse || '') + ', ' + (item.codePostal || '') + ' ' + (item.ville || ''))}" target="_blank" class="result-item-btn btn-itineraire">
                        <i class="fas fa-route"></i> Y aller
                    </a>
                </div>
            `;

            fragment.appendChild(div);
        }

        elements.resultsList.appendChild(fragment);
    }

    /**
     * Charge plus de résultats (pagination)
     * @param {Array} data - Données
     */
    function loadMoreResults(data) {
        const nextPage = currentPage + 1;
        if (nextPage * ITEMS_PER_PAGE < data.length) {
            currentPage = nextPage;
            renderResultsPage(data, nextPage);
        }
    }

    /**
     * Remplit le select des domaines
     * @param {Array<string>} domaines - Liste des domaines
     */
    function populateDomainesFilter(domaines) {
        if (elements.domaineFilter) {
            // Garder l'option "Tous"
            elements.domaineFilter.innerHTML = '<option value="">Tous</option>';
            domaines.forEach(domaine => {
                const option = document.createElement('option');
                option.value = domaine;
                option.textContent = domaine;
                elements.domaineFilter.appendChild(option);
            });
        }
    }

    /**
     * Récupère les valeurs des filtres
     * @returns {Object}
     */
    function getFilterValues() {
        return {
            search: elements.searchInput?.value || '',
            domaine: elements.domaineFilter?.value || '',
            niveau: elements.niveauFilter?.value || ''
        };
    }

    /**
     * Réinitialise les filtres
     */
    function resetFilters() {
        if (elements.searchInput) elements.searchInput.value = '';
        if (elements.domaineFilter) elements.domaineFilter.value = '';
        if (elements.niveauFilter) elements.niveauFilter.value = '';
    }

    /**
     * Affiche le modal INSEE
     */
    function showInseeModal() {
        if (elements.inseeModal) {
            elements.inseeModal.classList.add('active');
            document.getElementById('inseeResults').style.display = 'none';
        }
    }

    /**
     * Cache le modal INSEE
     */
    function hideInseeModal() {
        if (elements.inseeModal) {
            elements.inseeModal.classList.remove('active');
        }
    }

    /**
     * Crée le contenu HTML d'un popup
     * @param {Object} item - Données du lieu
     * @param {number} index - Index
     * @returns {string} HTML
     */
    function createPopupContent(item, index) {
        const emailHtml = item.email 
            ? `<div class="popup-info"><i class="fas fa-envelope"></i> <a href="mailto:${item.email}">${item.email}</a></div>` 
            : '';
        const commentHtml = item.commentaire 
            ? `<div class="popup-comment"><i class="fas fa-comment-dots"></i> ${item.commentaire}</div>` 
            : '';
        const niveauText = item.niveau || 'Non défini';
        
        const regeocodeBtn = index !== undefined 
            ? `<button onclick="App.regeocodeItem(${index})" class="popup-btn" style="background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:white;margin-top:8px;width:100%;">
                <i class="fas fa-crosshairs"></i> Améliorer position GPS
               </button>`
            : '';

        return `
            <div class="custom-popup">
                <div class="popup-header">${item.nom || 'Sans nom'}</div>
                <div class="popup-address"><i class="fas fa-location-dot"></i> ${item.adresse || ''}, ${item.codePostal || ''} ${item.ville || ''}</div>
                <div class="popup-type"><i class="fas fa-utensils"></i> ${item.type || ''}</div>
                <div class="popup-info"><i class="fas fa-user"></i> <strong>Contact :</strong> ${item.contact || 'Non renseigné'}</div>
                <div class="popup-info"><i class="fas fa-phone"></i> <strong>Tél :</strong> ${item.telephone || 'Non renseigné'}</div>
                ${emailHtml}
                <div class="popup-info"><i class="fas fa-star"></i> <strong>Niveau :</strong> ${niveauText}</div>
                ${commentHtml}
                <div class="popup-actions">
                    <a href="tel:${(item.telephone || '').replace(/\s/g, '')}" class="popup-btn popup-btn-tel">
                        <i class="fas fa-phone"></i> Appeler
                    </a>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((item.adresse || '') + ', ' + (item.codePostal || '') + ' ' + (item.ville || ''))}" target="_blank" class="popup-btn popup-btn-itineraire">
                        <i class="fas fa-route"></i> Itinéraire
                    </a>
                </div>
                ${regeocodeBtn}
            </div>
        `;
    }

    /**
     * Affiche une alerte
     * @param {string} message - Message
     */
    function showAlert(message) {
        alert(message);
    }

    /**
     * Affiche une confirmation
     * @param {string} message - Message
     * @returns {boolean}
     */
    function showConfirm(message) {
        return confirm(message);
    }

    /**
     * Retourne les éléments DOM
     * @returns {Object}
     */
    function getElements() {
        return elements;
    }

    // API publique
    return {
        init,
        showLoading,
        hideLoading,
        updateLoadingText,
        updateResultsCount,
        updateResultsList,
        populateDomainesFilter,
        getFilterValues,
        resetFilters,
        showInseeModal,
        hideInseeModal,
        createPopupContent,
        showAlert,
        showConfirm,
        getElements
    };
})();

// Export global
window.UI = UI;
