// ============================================================================
// Service d'import Excel/CSV
// ============================================================================

import type { Location } from '../types';
import { normalizeText } from '../utils/helpers';

// Mapping des noms de colonnes possibles vers les champs Location
const COLUMN_MAPPINGS: Record<string, keyof Location> = {
  // Nom
  'nom': 'nom',
  'name': 'nom',
  'raison sociale': 'nom',
  'établissement': 'nom',
  'etablissement': 'nom',
  'entreprise': 'nom',
  'société': 'nom',
  'societe': 'nom',

  // Adresse
  'adresse': 'adresse',
  'address': 'adresse',
  'rue': 'adresse',
  'voie': 'adresse',

  // Code postal
  'codepostal': 'codePostal',
  'code postal': 'codePostal',
  'cp': 'codePostal',
  'postal': 'codePostal',
  'zipcode': 'codePostal',
  'zip': 'codePostal',

  // Ville
  'ville': 'ville',
  'city': 'ville',
  'commune': 'ville',
  'localite': 'ville',
  'localité': 'ville',

  // Type
  'type': 'type',
  'domaine': 'type',
  'activite': 'type',
  'activité': 'type',
  'categorie': 'type',
  'catégorie': 'type',
  'secteur': 'type',

  // Niveau
  'niveau': 'niveau',
  'level': 'niveau',
  'difficulte': 'niveau',
  'difficulté': 'niveau',

  // Téléphone
  'telephone': 'telephone',
  'téléphone': 'telephone',
  'tel': 'telephone',
  'phone': 'telephone',
  'portable': 'telephone',
  'mobile': 'telephone',

  // Contact
  'contact': 'contact',
  'responsable': 'contact',
  'referent': 'contact',
  'référent': 'contact',
  'interlocuteur': 'contact',

  // Email
  'email': 'email',
  'mail': 'email',
  'courriel': 'email',
  'e-mail': 'email',

  // Commentaire
  'commentaire': 'commentaire',
  'comment': 'commentaire',
  'note': 'commentaire',
  'notes': 'commentaire',
  'remarque': 'commentaire',
  'observation': 'commentaire',

  // Coordonnées
  'lat': 'lat',
  'latitude': 'lat',
  'lon': 'lon',
  'lng': 'lon',
  'longitude': 'lon',
  'long': 'lon'
};

export interface ImportResult {
  success: boolean;
  data: Partial<Location>[];
  errors: string[];
  warnings: string[];
  columnMapping: Record<string, keyof Location | null>;
  unmappedColumns: string[];
}

export interface ImportOptions {
  skipEmptyRows?: boolean;
  validateRequired?: boolean;
  trimValues?: boolean;
  customMapping?: Record<string, keyof Location>;
}

/**
 * Importe un fichier Excel ou CSV
 */
export async function importFile(
  file: File,
  options: ImportOptions = {}
): Promise<ImportResult> {
  const {
    skipEmptyRows = true,
    validateRequired = true,
    trimValues = true,
    customMapping = {}
  } = options;

  const result: ImportResult = {
    success: false,
    data: [],
    errors: [],
    warnings: [],
    columnMapping: {},
    unmappedColumns: []
  };

  try {
    const extension = file.name.split('.').pop()?.toLowerCase();

    let rawData: any[][];

    if (extension === 'csv') {
      rawData = await parseCSV(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
      rawData = await parseExcel(file);
    } else {
      result.errors.push(`Format de fichier non supporté: ${extension}`);
      return result;
    }

    if (rawData.length < 2) {
      result.errors.push('Le fichier doit contenir au moins une ligne d\'en-tête et une ligne de données');
      return result;
    }

    // Première ligne = en-têtes
    const headers = rawData[0].map(h => String(h || '').trim());

    // Mapper les colonnes
    const mapping = { ...COLUMN_MAPPINGS, ...customMapping };
    const columnMapping: Record<string, keyof Location | null> = {};

    headers.forEach(header => {
      const normalized = normalizeText(header);
      const mappedField = Object.entries(mapping).find(
        ([key]) => normalizeText(key) === normalized
      );

      if (mappedField) {
        columnMapping[header] = mappedField[1];
      } else {
        columnMapping[header] = null;
        result.unmappedColumns.push(header);
      }
    });

    result.columnMapping = columnMapping;

    if (result.unmappedColumns.length > 0) {
      result.warnings.push(`Colonnes non mappées: ${result.unmappedColumns.join(', ')}`);
    }

    // Convertir les données
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];

      // Vérifier si la ligne est vide
      if (skipEmptyRows && row.every(cell => !cell || String(cell).trim() === '')) {
        continue;
      }

      const location: Partial<Location> = {};
      let hasData = false;

      headers.forEach((header, colIndex) => {
        const field = columnMapping[header];
        if (field && row[colIndex] !== undefined && row[colIndex] !== null) {
          let value = String(row[colIndex]);

          if (trimValues) {
            value = value.trim();
          }

          if (value) {
            hasData = true;

            // Conversion de type pour lat/lon
            if (field === 'lat' || field === 'lon') {
              const numValue = parseFloat(value.replace(',', '.'));
              (location as any)[field] = isNaN(numValue) ? null : numValue;
            } else {
              (location as any)[field] = value;
            }
          }
        }
      });

      if (hasData) {
        // Valider les champs requis
        if (validateRequired) {
          const rowErrors: string[] = [];

          if (!location.nom) {
            rowErrors.push(`Ligne ${i + 1}: nom manquant`);
          }

          if (rowErrors.length > 0) {
            result.warnings.push(...rowErrors);
          }
        }

        // Ajouter des valeurs par défaut
        location.lat = location.lat ?? null;
        location.lon = location.lon ?? null;
        location.commentaire = location.commentaire ?? '';
        location.email = location.email ?? '';

        result.data.push(location);
      }
    }

    result.success = result.data.length > 0;

    if (result.data.length === 0) {
      result.errors.push('Aucune donnée valide trouvée dans le fichier');
    }
  } catch (error) {
    result.errors.push(`Erreur lors de l'import: ${(error as Error).message}`);
  }

  return result;
}

