# Carte Interactive des Lieux de Stage

Application web interactive pour visualiser et gérer les lieux de stage en Hôtellerie-Restauration du Lycée Professionnel Les Grippeaux.

**Version 2.0** - Application PWA moderne avec TypeScript et Vite.

## Fonctionnalités

### Carte Interactive
- Visualisation OpenStreetMap avec marqueurs pour chaque lieu de stage
- Clustering intelligent : les marqueurs se regroupent automatiquement
- Popups détaillés avec toutes les informations
- Surbrillance au survol avec le nom de la ville
- **Heatmap** : visualisation de la densité des lieux de stage
- **Zones de dessin** : filtrer par zone géographique dessinée sur la carte

### Filtres Avancés
- Filtre par domaine professionnel (Traditionnel, Brasserie, Gastro, etc.)
- Filtre par niveau de compétences (1 à 5, gère les ranges comme "2-3")
- **Filtre par distance** : rayon autour d'un point de référence
- **Filtre par favoris** : voir uniquement vos lieux favoris
- Combinaison de tous les filtres pour un ciblage précis

### Recherche
- Recherche en temps réel par ville ou nom d'entreprise
- **Autocomplétion** des résultats
- Mise à jour instantanée de la carte

### Code Couleur
- Marqueurs rouges : entreprises correspondant au domaine filtré
- Marqueurs bleus : autres entreprises
- Marqueurs avec étoile : favoris

### Export des Données
- Export CSV : pour Excel ou Google Sheets
- Export JSON : pour traitement automatisé
- Export PDF : pour impression et archivage
- **Export Excel (.xlsx)** : format natif Excel
- **QR Code** : génération de QR codes pour partage rapide

### Panneau d'Administration
- **Authentification sécurisée** par code d'accès
- **Ajouter/Modifier/Supprimer** des lieux de stage
- **Import Excel/CSV** : importer des listes depuis fichiers
- **Géocodage automatique** des adresses
- **Statistiques** du nombre de lieux, villes, types

### Fonctionnalités Utilisateur
- **Thème clair/sombre** : changement automatique ou manuel
- **Favoris** : marquer des lieux pour accès rapide
- **Notes personnelles** : ajouter des notes sur chaque lieu
- **Comparaison** : comparer plusieurs lieux côte à côte
- **PWA** : fonctionne hors ligne et installable sur mobile/desktop

### Performance
- **Liste virtuelle** : affichage fluide de milliers de résultats
- **Cache intelligent** : les tuiles de carte sont mises en cache
- **Service Worker** : fonctionnement hors ligne

## Installation et Utilisation

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Edge, Safari)
- Node.js 18+ (pour le développement avec Vite)
- Python 3.8+ (pour le script de récupération automatique)

### Version Simple (Legacy)

Pour utiliser l'application rapidement sans installation :

1. Double-cliquez sur `index.html`
2. C'est prêt ! La carte se charge automatiquement.

### Version Moderne (Vite + TypeScript)

Pour utiliser la version avec toutes les fonctionnalités PWA :

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez http://localhost:3000/index.vite.html

#### Build pour production

```bash
npm run build
```

Les fichiers de production seront dans le dossier `dist/`.

### Utilisation du Script de Récupération Automatique

Le script `auto_fetch_stages.py` permet de récupérer automatiquement des lieux de stage via l'API Sirene (INSEE).

#### Installation des dépendances
```bash
pip install requests pandas
```

#### Configuration de l'API Sirene

1. **Créer un compte sur l'API Insee**
   - Rendez-vous sur https://api.insee.fr/
   - Créez un compte gratuit
   - Créez une nouvelle application
   - Notez votre `Consumer Key` et `Consumer Secret`

2. **Configurer le fichier config.json**
   ```bash
   cp config.json.example config.json
   ```

   Éditez `config.json` et ajoutez vos clés :
   ```json
   {
     "SIRENE_CONSUMER_KEY": "votre_clé_ici",
     "SIRENE_CONSUMER_SECRET": "votre_secret_ici"
   }
   ```

#### Lancement du script

```bash
python auto_fetch_stages.py
```

Le script va :
1. Se connecter à l'API Sirene
2. Récupérer tous les restaurants des départements 79, 17, 86
3. Géocoder les adresses (obtenir lat/lon)
4. Générer des fichiers JSON et CSV
5. Proposer de fusionner avec les données existantes

⚠️ **Note importante** : Le géocodage prend environ 1 seconde par entreprise (limitation API). Pour 100 entreprises = ~2 minutes.

#### Mode Démo (sans API)

