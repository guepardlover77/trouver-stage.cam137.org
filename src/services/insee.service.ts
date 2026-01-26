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
 * Recherche dans l'API Recherche Entreprises (gouvernement français)
 * Cette API est gratuite, fiable et filtre correctement par département
 */
export async function searchSirene(params: {
  departement?: string;
  commune?: string;
  codeNaf?: string[];
  raisonSociale?: string;
  limit?: number;
}): Promise<INSEEResult[]> {
  const { departement, commune, codeNaf, raisonSociale, limit = 25 } = params;

  // API Recherche Entreprises - filtrage fiable par département
  const baseUrl = 'https://recherche-entreprises.api.gouv.fr/search';

  try {
    const url = new URL(baseUrl);

    // Paramètre de recherche textuelle (ville ou raison sociale)
    if (raisonSociale) {
      url.searchParams.set('q', raisonSociale);
    } else if (commune) {
      url.searchParams.set('q', commune);
    }

    // Filtre par département - paramètre explicite et fiable
    if (departement) {
      url.searchParams.set('departement', departement);
    }

    // Filtre par activité NAF
    if (codeNaf && codeNaf.length > 0) {
      // L'API accepte plusieurs codes NAF séparés par des virgules
      url.searchParams.set('activite_principale', codeNaf.join(','));
    }

    // Pagination
    url.searchParams.set('per_page', String(limit));
    url.searchParams.set('page', '1');

    const response = await fetch(url.toString());

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Trop de requêtes. Veuillez réessayer dans quelques instants.');
      }
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    // Transformer les résultats
    // L'API retourne les entreprises avec leurs établissements correspondant au filtre
    // On utilise matching_etablissements pour avoir les établissements dans le bon département
    const results: INSEEResult[] = [];

    for (const entreprise of data.results) {
      // Utiliser matching_etablissements si disponible (établissements dans le département recherché)
      // Sinon utiliser le siège (cas d'une recherche sans filtre département)
      const etablissements = entreprise.matching_etablissements?.length > 0
        ? entreprise.matching_etablissements
        : [entreprise.siege];

      for (const etab of etablissements) {
        if (!etab) continue;

        // Vérifier que l'établissement est bien dans le département demandé
        if (departement && etab.code_postal && !etab.code_postal.startsWith(departement)) {
          continue;
        }

        // Récupérer le nom (enseigne de l'établissement, nom commercial, ou nom de l'entreprise)
        const enseignes = etab.liste_enseignes || [];
        const nom = enseignes[0] || etab.nom_commercial || entreprise.nom_complet || 'Sans nom';

        // Code NAF formaté (ex: "56.10A")
        const activiteCode = etab.activite_principale || '';
        const activiteFormatee = activiteCode.replace(/(\d{2})(\d{2})([A-Z])/, '$1.$2$3');

        // Extraire l'adresse depuis le champ adresse ou construire depuis les composants
        let adresse = '';
        if (etab.adresse) {
          // L'adresse complète inclut souvent le code postal et la ville, on les retire
          const adresseParts = etab.adresse.split(' ');
          const codePostalIndex = adresseParts.findIndex((p: string) => /^\d{5}$/.test(p));
          if (codePostalIndex > 0) {
            adresse = adresseParts.slice(0, codePostalIndex).join(' ');
          } else {
            adresse = etab.adresse;
          }
        }

        results.push({
          siret: etab.siret || entreprise.siren,
          nom: nom,
          adresse: adresse,
          codePostal: etab.code_postal || '',
          ville: etab.libelle_commune || '',
          activitePrincipale: activiteCode,
          type: nafToType(activiteFormatee),
          // Coordonnées GPS incluses dans la réponse
          lat: etab.latitude ? parseFloat(etab.latitude) : undefined,
          lon: etab.longitude ? parseFloat(etab.longitude) : undefined
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Erreur recherche SIRENE:', error);
    throw error;
  }
}

/**
 * Recherche et géocode un établissement
 * Note: La nouvelle API retourne déjà les coordonnées GPS pour la plupart des résultats
 * Le géocodage n'est effectué que pour les résultats sans coordonnées
 */
export async function searchAndGeocode(params: {
  departement?: string;
  commune?: string;
  codeNaf?: string[];
  limit?: number;
}): Promise<INSEEResult[]> {
  const results = await searchSirene(params);

  // Géocoder uniquement les résultats sans coordonnées
  const geocodedResults = await Promise.all(
    results.map(async (result) => {
      // Si les coordonnées sont déjà présentes, on les garde
      if (result.lat && result.lon) {
        return result;
      }

      // Sinon, on géocode l'adresse
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