/**
 * Parse un fichier CSV
 */
async function parseCSV(file: File): Promise<any[][]> {
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  const result: any[][] = [];

  // Détecter le séparateur (virgule ou point-virgule)
  const firstLine = lines[0] || '';
  const separator = firstLine.includes(';') ? ';' : ',';

  for (const line of lines) {
    if (!line.trim()) continue;

    const row: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          currentValue += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === separator && !inQuotes) {
        row.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    row.push(currentValue);
    result.push(row);
  }

  return result;
}

/**
 * Parse un fichier Excel
 */
async function parseExcel(file: File): Promise<any[][]> {
  const XLSX = await import('xlsx');

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  // Prendre la première feuille
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convertir en tableau
  return XLSX.utils.sheet_to_json(sheet, { header: 1 });
}

/**
 * Valide les données importées
 */
export function validateImportedData(data: Partial<Location>[]): {
  valid: Partial<Location>[];
  invalid: { data: Partial<Location>; reason: string }[];
} {
  const valid: Partial<Location>[] = [];
  const invalid: { data: Partial<Location>; reason: string }[] = [];

  for (const item of data) {
    const reasons: string[] = [];

    if (!item.nom || item.nom.trim().length < 2) {
      reasons.push('Nom invalide ou trop court');
    }

    if (!item.ville || item.ville.trim().length < 2) {
      reasons.push('Ville manquante ou invalide');
    }

    if (item.codePostal && !/^\d{5}$/.test(item.codePostal)) {
      reasons.push('Code postal invalide (doit être 5 chiffres)');
    }

    if (item.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) {
      reasons.push('Email invalide');
    }

    if (reasons.length > 0) {
      invalid.push({ data: item, reason: reasons.join(', ') });
    } else {
      valid.push(item);
    }
  }

  return { valid, invalid };
}

/**
 * Convertit les données importées en Location complètes
 */
export function toLocations(data: Partial<Location>[]): Location[] {
  return data.map(item => ({
    nom: item.nom || '',
    adresse: item.adresse || '',
    codePostal: item.codePostal || '',
    ville: item.ville || '',
    type: item.type || '',
    niveau: item.niveau || '',
    telephone: item.telephone || '',
    contact: item.contact || '',
    email: item.email || '',
    commentaire: item.commentaire || '',
    lat: item.lat ?? null,
    lon: item.lon ?? null
  }));
}

/**
 * Génère un template CSV pour l'import
 */
export function generateImportTemplate(): string {
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
    'Commentaire'
  ];

  const example = [
    'Restaurant Le Bon Goût',
    '12 rue de la Paix',
    '79000',
    'Niort',
    'Restauration traditionnelle',
    '2',
    '05 49 00 00 00',
    'M. Dupont',
    'contact@lebongout.fr',
    'Bon accueil'
  ];

  const BOM = '\uFEFF';
  return BOM + headers.join(';') + '\n' + example.join(';');
}

/**
 * Télécharge le template d'import
 */
export function downloadImportTemplate(): void {
  const content = generateImportTemplate();
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'template_import_stages.csv';
  link.click();

  URL.revokeObjectURL(url);
}
