/**
 * Module de Gestion de la Carte Leaflet
 * @module map
 */

const MapManager = (function() {
    'use strict';

    // Références Leaflet
    let map = null;
    let markerClusterGroup = null;
    let markersCache = {};
    
    // Icônes personnalisées
    const blueIcon = L.icon({
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCAzMCA0NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUgMEM2LjcgMCAwIDYuNyAwIDE1YzAgMTEuMiAxNSAzMCAxNSAzMHMxNS0xOC44IDE1LTMwYzAtOC4zLTYuNy0xNS0xNS0xNXptMCAyMC41Yy0zIDAtNS41LTIuNS01LjUtNS41czIuNS01LjUgNS41LTUuNSA1LjUgMi41IDUuNSA1LjUtMi41IDUuNS01LjUgNS41eiIgZmlsbD0iIzNiODJmNiIvPjwvc3ZnPg==',
        iconSize: [30, 45],
        iconAnchor: [15, 45],
        popupAnchor: [0, -45]
    });

    const redIcon = L.icon({
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCAzMCA0NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUgMEM2LjcgMCAwIDYuNyAwIDE1YzAgMTEuMiAxNSAzMCAxNSAzMHMxNS0xOC4yIDE1LTMwYzAtOC4zLTYuNy0xNS0xNS0xNXptMCAyMC41Yy0zIDAtNS41LTIuNS01LjUtNS41czIuNS01LjUgNS41LTUuNSA1LjUgMi41IDUuNSA1LjUtMi41IDUuNS01LjUgNS41eiIgZmlsbD0iI2VmNDQ0NCIvPjwvc3ZnPg==',
        iconSize: [30, 45],
        iconAnchor: [15, 45],
        popupAnchor: [0, -45]
    });

    // Callback pour créer le contenu du popup
    let popupContentCallback = null;

    /**
     * Initialise la carte
     * @param {string} containerId - ID du conteneur de la carte
     * @param {Object} options - Options de configuration
     * @returns {Object} Instance de la carte Leaflet
     */
    function init(containerId, options = {}) {
        const defaultOptions = {
            center: [46.5, -0.3],
            zoom: 9,
            clusterOptions: {
                maxClusterRadius: 60,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                disableClusteringAtZoom: 15,
                chunkedLoading: true,
                chunkInterval: 100,
                chunkDelay: 50
            }
        };

        const config = { ...defaultOptions, ...options };

        // Créer la carte
        map = L.map(containerId).setView(config.center, config.zoom);

        // Ajouter la couche OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Créer le groupe de clusters
        markerClusterGroup = L.markerClusterGroup(config.clusterOptions);
        map.addLayer(markerClusterGroup);

        return map;
    }

    /**
     * Définit le callback pour créer le contenu des popups
     * @param {Function} callback - Fonction (item, index) => HTML string
     */
    function setPopupCallback(callback) {
        popupContentCallback = callback;
    }

    /**
     * Crée un marqueur pour un élément
     * @param {Object} item - Données du lieu
     * @param {number} index - Index dans les données
     * @param {boolean} isHighlighted - Si le marqueur doit être mis en surbrillance
     * @returns {L.Marker|null}
     */
    function createMarker(item, index, isHighlighted = false) {
        if (!item.lat || !item.lon) return null;

        const icon = isHighlighted ? redIcon : blueIcon;
        const marker = L.marker([item.lat, item.lon], { icon });

        // Popup lazy loading
        marker.on('click', function() {
            if (!this.getPopup() && popupContentCallback) {
                this.bindPopup(popupContentCallback(item, index)).openPopup();
            }
        });

        // Tooltip avec le nom de la ville
        marker.bindTooltip(item.ville, {
            permanent: false,
            direction: 'top',
            className: 'city-tooltip'
        });

        return marker;
    }

    /**
     * Crée tous les marqueurs à partir des données
     * @param {Array} data - Tableau des données
     */
    function createAllMarkers(data) {
        markersCache = {};
        data.forEach((item, index) => {
            const marker = createMarker(item, index);
            if (marker) {
                markersCache[index] = marker;
            }
        });
    }

    /**
     * Met à jour les marqueurs affichés
     * @param {Array<number>} indices - Indices des éléments à afficher
     * @param {string} highlightType - Type à mettre en surbrillance (optionnel)
     */
    function updateMarkers(indices, highlightType = null) {
        markerClusterGroup.clearLayers();

        const markersToAdd = [];
        const data = DataManager.getAll();

        indices.forEach(index => {
            const item = data[index];
            let marker = markersCache[index];

            if (marker) {
                // Mettre à jour l'icône selon le filtre
                if (highlightType && item.type === highlightType) {
                    marker.setIcon(redIcon);
                } else {
                    marker.setIcon(blueIcon);
                }
                markersToAdd.push(marker);
            }
        });

        markerClusterGroup.addLayers(markersToAdd);
    }

    /**
     * Met à jour la position d'un marqueur
     * @param {number} index - Index du marqueur
     * @param {number} lat - Nouvelle latitude
     * @param {number} lon - Nouvelle longitude
     */
    function updateMarkerPosition(index, lat, lon) {
        if (markersCache[index]) {
            markersCache[index].setLatLng([lat, lon]);
        } else {
            // Créer un nouveau marqueur si n'existait pas
            const item = DataManager.getByIndex(index);
            if (item) {
                item.lat = lat;
                item.lon = lon;
                const marker = createMarker(item, index);
                if (marker) {
                    markersCache[index] = marker;
                }
            }
        }
    }

    /**
     * Met à jour le popup d'un marqueur
     * @param {number} index - Index du marqueur
     */
    function refreshPopup(index) {
        const marker = markersCache[index];
        const item = DataManager.getByIndex(index);
        
        if (marker && item && popupContentCallback) {
            if (marker.getPopup()) {
                marker.setPopupContent(popupContentCallback(item, index));
            }
        }
    }

    /**
     * Zoom sur un marqueur spécifique
     * @param {number} index - Index du marqueur
     */
    function focusOnMarker(index) {
        const marker = markersCache[index];
        if (marker) {
            markerClusterGroup.zoomToShowLayer(marker, function() {
                marker.openPopup();
            });
        }
    }

    /**
     * Ajuste la vue pour afficher tous les marqueurs
     * @param {Array<number>} indices - Indices des marqueurs (optionnel)
     */
    function fitBounds(indices = null) {
        const data = DataManager.getAll();
        let items;

        if (indices) {
            items = indices.map(i => data[i]).filter(item => item.lat && item.lon);
        } else {
            items = data.filter(item => item.lat && item.lon);
        }

        if (items.length > 0) {
            const bounds = L.latLngBounds(items.map(item => [item.lat, item.lon]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    /**
     * Retourne le marqueur d'un index donné
     * @param {number} index - Index
     * @returns {L.Marker|null}
     */
    function getMarker(index) {
        return markersCache[index] || null;
    }

    /**
     * Retourne l'instance de la carte
     * @returns {L.Map}
     */
    function getMap() {
        return map;
    }

    /**
     * Retourne les icônes
     */
    function getIcons() {
        return { blueIcon, redIcon };
    }

    // API publique
    return {
        init,
        setPopupCallback,
        createMarker,
        createAllMarkers,
        updateMarkers,
        updateMarkerPosition,
        refreshPopup,
        focusOnMarker,
        fitBounds,
        getMarker,
        getMap,
        getIcons
    };
})();

// Export global
window.MapManager = MapManager;