Si vous n'avez pas de clés API, le script bascule automatiquement en **mode démo** qui génère quelques exemples de données.

## Structure des Fichiers

```
projet-papa/
│
├── index.html                  # Application web (version legacy JS)
├── index.vite.html             # Application web (version moderne TS)
├── data.json                   # Données des lieux de stage
├── document.pdf                # Document source original
├── package.json                # Dépendances npm
├── vite.config.ts              # Configuration Vite
├── tsconfig.json               # Configuration TypeScript
│
├── js/                         # Version legacy (JavaScript pur)
│   ├── app.js                  # Point d'entrée principal
│   ├── data.js                 # Gestion des données
│   ├── data.json               # Données des lieux de stage
│   ├── export.js               # Export CSV/JSON/PDF
│   ├── geocoding.js            # API BAN + Nominatim
│   ├── insee.js                # Intégration API INSEE
│   ├── map.js                  # Gestion de la carte Leaflet
│   ├── ui.js                   # Interface utilisateur
│   ├── stageData.js            # Données des stages
│   └── utils.js                # Fonctions utilitaires
│
├── src/                        # Version moderne (TypeScript)
│   ├── main.ts                 # Point d'entrée
│   ├── types/                  # Définitions TypeScript
│   │   └── index.ts            # Types principaux (Location, Filters, etc.)
│   ├── store/                  # Gestion d'état réactif
│   │   ├── index.ts            # Store principal
│   │   └── reactivity.ts       # Système de réactivité
│   ├── services/               # Services métier
│   │   ├── data.service.ts     # Gestion des données
│   │   ├── export.service.ts   # Export CSV/JSON/PDF/Excel
│   │   ├── geocoding.service.ts # Géocodage (BAN + Nominatim)
│   │   ├── insee.service.ts    # API INSEE/Sirene
│   │   ├── excel-import.service.ts # Import Excel/CSV
│   │   └── storage.service.ts  # Persistance (IndexedDB)
│   ├── components/             # Composants UI
│   │   ├── Map/                # Carte Leaflet
│   │   ├── Sidebar/            # Barre latérale et filtres
│   │   ├── Admin/              # Panneau d'administration
│   │   └── UI/                 # Composants UI (Toast, Theme, etc.)
│   └── utils/                  # Utilitaires
│       ├── helpers.ts          # Fonctions utilitaires
│       ├── distance.ts         # Calcul de distances
│       └── virtualList.ts      # Liste virtuelle performante
│
├── auto_fetch_stages.py        # Script de récupération automatique
├── config.json.example         # Exemple de configuration API
├── GUIDE_DEMARRAGE_RAPIDE.md   # Guide de démarrage simplifié
│
└── README.md                   # Ce fichier
```

### Architecture TypeScript

L'application moderne est organisée en couches :

| Couche | Description |
|--------|-------------|
| `types/` | Interfaces TypeScript (Location, Filters, AppState) |
| `store/` | État global réactif avec système de souscription |
| `services/` | Logique métier (données, export, géocodage, etc.) |
| `components/` | Composants UI modulaires |
| `utils/` | Fonctions utilitaires partagées |

### Modules JavaScript (Legacy)

| Module | Description |
|--------|-------------|
| `utils.js` | Fonctions utilitaires (debounce, normalisation texte) |
| `geocoding.js` | Géocodage via API BAN et Nominatim |
| `data.js` | Chargement, filtrage et gestion des données |
| `map.js` | Gestion de la carte Leaflet et des marqueurs |
| `ui.js` | Interface utilisateur et interactions |
| `export.js` | Export des données en CSV, JSON, PDF |
| `insee.js` | Recherche d'entreprises via l'API INSEE |
| `app.js` | Coordination des modules et initialisation |

## Personnalisation

### Thème et Couleurs

L'application supporte les thèmes clair et sombre. Le thème peut être changé via le bouton dans l'interface ou s'adapte automatiquement aux préférences système.

Pour personnaliser les couleurs dans la version Vite, modifiez les variables CSS dans vos fichiers de style.

### Import de Données

L'application accepte les fichiers Excel (.xlsx) et CSV avec les colonnes suivantes :
- Nom, Adresse, Code Postal, Ville (obligatoires)
- Type, Niveau, Téléphone, Contact, Email, Commentaire (optionnels)
- Latitude, Longitude (optionnels, sinon géocodage automatique)

Le mapping des colonnes est intelligent et reconnaît de nombreuses variantes de noms de colonnes.

### Modifier les Départements de Recherche

Dans `auto_fetch_stages.py`, ligne 24 :
```python
DEPARTEMENTS = ["79", "17", "86"]  # Ajoutez vos départements
```

