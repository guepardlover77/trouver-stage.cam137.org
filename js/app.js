/**
 * Application Principale - Carte des Lieux de Stage
 * @module app
 * 
 * Point d'entrée de l'application. Coordonne tous les modules.
 */

const App = (function() {
    'use strict';

    // État de l'application
    let isInitialLoad = true;

    /**
     * Initialise l'application
     */
    async function init() {
        console.log('🚀 Initialisation de l\'application...');

        // Initialiser l'UI
        UI.init();
        UI.showLoading('Chargement de la carte...', 'Préparation des lieux de stage');

        try {
            // Charger les données depuis le fichier JSON externe
            await DataManager.loadFromFile('js/data.json');
            console.log(`📊 ${DataManager.getCount()} lieux chargés`);

            // Initialiser la carte
            MapManager.init('map');
            MapManager.setPopupCallback(UI.createPopupContent);
            MapManager.createAllMarkers(DataManager.getAll());

            // Remplir les filtres
            UI.populateDomainesFilter(DataManager.getUniqueTypes());

            // Afficher les marqueurs
            refreshDisplay();

            // Configurer les événements
            setupEventListeners();

            // Cacher le chargement
            setTimeout(() => UI.hideLoading(), 300);

            console.log('✅ Application initialisée');

        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            UI.updateLoadingText('Erreur de chargement', error.message);
        }
    }

    /**
     * Configure les écouteurs d'événements
     */
    function setupEventListeners() {
        const elements = UI.getElements();

        // Recherche avec debounce
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', Utils.debounce(refreshDisplay, 300));
        }

        // Filtres
        if (elements.domaineFilter) {
            elements.domaineFilter.addEventListener('change', refreshDisplay);
        }
        if (elements.niveauFilter) {
            elements.niveauFilter.addEventListener('change', refreshDisplay);
        }

        // Reset
        if (elements.resetBtn) {
            elements.resetBtn.addEventListener('click', resetFilters);
        }

        // Export
        if (elements.exportCSV) {
            elements.exportCSV.addEventListener('click', () => Export.toCSV(DataManager.getFiltered()));
        }
        if (elements.exportJSON) {
            elements.exportJSON.addEventListener('click', () => Export.toJSON(DataManager.getFiltered()));
        }
        if (elements.exportPDF) {
            elements.exportPDF.addEventListener('click', () => Export.toPDF(DataManager.getFiltered()));
        }

        // Modal INSEE - fermer en cliquant en dehors
        if (elements.inseeModal) {
            elements.inseeModal.addEventListener('click', (e) => {
                if (e.target === elements.inseeModal) {
                    UI.hideInseeModal();
                }
            });
        }
    }

    /**
     * Rafraîchit l'affichage (marqueurs + liste)
     */
    function refreshDisplay() {
        const filters = UI.getFilterValues();
        const indices = DataManager.filter(filters);
        const filteredData = DataManager.getFiltered();

        // Mettre à jour les marqueurs
        MapManager.updateMarkers(indices, filters.domaine);

        // Ajuster la vue au premier chargement
        if (isInitialLoad && filteredData.length > 0) {
            MapManager.fitBounds(indices);
            isInitialLoad = false;
        }

        // Mettre à jour l'UI
        UI.updateResultsCount(filteredData.length);
        UI.updateResultsList(filteredData, focusOnItem);
    }

    /**
     * Réinitialise les filtres
     */
    function resetFilters() {
        UI.resetFilters();
        isInitialLoad = true;
        refreshDisplay();
    }

    /**
     * Focus sur un élément de la liste
     * @param {number} index - Index dans les données filtrées
     */
    function focusOnItem(index) {
        const filteredData = DataManager.getFiltered();
        if (index >= 0 && index < filteredData.length) {
            const item = filteredData[index];
            // Trouver l'index réel dans allData
            const allData = DataManager.getAll();
            const realIndex = allData.findIndex(d => d === item);
            if (realIndex >= 0) {
                MapManager.focusOnMarker(realIndex);
            }
        }
    }

    /**
     * Re-géocode un lieu et met à jour l'affichage
     * @param {number} index - Index dans allData
     */
    async function regeocodeItem(index) {
        const item = DataManager.getByIndex(index);
        if (!item) return;

        const oldCoords = `[${item.lat?.toFixed(4) || 'N/A'}, ${item.lon?.toFixed(4) || 'N/A'}]`;

        const result = await Geocoding.geocodeAddress(item.adresse, item.codePostal, item.ville);

        if (result) {
            // Mettre à jour les données
            DataManager.updateItem(index, { lat: result.lat, lon: result.lon });

            // Mettre à jour le marqueur
            MapManager.updateMarkerPosition(index, result.lat, result.lon);
            MapManager.refreshPopup(index);

            const newCoords = `[${result.lat.toFixed(4)}, ${result.lon.toFixed(4)}]`;
            UI.showAlert(`✅ Position mise à jour !\n\nAvant: ${oldCoords}\nAprès: ${newCoords}\nSource: ${result.source}`);

            refreshDisplay();
        } else {
            UI.showAlert(`❌ Impossible de géolocaliser cette adresse.\nVérifiez que l'adresse est correcte.`);
        }
    }

    /**
     * Re-géocode tous les lieux sans coordonnées
     */
    async function regeocodeAllMissing() {
        const indices = DataManager.getItemsWithoutCoords();

        if (indices.length === 0) {
            UI.showAlert('Tous les lieux ont déjà des coordonnées GPS.');
            return;
        }

        const confirmed = UI.showConfirm(
            `${indices.length} lieu(x) sans coordonnées GPS détecté(s).\n\n` +
            `Voulez-vous les géolocaliser via l'API Base Adresse Nationale ?\n\n` +
            `⚠️ Cette opération peut prendre quelques secondes.`
        );

        if (!confirmed) return;

        UI.showLoading('Géocodage en cours...', '');

        let success = 0;
        let failed = 0;

        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            const item = DataManager.getByIndex(index);

            UI.updateLoadingText('Géocodage en cours...', `${i + 1}/${indices.length} - ${item.nom}`);

            const result = await Geocoding.geocodeAddress(item.adresse, item.codePostal, item.ville);

            if (result) {
                DataManager.updateItem(index, { lat: result.lat, lon: result.lon });
                MapManager.updateMarkerPosition(index, result.lat, result.lon);
                success++;
            } else {
                failed++;
            }

            // Petit délai pour ne pas surcharger l'API
            await new Promise(r => setTimeout(r, 200));
        }

        refreshDisplay();
        UI.hideLoading();

        UI.showAlert(
            `Géocodage terminé !\n\n` +
            `✅ Réussi: ${success}\n` +
            `❌ Échoué: ${failed}\n\n` +
            `Les lieux ont été mis à jour sur la carte.`
        );
    }

    /**
     * Ouvre le modal INSEE
     */
    function openInseeModal() {
        UI.showInseeModal();
    }

    /**
     * Ferme le modal INSEE
     */
    function closeInseeModal() {
        UI.hideInseeModal();
    }

    /**
     * Lance une recherche INSEE
     */
    async function searchInsee() {
        const departement = document.getElementById('inseeDepartement').value;
        const activite = document.getElementById('inseeActivite').value;
        const ville = document.getElementById('inseeVille').value;

        const searchBtn = document.getElementById('inseeSearchBtn');
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recherche...';

        try {
            const results = await INSEE.search({ departement, activite, ville });
            displayInseeResults(results);
        } catch (error) {
            console.error('Erreur recherche INSEE:', error);
            UI.showAlert('Erreur de connexion à l\'API INSEE.');
        } finally {
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Rechercher';
        }
    }

    /**
     * Affiche les résultats INSEE
     * @param {Array} entreprises - Résultats
     */
    function displayInseeResults(entreprises) {
        const resultsDiv = document.getElementById('inseeResults');
        const listDiv = document.getElementById('inseeResultsList');

        resultsDiv.style.display = 'block';

        if (entreprises.length === 0) {
            listDiv.innerHTML = '<p style="color: #666; font-style: italic;">Aucun résultat trouvé.</p>';
            return;
        }

        listDiv.innerHTML = `<p style="color: #1e3a8a; font-weight: 600; margin-bottom: 10px;">${entreprises.length} entreprise(s) trouvée(s)</p>`;

        entreprises.forEach((entreprise, index) => {
            const siege = entreprise.siege || {};
            const enseignes = siege.liste_enseignes || [];
            const nom = enseignes[0] || entreprise.nom_complet || 'Établissement sans nom';
            const adresse = siege.geo_adresse || siege.adresse || '';
            const villeEtab = siege.libelle_commune || '';

            // Vérifier si déjà présent
            const dejaPresent = DataManager.exists({ nom, ville: villeEtab });

            const div = document.createElement('div');
            div.className = 'insee-result-item';
            div.innerHTML = `
                <div class="insee-result-info">
                    <div class="insee-result-name">${nom}</div>
                    <div class="insee-result-address">${adresse}</div>
                </div>
                <button class="insee-add-btn" data-index="${index}" ${dejaPresent ? 'disabled' : ''}>
                    ${dejaPresent ? '<i class="fas fa-check"></i> Existe' : '<i class="fas fa-plus"></i> Ajouter'}
                </button>
            `;

            // Event listener pour le bouton
            const btn = div.querySelector('.insee-add-btn');
            if (!dejaPresent) {
                btn.addEventListener('click', () => addFromInsee(index));
            }

            listDiv.appendChild(div);
        });
    }

    /**
     * Ajoute une entreprise depuis les résultats INSEE
     * @param {number} index - Index dans les résultats
     */
    async function addFromInsee(index) {
        const results = INSEE.getLastResults();
        if (!results[index]) return;

        // Désactiver le bouton
        const buttons = document.querySelectorAll('.insee-add-btn');
        const btn = buttons[index];
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }

        try {
            // Formater les données
            const newItem = await INSEE.formatEntreprise(results[index]);

            // Ajouter aux données
            const newIndex = DataManager.addItem(newItem);

            // Créer le marqueur
            if (newItem.lat && newItem.lon) {
                MapManager.createAllMarkers(DataManager.getAll());
            }

            // Rafraîchir l'affichage
            refreshDisplay();

            // Mettre à jour le bouton
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check"></i> Ajouté!';
            }

            UI.showAlert(
                `"${newItem.nom}" a été ajouté à la carte !\n\n` +
                `N'oubliez pas de compléter :\n` +
                `- Niveau de compétences\n` +
                `- Téléphone\n` +
                `- Contact\n` +
                `- Email`
            );

        } catch (error) {
            console.error('Erreur ajout INSEE:', error);
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-plus"></i> Ajouter';
            }
            UI.showAlert('Erreur lors de l\'ajout.');
        }
    }

    // API publique
    return {
        init,
        refreshDisplay,
        resetFilters,
        focusOnItem,
        regeocodeItem,
        regeocodeAllMissing,
        openInseeModal,
        closeInseeModal,
        searchInsee,
        addFromInsee
    };
})();

// Export global
window.App = App;

// Démarrer l'application au chargement du DOM
document.addEventListener('DOMContentLoaded', App.init);
