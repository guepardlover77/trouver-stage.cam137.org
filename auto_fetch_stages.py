"""
Script de récupération automatique des lieux de stage en Hôtellerie-Restauration
Utilise l'API Sirene (INSEE) + Nominatim pour géocodage

Installation requise:
pip install requests pandas

Auteur: Lycée Les Grippeaux
Date: 2026-01-22
"""

import requests
import json
import time
import csv
from typing import List, Dict, Optional
from datetime import datetime


class StageDataFetcher:
    """Classe pour récupérer automatiquement les données de lieux de stage"""

    # Codes NAF pour la restauration (nomenclature INSEE)
    CODES_NAF_RESTAURATION = [
        "56.10A",  # Restauration traditionnelle
        "56.10B",  # Cafétérias et autres libres-services
        "56.10C",  # Restauration de type rapide
        "56.21Z",  # Services des traiteurs
        "56.29A",  # Restauration collective sous contrat
        "56.29B",  # Autres services de restauration n.c.a.
        "55.10Z",  # Hôtels et hébergement similaire (pour hôtels-restaurants)
    ]

    # Départements cibles (Deux-Sèvres, Charente-Maritime, Vienne)
    DEPARTEMENTS = ["79", "17", "86"]

    def __init__(self):
        """Initialisation du fetcher"""
        self.base_url_sirene = "https://api.insee.fr/entreprises/sirene/V3"
        self.base_url_nominatim = "https://nominatim.openstreetmap.org"
        self.results = []

    def get_sirene_token(self) -> Optional[str]:
        """
        Récupère un token pour l'API Sirene

        IMPORTANT: Pour utiliser l'API Sirene, vous devez:
        1. Créer un compte sur https://api.insee.fr/
        2. Créer une application
        3. Obtenir votre Consumer Key et Consumer Secret
        4. Les placer dans un fichier config.json

        Returns:
            Token d'authentification ou None si erreur
        """
        try:
            with open('config.json', 'r') as f:
                config = json.load(f)
                consumer_key = config.get('SIRENE_CONSUMER_KEY')
                consumer_secret = config.get('SIRENE_CONSUMER_SECRET')

            # Authentification OAuth
            auth_url = "https://api.insee.fr/token"
            response = requests.post(
                auth_url,
                auth=(consumer_key, consumer_secret),
                data={'grant_type': 'client_credentials'}
            )

            if response.status_code == 200:
                return response.json().get('access_token')
            else:
                print(f"Erreur authentification: {response.status_code}")
                return None

        except FileNotFoundError:
            print("⚠️  Fichier config.json non trouvé")
            print("Créez un fichier config.json avec vos clés API:")
            print(json.dumps({
                "SIRENE_CONSUMER_KEY": "votre_consumer_key",
                "SIRENE_CONSUMER_SECRET": "votre_consumer_secret"
            }, indent=2))
            return None

    def search_sirene_entreprises(self, code_naf: str, departement: str, token: str) -> List[Dict]:
        """
        Recherche des entreprises via l'API Sirene

        Args:
            code_naf: Code NAF de l'activité
            departement: Code département (79, 17, 86)
            token: Token d'authentification

        Returns:
            Liste des entreprises trouvées
        """
        headers = {
            'Authorization': f'Bearer {token}',
            'Accept': 'application/json'
        }

        # Requête API Sirene
        url = f"{self.base_url_sirene}/siret"
        params = {
            'q': f'activitePrincipaleEtablissement:{code_naf} AND codeCommuneEtablissement:{departement}*',
            'nombre': 1000,  # Maximum par requête
            'debut': 0
        }

        try:
            response = requests.get(url, headers=headers, params=params)

            if response.status_code == 200:
                data = response.json()
                return data.get('etablissements', [])
            else:
                print(f"Erreur API Sirene: {response.status_code}")
                return []

        except Exception as e:
            print(f"Erreur lors de la requête Sirene: {e}")
            return []

    def geocode_with_ban(self, adresse: str, code_postal: str, ville: str) -> Optional[Dict[str, float]]:
        """
        Géocode une adresse avec l'API Base Adresse Nationale (BAN)
        Plus précise que Nominatim pour les adresses françaises

        Args:
            adresse: Numéro et rue
            code_postal: Code postal
            ville: Nom de la ville

        Returns:
            Dictionnaire avec lat/lon/score ou None
        """
        try:
            query = f"{adresse}, {code_postal} {ville}".strip()
            url = "https://api-adresse.data.gouv.fr/search/"
            params = {
                'q': query,
                'limit': 1
            }
            
            # Ajouter le code postal comme filtre si disponible
            if code_postal:
                params['postcode'] = code_postal

            response = requests.get(url, params=params, timeout=10)

            if response.status_code == 200:
                data = response.json()
                if data.get('features') and len(data['features']) > 0:
                    feature = data['features'][0]
                    coords = feature['geometry']['coordinates']
                    props = feature['properties']
                    
                    return {
                        'lat': coords[1],  # GeoJSON: [lon, lat]
                        'lon': coords[0],
                        'score': props.get('score', 0),
                        'label': props.get('label', ''),
                        'source': 'BAN'
                    }

            return None

        except Exception as e:
            print(f"Erreur géocodage BAN: {e}")
            return None

    def geocode_address(self, address: str, code_postal: str = "", ville: str = "") -> Optional[Dict[str, float]]:
        """
        Géocode une adresse avec l'API BAN, fallback sur Nominatim

        Args:
            address: Adresse complète ou partielle
            code_postal: Code postal (optionnel mais recommandé)
            ville: Nom de la ville (optionnel mais recommandé)

        Returns:
            Dictionnaire avec lat/lon ou None
        """
        # Essayer d'abord l'API BAN (plus précise pour la France)
        if code_postal or ville:
            ban_result = self.geocode_with_ban(address, code_postal, ville)
            if ban_result and ban_result.get('score', 0) > 0.4:
                print(f"   📍 BAN: {ban_result['label']} (score: {ban_result['score']:.2f})")
                return {'lat': ban_result['lat'], 'lon': ban_result['lon']}

        # Fallback sur Nominatim
        url = f"{self.base_url_nominatim}/search"
        full_address = f"{address}, {code_postal} {ville}, France".strip(', ')
        params = {
            'q': full_address,
            'format': 'json',
            'limit': 1,
            'countrycodes': 'fr'
        }

        headers = {
            'User-Agent': 'LyceeGrippeaux-StageApp/1.0'
        }

        try:
            response = requests.get(url, params=params, headers=headers, timeout=10)

            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    print(f"   📍 Nominatim: {data[0].get('display_name', '')[:50]}...")
                    return {
                        'lat': float(data[0]['lat']),
                        'lon': float(data[0]['lon'])
                    }

            return None

        except Exception as e:
            print(f"Erreur géocodage Nominatim: {e}")
            return None

    def format_entreprise_data(self, entreprise_sirene: Dict) -> Optional[Dict]:
        """
        Formate les données d'une entreprise Sirene au format du projet

        Args:
            entreprise_sirene: Données brutes de l'API Sirene

        Returns:
            Données formatées ou None si erreur
        """
        try:
            adresse = entreprise_sirene.get('adresseEtablissement', {})

            # Construction de l'adresse complète
            numero_voie = adresse.get('numeroVoieEtablissement', '')
            type_voie = adresse.get('typeVoieEtablissement', '')
            libelle_voie = adresse.get('libelleVoieEtablissement', '')

            adresse_complete = f"{numero_voie} {type_voie} {libelle_voie}".strip()
            code_postal = adresse.get('codePostalEtablissement', '')
            ville = adresse.get('libelleCommuneEtablissement', '')

            # Géocodage avec l'API BAN (plus précise pour la France)
            coords = self.geocode_address(adresse_complete, code_postal, ville)

            # Délai pour respecter les limites des APIs (0.3 req/sec pour être sûr)
            time.sleep(0.3)

            # Détermine le type d'établissement selon le code NAF
            code_naf = entreprise_sirene.get('activitePrincipaleEtablissement', '')
            type_mapping = {
                "56.10A": "Restauration traditionnelle",
                "56.10B": "Cafétéria / Libre-service",
                "56.10C": "Restauration rapide",
                "56.21Z": "Traiteur",
                "56.29A": "Restauration collective",
                "56.29B": "Autre restauration",
                "55.10Z": "Hôtel-restaurant"
            }
            type_etablissement = type_mapping.get(code_naf, "Restaurant")

            formatted_data = {
                "nom": entreprise_sirene.get('denominationUsuelleEtablissement') or
                       entreprise_sirene.get('denominationUniteLegale') or
                       "Établissement sans nom",
                "adresse": adresse_complete,
                "codePostal": code_postal,
                "ville": ville,
                "type": type_etablissement,
                "niveau": "",  # À compléter manuellement
                "telephone": "",  # Non disponible via Sirene
                "contact": "",  # À compléter manuellement
                "email": "",  # À compléter manuellement
                "commentaire": f"SIRET: {entreprise_sirene.get('siret', 'N/A')} - Code NAF: {code_naf}",
                "siret": entreprise_sirene.get('siret', ''),
                "codeNaf": code_naf
            }

            # Ajouter les coordonnées si géocodage réussi
            if coords:
                formatted_data['lat'] = coords['lat']
                formatted_data['lon'] = coords['lon']

            return formatted_data

        except Exception as e:
            print(f"Erreur formatage données: {e}")
            return None

    def fetch_all_restaurants(self) -> List[Dict]:
        """
        Récupère toutes les entreprises de restauration des départements cibles

        Returns:
            Liste des entreprises formatées
        """
        print("🔍 Début de la récupération des données...\n")

        # Récupération du token
        token = self.get_sirene_token()
        if not token:
            print("❌ Impossible de récupérer le token API Sirene")
            print("\n💡 SOLUTION ALTERNATIVE:")
            print("   Utilisez le mode démo sans API (données limitées)")
            return self.demo_mode()

        all_entreprises = []

        # Recherche pour chaque combinaison département/code NAF
        for departement in self.DEPARTEMENTS:
            for code_naf in self.CODES_NAF_RESTAURATION:
                print(f"📍 Recherche: Département {departement} - Code NAF {code_naf}")

                entreprises = self.search_sirene_entreprises(code_naf, departement, token)
                print(f"   → {len(entreprises)} entreprises trouvées")

                for entreprise in entreprises:
                    formatted = self.format_entreprise_data(entreprise)
                    if formatted:
                        all_entreprises.append(formatted)

                # Délai entre requêtes
                time.sleep(0.5)

        print(f"\n✅ Total: {len(all_entreprises)} entreprises récupérées")
        return all_entreprises

    def demo_mode(self) -> List[Dict]:
        """
        Mode démo sans API - Génère quelques exemples

        Returns:
            Liste d'exemples
        """
        print("\n🎯 Mode DÉMO activé (sans API)")
        print("   Génération de données d'exemple basées sur des villes types\n")

        villes_exemples = [
            ("79000", "Niort"),
            ("79200", "Parthenay"),
            ("86000", "Poitiers"),
            ("17000", "La Rochelle"),
            ("79400", "St Maixent l'Ecole")
        ]

        demo_data = []
        for cp, ville in villes_exemples:
            demo_data.append({
                "nom": f"Restaurant Exemple - {ville}",
                "adresse": "Adresse à compléter",
                "codePostal": cp,
                "ville": ville,
                "type": "Restauration traditionnelle",
                "niveau": "",
                "telephone": "",
                "contact": "À compléter",
                "email": "",
                "commentaire": "Donnée générée en mode démo - À vérifier"
            })

        return demo_data

    def save_to_json(self, data: List[Dict], filename: str = "nouveaux_stages.json"):
        """
        Sauvegarde les données en JSON

        Args:
            data: Données à sauvegarder
            filename: Nom du fichier de sortie
        """
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"\n💾 Données sauvegardées dans: {filename}")

    def save_to_csv(self, data: List[Dict], filename: str = "nouveaux_stages.csv"):
        """
        Sauvegarde les données en CSV

        Args:
            data: Données à sauvegarder
            filename: Nom du fichier de sortie
        """
        if not data:
            print("Aucune donnée à sauvegarder")
            return

        keys = data[0].keys()

        with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(data)

        print(f"💾 Données sauvegardées dans: {filename}")

    def merge_with_existing_data(self, new_data: List[Dict], existing_file: str = "data.json") -> List[Dict]:
        """
        Fusionne les nouvelles données avec les données existantes

        Args:
            new_data: Nouvelles données
            existing_file: Fichier de données existantes

        Returns:
            Données fusionnées
        """
        try:
            with open(existing_file, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except FileNotFoundError:
            print(f"⚠️  Fichier {existing_file} non trouvé, création d'un nouveau fichier")
            existing_data = []

        # Éviter les doublons basés sur SIRET ou nom+ville
        existing_sirets = {item.get('siret') for item in existing_data if item.get('siret')}
        existing_keys = {(item['nom'], item['ville']) for item in existing_data}

        merged_data = existing_data.copy()
        nouvelles = 0

        for item in new_data:
            siret = item.get('siret')
            key = (item['nom'], item['ville'])

            if siret and siret in existing_sirets:
                continue
            if key in existing_keys:
                continue

            merged_data.append(item)
            nouvelles += 1

        print(f"\n📊 Fusion:")
        print(f"   - Données existantes: {len(existing_data)}")
        print(f"   - Nouvelles données: {nouvelles}")
        print(f"   - Total: {len(merged_data)}")

        return merged_data


def main():
    """Fonction principale"""
    print("=" * 70)
    print("  RÉCUPÉRATION AUTOMATIQUE DES LIEUX DE STAGE")
    print("  Lycée Les Grippeaux - Hôtellerie Restauration")
    print("=" * 70)
    print()

    fetcher = StageDataFetcher()

    # Récupération des données
    new_data = fetcher.fetch_all_restaurants()

    if not new_data:
        print("\n❌ Aucune donnée récupérée")
        return

    # Sauvegarde
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    print("\n📁 Sauvegarde des données...")
    fetcher.save_to_json(new_data, f"nouveaux_stages_{timestamp}.json")
    fetcher.save_to_csv(new_data, f"nouveaux_stages_{timestamp}.csv")

    # Option de fusion
    print("\n🔗 Voulez-vous fusionner avec les données existantes (data.json)? (o/n)")
    reponse = input("> ").strip().lower()

    if reponse == 'o':
        merged = fetcher.merge_with_existing_data(new_data)
        fetcher.save_to_json(merged, "data.json")
        print("\n✅ Fusion terminée!")

    print("\n" + "=" * 70)
    print("  TRAITEMENT TERMINÉ")
    print("=" * 70)
    print("\n⚠️  IMPORTANT:")
    print("   Les données récupérées sont INCOMPLÈTES.")
    print("   Vous devez compléter manuellement:")
    print("   - Niveau de compétences (1-5)")
    print("   - Téléphone")
    print("   - Contact (nom + fonction)")
    print("   - Email")
    print("\n💡 Ouvrez le fichier CSV dans Excel pour compléter facilement!")
    print()


if __name__ == "__main__":
    main()
