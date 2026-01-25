/**
 * Module de Gestion des Données
 * @module data
 */

const DataManager = (function() {
    'use strict';

    // Données
    let allData = [];
    let filteredData = [];
    let searchIndex = [];

    /**
     * Charge les données depuis un élément script embarqué ou un fichier externe
     * @param {string} sourceId - ID de l'élément script contenant les données JSON
     * @returns {Promise<Array>}
     */
    async function loadFromEmbedded(sourceId) {
        try {
            const dataScript = document.getElementById(sourceId);
            
            // Si le script a du contenu, l'utiliser
            if (dataScript && dataScript.textContent.trim()) {
                allData = JSON.parse(dataScript.textContent);
                buildSearchIndex();
                return allData;
            }
            
            // Sinon, charger depuis le fichier externe
            return await loadFromFile('js/data.json');
        } catch (error) {
            console.error('Erreur chargement données embarquées:', error);
            // Essayer le fichier externe en fallback
            return await loadFromFile('js/data.json');
        }
    }

    /**
     * Charge les données depuis un fichier JSON externe ou la variable globale
     * @param {string} url - URL du fichier JSON (optionnel, fallback sur STAGE_DATA)
     * @returns {Promise<Array>}
     */
    async function loadFromFile(url) {
        // Essayer d'utiliser la variable globale STAGE_DATA (fonctionne avec file://)
        if (typeof STAGE_DATA !== 'undefined' && Array.isArray(STAGE_DATA)) {
            console.log('📂 Chargement depuis STAGE_DATA');
            allData = STAGE_DATA;
            buildSearchIndex();
            return allData;
        }
        
        // Sinon essayer fetch (fonctionne avec serveur HTTP)
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            allData = await response.json();
            buildSearchIndex();
            return allData;
        } catch (error) {
            console.error('Erreur chargement fichier:', error);
            return [];
        }
    }

    /**
     * Construit l'index de recherche pour des recherches rapides
     */
    function buildSearchIndex() {
        searchIndex = allData.map((item, index) => ({
            index: index,
            searchText: Utils.normalizeText([
                item.nom,
                item.ville,
                item.adresse,
                item.codePostal,
                item.contact,
                item.type
            ].join(' '))
        }));
    }

    /**
     * Filtre les données selon les critères
     * @param {Object} filters - Critères de filtrage
     * @param {string} filters.search - Texte de recherche
     * @param {string} filters.domaine - Type/domaine
     * @param {string} filters.niveau - Niveau de compétences
     * @returns {Array<number>} Indices des éléments correspondants
     */
    function filter(filters) {
        const { search, domaine, niveau } = filters;
        const searchTerm = Utils.normalizeText(search || '');

        // Si pas de filtre, retourner tout
        if (!searchTerm && !domaine && !niveau) {
            filteredData = [...allData];
            return allData.map((_, i) => i);
        }

        const results = [];

        for (let i = 0; i < allData.length; i++) {
            const item = allData[i];

            // Filtre domaine
            if (domaine && item.type !== domaine) continue;

            // Filtre niveau
            if (niveau && !Utils.niveauMatches(item.niveau, niveau)) continue;

            // Filtre recherche
            if (searchTerm) {
                const searchData = searchIndex[i];
                if (!searchData.searchText.includes(searchTerm)) continue;
            }

            results.push(i);
        }

        filteredData = results.map(i => allData[i]);
        return results;
    }

    /**
     * Retourne tous les types/domaines uniques
     * @returns {Array<string>}
     */
    function getUniqueTypes() {
        return [...new Set(allData.map(item => item.type))].filter(Boolean).sort();
    }

    /**
     * Retourne toutes les villes uniques
     * @returns {Array<string>}
     */
    function getUniqueVilles() {
        return [...new Set(allData.map(item => item.ville))].filter(Boolean).sort();
    }

    /**
     * Ajoute un nouveau lieu
     * @param {Object} item - Données du lieu
     * @returns {number} Index du nouvel élément
     */
    function addItem(item) {
        const newIndex = allData.length;
        allData.push(item);
        
        // Mettre à jour l'index de recherche
        searchIndex.push({
            index: newIndex,
            searchText: Utils.normalizeText([
                item.nom,
                item.ville,
                item.adresse,
                item.codePostal,
                item.contact,
                item.type
            ].join(' '))
        });

        return newIndex;
    }

    /**
     * Met à jour un lieu existant
     * @param {number} index - Index de l'élément
     * @param {Object} updates - Champs à mettre à jour
     */
    function updateItem(index, updates) {
        if (index >= 0 && index < allData.length) {
            Object.assign(allData[index], updates);
            
            // Reconstruire l'entrée de l'index de recherche
            searchIndex[index] = {
                index: index,
                searchText: Utils.normalizeText([
                    allData[index].nom,
                    allData[index].ville,
                    allData[index].adresse,
                    allData[index].codePostal,
                    allData[index].contact,
                    allData[index].type
                ].join(' '))
            };
        }
    }

    /**
     * Supprime un lieu
     * @param {number} index - Index de l'élément
     */
    function removeItem(index) {
        if (index >= 0 && index < allData.length) {
            allData.splice(index, 1);
            buildSearchIndex(); // Reconstruire l'index complet
        }
    }

    /**
     * Vérifie si un lieu existe déjà (par nom + ville ou SIRET)
     * @param {Object} item - Données du lieu à vérifier
     * @returns {boolean}
     */
    function exists(item) {
        const normalizedNom = Utils.normalizeText(item.nom);
        const normalizedVille = Utils.normalizeText(item.ville);
        
        return allData.some(existing => {
            // Vérification par SIRET
            if (item.siret && existing.siret === item.siret) return true;
            
            // Vérification par nom + ville
            const existingNom = Utils.normalizeText(existing.nom);
            const existingVille = Utils.normalizeText(existing.ville);
            return existingNom === normalizedNom && existingVille === normalizedVille;
        });
    }

    /**
     * Retourne les lieux sans coordonnées GPS
     * @returns {Array<number>} Indices des lieux sans coordonnées
     */
    function getItemsWithoutCoords() {
        return allData
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => !item.lat || !item.lon || (item.lat === 0 && item.lon === 0))
            .map(({ index }) => index);
    }

    // Getters
    function getAll() { return allData; }
    function getFiltered() { return filteredData; }
    function getByIndex(index) { return allData[index]; }
    function getCount() { return allData.length; }
    function getFilteredCount() { return filteredData.length; }

    // API publique
    return {
        loadFromEmbedded,
        loadFromFile,
        filter,
        getUniqueTypes,
        getUniqueVilles,
        addItem,
        updateItem,
        removeItem,
        exists,
        getItemsWithoutCoords,
        getAll,
        getFiltered,
        getByIndex,
        getCount,
        getFilteredCount,
        buildSearchIndex
    };
})();

// Export global
window.DataManager = DataManager;
