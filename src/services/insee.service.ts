// ============================================================================
// Service d'intégration API INSEE (SIRENE)
// ============================================================================

import type { INSEEResult } from '../types';
import { geocodeAddress } from './geocoding.service';

// Mapping des codes NAF vers des types lisibles
const NAF_TYPES: Record<string, string> = {
  '55.10Z': 'Hôtel',
  '55.20Z': 'Hébergement touristique',
  '55.30Z': 'Camping',
  '56.10A': 'Restauration traditionnelle',
  '56.10B': 'Cafétéria',
  '56.10C': 'Restauration rapide',
  '56.21Z': 'Traiteur',
  '56.29A': 'Restauration collective sous contrat',
  '56.29B': 'Restauration collective autre',
  '56.30Z': 'Débit de boissons',
  '47.11A': 'Commerce alimentaire de détail',
  '47.11B': 'Commerce alimentaire de proximité',
  '47.11C': 'Grande surface alimentaire',
  '47.11D': 'Supermarché',
  '47.11E': 'Magasin multi-commerce',
  '47.11F': 'Hypermarché',
  '10.71A': 'Fabrication industrielle de pain',
  '10.71B': 'Cuisson de produits de boulangerie',
  '10.71C': 'Boulangerie-pâtisserie',
  '10.71D': 'Pâtisserie',
  '10.13A': 'Préparation industrielle de produits à base de viande',
  '10.13B': 'Charcuterie',
  '10.52Z': 'Fabrication de glaces',
  '10.82Z': 'Fabrication de cacao, chocolat',
  '47.24Z': 'Commerce pain, pâtisserie, confiserie',
  '47.29Z': 'Autre commerce alimentaire',
  '47.81Z': 'Commerce alimentaire sur marchés'
};

// Départements pris en charge
const DEPARTMENTS = [
  { code: '79', nom: 'Deux-Sèvres' },
  { code: '86', nom: 'Vienne' },
  { code: '17', nom: 'Charente-Maritime' },
  { code: '85', nom: 'Vendée' },
  { code: '16', nom: 'Charente' },
  { code: '87', nom: 'Haute-Vienne' }
];

/**
 * Retourne la liste des départements
 */
export function getDepartments(): { code: string; nom: string }[] {
  return DEPARTMENTS;
}

/**
 * Retourne les codes NAF filtrés par domaine
 */
export function getNafCodesByDomain(domain: 'restauration' | 'hotellerie' | 'commerce' | 'all'): string[] {
  const restauration = ['56.10A', '56.10B', '56.10C', '56.21Z', '56.29A', '56.29B', '56.30Z'];
  const hotellerie = ['55.10Z', '55.20Z', '55.30Z'];
  const commerce = ['47.11A', '47.11B', '47.11C', '47.11D', '47.11E', '47.11F', '47.24Z', '47.29Z', '47.81Z'];
  const production = ['10.71A', '10.71B', '10.71C', '10.71D', '10.13A', '10.13B', '10.52Z', '10.82Z'];

  switch (domain) {
    case 'restauration':
      return restauration;
    case 'hotellerie':
      return hotellerie;
    case 'commerce':
      return [...commerce, ...production];
    case 'all':
    default:
      return [...restauration, ...hotellerie, ...commerce, ...production];
  }
}

/**
 * Convertit un code NAF en type lisible
 */
export function nafToType(nafCode: string): string {
  return NAF_TYPES[nafCode] || 'Établissement';
}

/**
 * Recherche dans l'API SIRENE
 * Note: Cette API nécessite normalement une clé API
 * Pour une utilisation gratuite, on utilise l'API publique avec limitations
 */
