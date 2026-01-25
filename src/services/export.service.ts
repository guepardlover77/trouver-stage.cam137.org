// ============================================================================
// Service d'export (CSV, JSON, PDF, Excel)
// ============================================================================

import type { Location } from '../types';
import { generateFileName, formatDateFR } from '../utils/helpers';
import { store } from '../store';

// Imports dynamiques pour réduire la taille du bundle initial
let jsPDF: any = null;
let autoTable: any = null;

async function loadJsPDF() {
  if (!jsPDF) {
    const module = await import('jspdf');
    jsPDF = module.default || module.jsPDF;
    const autoTableModule = await import('jspdf-autotable');
    autoTable = autoTableModule.default;
  }
  return { jsPDF, autoTable };
}

/**
 * Exporte les données en CSV
 */
export function exportToCSV(locations: Location[], filename?: string): void {
  const headers = [
    'Nom',
    'Adresse',
    'Code Postal',
    'Ville',
    'Type',
    'Niveau',
    'Téléphone',
    'Contact',
    'Email',
    'Commentaire',
    'Latitude',
    'Longitude'
  ];

  const rows = locations.map(loc => [
    escapeCsvField(loc.nom),
    escapeCsvField(loc.adresse),
    loc.codePostal,
    escapeCsvField(loc.ville),
    escapeCsvField(loc.type),
    loc.niveau,
    loc.telephone,
    escapeCsvField(loc.contact),
    loc.email,
    escapeCsvField(loc.commentaire),
    loc.lat?.toString() || '',
    loc.lon?.toString() || ''
  ]);

  // Ajouter BOM pour UTF-8
  const BOM = '\uFEFF';
  const csvContent = BOM + [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  downloadFile(
    csvContent,
    filename || generateFileName('lieux-stage', 'csv'),
    'text/csv;charset=utf-8'
  );
}

/**
 * Échappe un champ CSV
 */
function escapeCsvField(value: string): string {
  if (!value) return '';
  // Échapper les guillemets et entourer si nécessaire
  if (value.includes('"') || value.includes(';') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Exporte les données en JSON
 */
export function exportToJSON(locations: Location[], filename?: string): void {
  const jsonContent = JSON.stringify(locations, null, 2);

  downloadFile(
    jsonContent,
    filename || generateFileName('lieux-stage', 'json'),
    'application/json'
  );
}

/**
 * Exporte les données en PDF
 */
export async function exportToPDF(
  locations: Location[],
  options: {
    title?: string;
    filename?: string;
    includeMap?: boolean;
  } = {}
): Promise<void> {
  const { jsPDF } = await loadJsPDF();

  const {
    title = 'Liste des Lieux de Stage',
    filename = generateFileName('lieux-stage', 'pdf')
  } = options;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Titre
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 15);

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Export du ${formatDateFR()}`, 14, 22);
  doc.text(`${locations.length} établissement(s)`, 14, 27);

  // Tableau
  const tableData = locations.map(loc => [
    loc.nom || '',
    loc.adresse || '',
    `${loc.codePostal} ${loc.ville}`,
    loc.type || '',
    loc.niveau || '',
    loc.telephone || '',
    loc.contact || ''
  ]);

  (doc as any).autoTable({
    startY: 32,
    head: [['Nom', 'Adresse', 'Ville', 'Type', 'Niveau', 'Téléphone', 'Contact']],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [37, 99, 235], // primary-600
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // slate-50
    },
    columnStyles: {
      0: { cellWidth: 45 }, // Nom
      1: { cellWidth: 50 }, // Adresse
      2: { cellWidth: 35 }, // Ville
      3: { cellWidth: 35 }, // Type
      4: { cellWidth: 15 }, // Niveau
      5: { cellWidth: 30 }, // Téléphone
      6: { cellWidth: 35 }  // Contact
    }
  });

  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Page ${i} / ${pageCount}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(filename);
}

/**
 * Exporte une fiche individuelle en PDF
 */
export async function exportLocationToPDF(
  location: Location,
  options: {
    includeQRCode?: boolean;
    includeMap?: boolean;
    personalNote?: string;
  } = {}
): Promise<void> {
  const { jsPDF } = await loadJsPDF();
  const { includeQRCode = true, personalNote } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let y = 20;

  // Titre
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(location.nom, margin, y);
  y += 10;

  // Type
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(location.type || 'Type non spécifié', margin, y);
  y += 15;

  // Ligne de séparation
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Informations
  doc.setTextColor(0);
  doc.setFontSize(11);

  const addField = (label: string, value: string) => {
    if (!value) return;
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 35, y);
    y += 7;
  };

  addField('Adresse', location.adresse);
  addField('Ville', `${location.codePostal} ${location.ville}`);
  addField('Niveau', location.niveau);
  addField('Téléphone', location.telephone);
  addField('Contact', location.contact);
  addField('Email', location.email);

  if (location.commentaire) {
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Commentaire:', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');

    const lines = doc.splitTextToSize(location.commentaire, pageWidth - 2 * margin);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 5;
  }

  // Note personnelle
  if (personalNote) {
    y += 5;
    doc.setFillColor(255, 251, 235);
    doc.rect(margin, y - 3, pageWidth - 2 * margin, 30, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14);
    doc.text('Note personnelle:', margin + 3, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);

    const noteLines = doc.splitTextToSize(personalNote, pageWidth - 2 * margin - 6);
    doc.text(noteLines, margin + 3, y + 11);
    y += 35;
  }

  // QR Code (si demandé)
  if (includeQRCode && location.lat && location.lon) {
    try {
      const QRCode = (await import('qrcode')).default;
      const qrData = `geo:${location.lat},${location.lon}?q=${encodeURIComponent(location.nom)}`;
      const qrDataUrl = await QRCode.toDataURL(qrData, { width: 100 });

      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Localisation:', margin, y);
      y += 5;

      doc.addImage(qrDataUrl, 'PNG', margin, y, 35, 35);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Scannez pour ouvrir dans', margin + 40, y + 15);
      doc.text('votre application GPS', margin + 40, y + 20);
    } catch (error) {
      console.warn('Erreur génération QR code:', error);
    }
  }

  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text(
    `Généré le ${formatDateFR()} - Carte des Lieux de Stage`,
    margin,
    doc.internal.pageSize.height - 10
  );

  // Télécharger
  const filename = generateFileName(
    location.nom.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30),
    'pdf'
  );
  doc.save(filename);
}

/**
 * Exporte les données en Excel (XLSX)
 */
export async function exportToExcel(
  locations: Location[],
  filename?: string
): Promise<void> {
  const XLSX = await import('xlsx');

  const worksheet = XLSX.utils.json_to_sheet(
    locations.map(loc => ({
      'Nom': loc.nom,
      'Adresse': loc.adresse,
      'Code Postal': loc.codePostal,
      'Ville': loc.ville,
      'Type': loc.type,
      'Niveau': loc.niveau,
      'Téléphone': loc.telephone,
      'Contact': loc.contact,
      'Email': loc.email,
      'Commentaire': loc.commentaire,
      'Latitude': loc.lat,
      'Longitude': loc.lon
    }))
  );

  // Ajuster la largeur des colonnes
  worksheet['!cols'] = [
    { wch: 30 }, // Nom
    { wch: 35 }, // Adresse
    { wch: 10 }, // Code Postal
    { wch: 20 }, // Ville
    { wch: 25 }, // Type
    { wch: 8 },  // Niveau
    { wch: 15 }, // Téléphone
    { wch: 25 }, // Contact
    { wch: 30 }, // Email
    { wch: 40 }, // Commentaire
    { wch: 12 }, // Latitude
    { wch: 12 }  // Longitude
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lieux de Stage');

  XLSX.writeFile(
    workbook,
    filename || generateFileName('lieux-stage', 'xlsx')
  );
}

/**
 * Télécharge un fichier
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Génère les données pour l'impression
 */
export function generatePrintContent(locations: Location[]): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Lieux de Stage</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 10pt; }
        h1 { font-size: 16pt; color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #2563eb; color: white; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .footer { margin-top: 20px; font-size: 8pt; color: #666; }
      </style>
    </head>
    <body>
      <h1>Liste des Lieux de Stage</h1>
      <p>Export du ${formatDateFR()} - ${locations.length} établissement(s)</p>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Adresse</th>
            <th>Ville</th>
            <th>Type</th>
            <th>Niveau</th>
            <th>Téléphone</th>
          </tr>
        </thead>
        <tbody>
          ${locations.map(loc => `
            <tr>
              <td>${escapeHtml(loc.nom)}</td>
              <td>${escapeHtml(loc.adresse)}</td>
              <td>${loc.codePostal} ${escapeHtml(loc.ville)}</td>
              <td>${escapeHtml(loc.type)}</td>
              <td>${loc.niveau}</td>
              <td>${loc.telephone}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p class="footer">Carte des Lieux de Stage</p>
    </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Ouvre la fenêtre d'impression
 */
export function printLocations(locations: Location[]): void {
  const content = generatePrintContent(locations);
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }
}

// ============================================================================
// Fonctions wrapper pour compatibilité avec le store
// ============================================================================

/**
 * Export CSV avec indices filtrés
 */
export async function exportAsCsv(indices: number[]): Promise<void> {
  const locations = indices.map(i => store.locations[i]).filter(Boolean);
  exportToCSV(locations);
}

/**
 * Export JSON avec indices filtrés
 */
export async function exportAsJson(indices: number[]): Promise<void> {
  const locations = indices.map(i => store.locations[i]).filter(Boolean);
  exportToJSON(locations);
}

/**
 * Export PDF avec indices filtrés
 */
export async function exportAsPdf(indices: number[]): Promise<void> {
  const locations = indices.map(i => store.locations[i]).filter(Boolean);
  await exportToPDF(locations);
}

/**
 * Export Excel avec indices filtrés
 */
export async function exportAsExcel(indices: number[]): Promise<void> {
  const locations = indices.map(i => store.locations[i]).filter(Boolean);
  await exportToExcel(locations);
}
