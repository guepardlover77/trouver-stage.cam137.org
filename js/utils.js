/**
 * Utilitaires - Fonctions helpers réutilisables
 * @module utils
 */

/**
 * Debounce - Évite les appels répétés d'une fonction
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Délai en millisecondes
 * @returns {Function} Fonction debouncée
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Normalise le texte pour la recherche (supprime accents, minuscules)
 * @param {string} text - Texte à normaliser
 * @returns {string} Texte normalisé
 */
function normalizeText(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

/**
 * Vérifie si un niveau correspond au filtre
 * Gère les ranges comme "2-3" ou "1-2"
 * @param {string} niveauEntreprise - Niveau de l'entreprise
 * @param {string} niveauFiltre - Niveau filtré
 * @returns {boolean}
 */
function niveauMatches(niveauEntreprise, niveauFiltre) {
    if (!niveauFiltre) return true;
    if (!niveauEntreprise) return false;

    // Gérer les ranges comme "2-3" ou "1-2"
    if (niveauEntreprise.includes('-')) {
        const [min, max] = niveauEntreprise.split('-').map(n => parseInt(n));
        const filtre = parseInt(niveauFiltre);
        return filtre >= min && filtre <= max;
    }

    return niveauEntreprise === niveauFiltre;
}

/**
 * Formate une date en français
 * @param {Date} date - Date à formater
 * @returns {string} Date formatée
 */
function formatDateFR(date) {
    return date.toLocaleDateString('fr-FR');
}

/**
 * Génère un nom de fichier avec timestamp
 * @param {string} prefix - Préfixe du fichier
 * @param {string} extension - Extension du fichier
 * @returns {string} Nom de fichier
 */
function generateFileName(prefix, extension) {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${prefix}_${timestamp}.${extension}`;
}

// Export pour utilisation dans d'autres modules
window.Utils = {
    debounce,
    normalizeText,
    niveauMatches,
    formatDateFR,
    generateFileName
};
