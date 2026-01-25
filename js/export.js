/**
 * Module d'Export - CSV, JSON, PDF
 * @module export
 */

const Export = (function() {
    'use strict';

    /**
     * Exporte les données en CSV
     * @param {Array} data - Données à exporter
     * @param {string} filename - Nom du fichier (optionnel)
     */
    function toCSV(data, filename) {
        const headers = ['Nom', 'Adresse', 'Code Postal', 'Ville', 'Type', 'Niveau', 'Téléphone', 'Contact', 'Email', 'Commentaire', 'Latitude', 'Longitude'];
        const rows = data.map(item => [
            item.nom || '',
            item.adresse || '',
            item.codePostal || '',
            item.ville || '',
            item.type || '',
            item.niveau || '',
            item.telephone || '',
            item.contact || '',
            item.email || '',
            item.commentaire || '',
            item.lat || '',
            item.lon || ''
        ]);

        let csvContent = headers.join(';') + '\n';
        rows.forEach(row => {
            csvContent += row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(';') + '\n';
        });

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, filename || Utils.generateFileName('lieux_stage', 'csv'));
    }

    /**
     * Exporte les données en JSON
     * @param {Array} data - Données à exporter
     * @param {string} filename - Nom du fichier (optionnel)
     */
    function toJSON(data, filename) {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        downloadBlob(blob, filename || Utils.generateFileName('lieux_stage', 'json'));
    }

    /**
     * Exporte les données en PDF
     * @param {Array} data - Données à exporter
     * @param {string} filename - Nom du fichier (optionnel)
     */
    function toPDF(data, filename) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Titre
        doc.setFontSize(16);
        doc.setTextColor(30, 58, 138);
        doc.text('Lieux de Stage PFMP - Lycée Les Grippeaux', 14, 20);

        // Sous-titre
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Généré le ${Utils.formatDateFR(new Date())}`, 14, 27);
        doc.text(`${data.length} lieu(x) de stage`, 14, 32);

        // Données du tableau
        const tableData = data.map(item => [
            item.nom || '',
            item.ville || '',
            item.type || '',
            item.niveau || '',
            item.contact || '',
            item.telephone || ''
        ]);

        // Tableau avec autoTable
        doc.autoTable({
            startY: 40,
            head: [['Nom', 'Ville', 'Type', 'Niveau', 'Contact', 'Téléphone']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [30, 58, 138],
                textColor: 255,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 8,
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 35 },
                1: { cellWidth: 25 },
                2: { cellWidth: 40 },
                3: { cellWidth: 15 },
                4: { cellWidth: 35 },
                5: { cellWidth: 30 }
            }
        });

        doc.save(filename || Utils.generateFileName('lieux_stage', 'pdf'));
    }

    /**
     * Télécharge un blob sous forme de fichier
     * @param {Blob} blob - Blob à télécharger
     * @param {string} filename - Nom du fichier
     */
    function downloadBlob(blob, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    /**
     * Sauvegarde les données actuelles dans un fichier data.json téléchargeable
     * @param {Array} data - Données complètes à sauvegarder
     */
    function saveData(data) {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        downloadBlob(blob, 'data.json');
    }

    // API publique
    return {
        toCSV,
        toJSON,
        toPDF,
        saveData,
        downloadBlob
    };
})();

// Export global
window.Export = Export;