## Format des Données

Structure du fichier `js/data.json` :

```json
[
  {
    "nom": "Nom de l'entreprise",
    "adresse": "Adresse complète",
    "codePostal": "79000",
    "ville": "Ville",
    "type": "Type d'établissement",
    "niveau": "2",
    "telephone": "05 XX XX XX XX",
    "contact": "M./Mme NOM Prénom - Fonction",
    "email": "contact@exemple.fr",
    "commentaire": "Notes additionnelles",
    "lat": 46.123456,
    "lon": -0.123456
  }
]
```

### Gestion des Niveaux Multiples

Le système gère les ranges de niveaux :
- `"niveau": "2"` → Niveau exact
- `"niveau": "2-3"` → Accepte niveau 2 ET 3
- `"niveau": "1-2"` → Accepte niveau 1 ET 2

Lors du filtrage, si vous sélectionnez "Niveau 2", les entreprises avec "1-2", "2", "2-3" seront affichées.

## API Utilisées

| API | Utilisation | Coût | Limite |
|-----|------------|------|--------|
| **API BAN (Base Adresse Nationale)** | Géocodage précis des adresses françaises | Gratuit | Illimité |
| **API Sirene (INSEE)** | Récupération entreprises | Gratuit | 30 req/min |
| **Nominatim (OSM)** | Géocodage (fallback) | Gratuit | 1 req/sec |
| **OpenStreetMap** | Affichage carte | Gratuit | Illimité |
| **Leaflet.js** | Librairie cartographique | Gratuit | Illimité |

### API Base Adresse Nationale (BAN)

L'application utilise l'API BAN pour le géocodage des adresses. Cette API officielle du gouvernement français offre :

- **Précision supérieure** pour les adresses françaises
- **Score de confiance** pour évaluer la qualité du résultat
- **Aucune limite** de requêtes
- **Gratuit** et sans inscription

Documentation : https://adresse.data.gouv.fr/api-doc/adresse

## Sécurité et Confidentialité

- Aucune donnée n'est envoyée à un serveur externe (sauf appels API pour géocodage)
- Les emails et téléphones ne sont visibles que localement
- Le fichier `config.json` contient des clés sensibles : ne pas le partager publiquement
- Le panneau d'administration est protégé par un code d'accès
- Les données personnelles (favoris, notes) sont stockées localement dans IndexedDB

## Résolution de Problèmes

### La carte ne s'affiche pas
- Vérifiez que `data.json` est dans le même dossier que `index.html`
- Ouvrez la console du navigateur (F12) pour voir les erreurs
- Pour la version Vite, assurez-vous d'avoir exécuté `npm install`

### Le géocodage échoue
- L'API Nominatim a une limite de 1 requête/seconde
- Si trop de requêtes : attendez 1 heure ou utilisez des coordonnées pré-calculées
- L'API BAN est recommandée car sans limite

### Erreur API Sirene
- Vérifiez vos clés API dans `config.json`
- Vérifiez que votre application est bien activée sur https://api.insee.fr/

### Les marqueurs ne se clusterisent pas
- Vérifiez que la librairie `leaflet.markercluster` est bien chargée
- Ouvrez la console (F12) pour voir les erreurs

### L'import Excel ne fonctionne pas
- Vérifiez que le fichier contient une ligne d'en-tête
- Les noms de colonnes doivent correspondre aux champs attendus
- Téléchargez le template CSV depuis le panneau d'import pour voir le format attendu

## Améliorations Futures Possibles

- [ ] Intégration avec Google Places pour récupérer les avis
- [ ] Historique des stages par entreprise
- [ ] Notifications pour nouveaux lieux ajoutés
- [ ] Synchronisation cloud entre appareils
- [ ] Mode collaboratif multi-utilisateurs

## Support

Pour toute question :
- Lycée Les Grippeaux : 05 49 64 07 40
- Site web : https://www.lyceegrippeaux.fr/

Consultez également le fichier `GUIDE_DEMARRAGE_RAPIDE.md` pour une prise en main rapide.

## Licence

Projet développé pour le Lycée Professionnel Les Grippeaux.
Utilisation libre pour l'établissement et ses partenaires.

## Technologies Utilisées

- **Frontend** : TypeScript, Vite, Leaflet.js
- **Cartes** : OpenStreetMap, Leaflet, Leaflet.markercluster, Leaflet.heat, Leaflet-draw
- **Export** : jsPDF, xlsx, QRCode
- **Stockage** : IndexedDB (idb-keyval)
- **PWA** : Workbox, vite-plugin-pwa
- **Graphiques** : Chart.js