export async function searchSirene(params: {
  departement?: string;
  commune?: string;
  codeNaf?: string[];
  raisonSociale?: string;
  limit?: number;
}): Promise<INSEEResult[]> {
  const { departement, commune, codeNaf, raisonSociale, limit = 20 } = params;

  // Construction de la requête
  // Note: L'API SIRENE complète nécessite une inscription sur api.insee.fr
  // Cette implémentation utilise une approche simplifiée

  const baseUrl = 'https://entreprise.data.gouv.fr/api/sirene/v3/etablissements';
  const queryParts: string[] = [];

  if (departement) {
    queryParts.push(`codePostalEtablissement:${departement}*`);
  }

  if (commune) {
    queryParts.push(`libelleCommuneEtablissement:${commune}`);
  }

  if (codeNaf && codeNaf.length > 0) {
    const nafQuery = codeNaf.map(c => `activitePrincipaleEtablissement:${c.replace('.', '')}`).join(' OR ');
    queryParts.push(`(${nafQuery})`);
  }

  if (raisonSociale) {
    queryParts.push(`denominationUniteLegale:*${raisonSociale}*`);
  }

  // Filtrer uniquement les établissements actifs
  queryParts.push('etatAdministratifEtablissement:A');

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('q', queryParts.join(' AND '));
    url.searchParams.set('per_page', String(limit));

    const response = await fetch(url.toString());

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Trop de requêtes. Veuillez réessayer dans quelques instants.');
      }
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();

    if (!data.etablissements || data.etablissements.length === 0) {
      return [];
    }

    // Transformer les résultats
    const results: INSEEResult[] = data.etablissements.map((etab: any) => {
      const adresseParts = [
        etab.numeroVoieEtablissement,
        etab.typeVoieEtablissement,
        etab.libelleVoieEtablissement
      ].filter(Boolean);

      return {
        siret: etab.siret,
        nom: etab.uniteLegale?.denominationUniteLegale ||
          etab.uniteLegale?.nomUniteLegale ||
          'Sans nom',
        adresse: adresseParts.join(' '),
        codePostal: etab.codePostalEtablissement || '',
        ville: etab.libelleCommuneEtablissement || '',
        activitePrincipale: etab.activitePrincipaleEtablissement || '',
        type: nafToType(etab.activitePrincipaleEtablissement?.replace(/(\d{2})(\d{2})([A-Z])/, '$1.$2$3') || '')
      };
    });

    return results;
  } catch (error) {
    console.error('Erreur recherche SIRENE:', error);
    throw error;
  }
}

/**
 * Recherche et géocode un établissement
 */
export async function searchAndGeocode(params: {
  departement?: string;
  commune?: string;
  codeNaf?: string[];
  limit?: number;
}): Promise<INSEEResult[]> {
  const results = await searchSirene(params);

  // Géocoder chaque résultat
  const geocodedResults = await Promise.all(
    results.map(async (result) => {
      if (result.adresse && result.codePostal && result.ville) {
        const coords = await geocodeAddress(result.adresse, result.codePostal, result.ville);
        if (coords) {
          return {
            ...result,
            lat: coords.lat,
            lon: coords.lon
          };
        }
      }
      return result;
    })
  );

  return geocodedResults;
}

/**
 * Récupère les détails d'un établissement par SIRET
 */
export async function getEtablissementBySiret(siret: string): Promise<INSEEResult | null> {
  try {
    const url = `https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${siret}`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const etab = data.etablissement;

    if (!etab) {
      return null;
    }

    const adresseParts = [
      etab.numeroVoieEtablissement,
      etab.typeVoieEtablissement,
      etab.libelleVoieEtablissement
    ].filter(Boolean);

    return {
      siret: etab.siret,
      nom: etab.uniteLegale?.denominationUniteLegale ||
        etab.uniteLegale?.nomUniteLegale ||
        'Sans nom',
      adresse: adresseParts.join(' '),
      codePostal: etab.codePostalEtablissement || '',
      ville: etab.libelleCommuneEtablissement || '',
      activitePrincipale: etab.activitePrincipaleEtablissement || '',
      type: nafToType(etab.activitePrincipaleEtablissement?.replace(/(\d{2})(\d{2})([A-Z])/, '$1.$2$3') || '')
    };
  } catch (error) {
    console.error('Erreur récupération SIRET:', error);
    return null;
  }
}

/**
 * Recherche des communes par département
 */
export async function searchCommunesByDepartement(
  departement: string
): Promise<{ code: string; nom: string }[]> {
  try {
    const url = `https://geo.api.gouv.fr/departements/${departement}/communes?fields=nom,code`;
    const response = await fetch(url);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.map((commune: any) => ({
      code: commune.code,
      nom: commune.nom
    })).sort((a: any, b: any) => a.nom.localeCompare(b.nom, 'fr'));
  } catch (error) {
    console.error('Erreur recherche communes:', error);
    return [];
  }
}

/**
 * Suggestions d'activités NAF
 */
export function searchNafCodes(query: string): { code: string; label: string }[] {
  const queryLower = query.toLowerCase();

  return Object.entries(NAF_TYPES)
    .filter(([code, label]) =>
      code.toLowerCase().includes(queryLower) ||
      label.toLowerCase().includes(queryLower)
    )
    .map(([code, label]) => ({ code, label }))
    .slice(0, 10);
}
