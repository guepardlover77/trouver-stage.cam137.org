/**
 * Module de Géocodage - API Base Adresse Nationale (BAN)
 * @module geocoding
 */

const Geocoding = (function() {
    'use strict';

    // URL de l'API BAN
    const BAN_API_URL = 'https://api-adresse.data.gouv.fr/search/';
    
    // URL de Nominatim (fallback)
    const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

    /**
     * Géocode une adresse via l'API Base Adresse Nationale (BAN)
     * Documentation: https://adresse.data.gouv.fr/api-doc/adresse
     * @param {string} adresse - Numéro et rue
     * @param {string} codePostal - Code postal
     * @param {string} ville - Nom de la ville
     * @returns {Promise<{lat: number, lon: number, score: number, label: string, type: string}|null>}
     */
    async function geocodeWithBAN(adresse, codePostal, ville) {
        try {
            // Construire la requête
            const query = `${adresse}, ${codePostal} ${ville}`.trim();
            let url = `${BAN_API_URL}?q=${encodeURIComponent(query)}&limit=1`;
            
            // Ajouter le code postal comme filtre pour améliorer la précision
            if (codePostal) {
                url += `&postcode=${codePostal}`;
            }

            const response = await fetch(url);
            
            if (!response.ok) {
                console.warn('API BAN: Erreur HTTP', response.status);
                return null;
            }

            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                const coords = feature.geometry.coordinates;
                const props = feature.properties;

                return {
                    lat: coords[1],  // GeoJSON: [lon, lat]
                    lon: coords[0],
                    score: props.score,  // Score de confiance (0 à 1)
                    label: props.label,  // Adresse complète formatée
                    type: props.type     // housenumber, street, municipality, etc.
                };
            }

            console.log('API BAN: Aucun résultat pour', query);
            return null;

        } catch (error) {
            console.error('Erreur géocodage BAN:', error);
            return null;
        }
    }

    /**
     * Géocode une adresse via Nominatim (OpenStreetMap)
     * @param {string} adresse - Adresse complète
     * @returns {Promise<{lat: number, lon: number}|null>}
     */
    async function geocodeWithNominatim(adresse) {
        try {
            const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(adresse)}&limit=1`;
            
            const response = await fetch(url, {
                headers: { 'User-Agent': 'LyceeGrippeaux-StageApp/1.0' }
            });
            
            if (!response.ok) {
                console.warn('Nominatim: Erreur HTTP', response.status);
                return null;
            }

            const data = await response.json();
            
            if (data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                };
            }

            return null;

        } catch (error) {
            console.error('Erreur géocodage Nominatim:', error);
            return null;
        }
    }

    /**
     * Géocode une adresse avec fallback sur Nominatim si BAN échoue
     * @param {string} adresse - Numéro et rue
     * @param {string} codePostal - Code postal
     * @param {string} ville - Nom de la ville
     * @returns {Promise<{lat: number, lon: number, source: string, score: number|null}|null>}
     */
    async function geocodeAddress(adresse, codePostal, ville) {
        // Essayer d'abord l'API BAN (plus précise pour la France)
        const banResult = await geocodeWithBAN(adresse, codePostal, ville);
        
        if (banResult && banResult.score > 0.4) {
            console.log(`Géocodage BAN réussi (score: ${banResult.score.toFixed(2)}):`, banResult.label);
            return { 
                lat: banResult.lat, 
                lon: banResult.lon, 
                source: 'BAN', 
                score: banResult.score 
            };
        }

        // Fallback sur Nominatim si BAN échoue ou score trop faible
        console.log('Fallback sur Nominatim...');
        const query = `${adresse}, ${codePostal} ${ville}, France`;
        const nominatimResult = await geocodeWithNominatim(query);
        
        if (nominatimResult) {
            return {
                lat: nominatimResult.lat,
                lon: nominatimResult.lon,
                source: 'Nominatim',
                score: null
            };
        }

        return null;
    }

    /**
     * Recherche d'autocomplétion via l'API BAN
     * @param {string} query - Texte de recherche
     * @param {number} limit - Nombre max de résultats
     * @returns {Promise<Array>}
     */
    async function autocomplete(query, limit = 5) {
        try {
            const url = `${BAN_API_URL}?q=${encodeURIComponent(query)}&limit=${limit}&autocomplete=1`;
            const response = await fetch(url);
            
            if (!response.ok) return [];
            
            const data = await response.json();
            return data.features.map(f => ({
                label: f.properties.label,
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0],
                type: f.properties.type,
                score: f.properties.score
            }));
        } catch (error) {
            console.error('Erreur autocomplete:', error);
            return [];
        }
    }

    // API publique
    return {
        geocodeWithBAN,
        geocodeWithNominatim,
        geocodeAddress,
        autocomplete
    };
})();

// Export global
window.Geocoding = Geocoding;
