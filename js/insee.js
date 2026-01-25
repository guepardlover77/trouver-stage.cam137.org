/**
 * Module INSEE - Recherche d'entreprises via l'API
 * @module insee
 */

const INSEE = (function() {
    'use strict';

    // URL de l'API Recherche Entreprises
    const API_URL = 'https://recherche-entreprises.api.gouv.fr/search';

    // Mapping des codes NAF vers types lisibles
    const TYPE_MAPPING = {
        "56.10A": "Restauration traditionnelle",
        "56.10B": "Cafétéria / Libre-service",
        "56.10C": "Restauration rapide",
        "56.21Z": "Traiteur",
        "56.29A": "Restauration collective",
        "56.29B": "Autre restauration",
        "55.10Z": "Hôtel-restaurant"
    };

    // Résultats de la dernière recherche
    let lastResults = [];

    /**
     * Recherche des entreprises via l'API
     * @param {Object} params - Paramètres de recherche
     * @param {string} params.departement - Code département
     * @param {string} params.activite - Code NAF
     * @param {string} params.ville - Nom de ville (optionnel)
     * @returns {Promise<Array>}
     */
    async function search(params) {
        const { departement, activite, ville } = params;

        let url = `${API_URL}?activite_principale=${encodeURIComponent(activite)}&departement=${departement}&per_page=25&page=1`;

        if (ville) {
            url = `${API_URL}?q=${encodeURIComponent(ville)}&activite_principale=${encodeURIComponent(activite)}&departement=${departement}&per_page=25&page=1`;
        }

        try {
            const response = await fetch(url);

            if (!response.ok) {
                console.error('API INSEE: Erreur HTTP', response.status);
                return [];
            }

            const data = await response.json();
            lastResults = data.results || [];
            return lastResults;

        } catch (error) {
            console.error('Erreur API INSEE:', error);
            return [];
        }
    }

    /**
     * Formate les données d'une entreprise INSEE pour l'application
     * @param {Object} entreprise - Données brutes de l'API
     * @returns {Promise<Object>} Données formatées avec coordonnées
     */
    async function formatEntreprise(entreprise) {
        const siege = entreprise.siege || {};
        
        // Nom
        const enseignes = siege.liste_enseignes || [];
        const nom = enseignes[0] || entreprise.nom_complet || 'Établissement sans nom';
        
        // Adresse
        const numeroVoie = siege.numero_voie || '';
        const libelleVoie = siege.libelle_voie || '';
        const adresse = `${numeroVoie} ${libelleVoie}`.trim() || siege.geo_adresse || '';
        const codePostal = siege.code_postal || '';
        const ville = siege.libelle_commune || '';
        
        // Coordonnées
        let lat = siege.latitude ? parseFloat(siege.latitude) : null;
        let lon = siege.longitude ? parseFloat(siege.longitude) : null;

        // Géocodage si nécessaire
        if (!lat || !lon) {
            const geoResult = await Geocoding.geocodeAddress(adresse, codePostal, ville);
            if (geoResult) {
                lat = geoResult.lat;
                lon = geoResult.lon;
            }
        }

        // Type d'activité
        const activite = siege.activite_principale || '';
        const type = TYPE_MAPPING[activite] || 'Restaurant';

        return {
            nom: nom,
            adresse: adresse,
            codePostal: codePostal,
            ville: ville,
            type: type,
            niveau: "",
            telephone: "",
            contact: "À compléter",
            email: "",
            commentaire: `Ajouté via INSEE - SIRET: ${siege.siret || 'N/A'}`,
            lat: lat,
            lon: lon,
            siret: siege.siret || ''
        };
    }

    /**
     * Retourne les résultats de la dernière recherche
     * @returns {Array}
     */
    function getLastResults() {
        return lastResults;
    }

    /**
     * Retourne le mapping des types
     * @returns {Object}
     */
    function getTypeMapping() {
        return TYPE_MAPPING;
    }

    // API publique
    return {
        search,
        formatEntreprise,
        getLastResults,
        getTypeMapping
    };
})();

// Export global
window.INSEE = INSEE;
