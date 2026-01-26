# Carte Interactive des Lieux de Stage

Application web interactive pour visualiser et gérer les lieux de stage en Hôtellerie-Restauration du Lycée Professionnel Les Grippeaux.

## Fonctionnalités

### Carte Interactive
- Visualisation OpenStreetMap avec marqueurs pour chaque lieu de stage
- Clustering intelligent des marqueurs
- Popups détaillés avec toutes les informations
- Heatmap de densité des lieux de stage

### Filtres et Recherche
- Filtre par domaine professionnel (Traditionnel, Brasserie, Gastro, etc.)
- Filtre par niveau de compétences (1 à 5)
- Recherche en temps réel par ville ou nom d'entreprise
- Autocomplétion des résultats

### Export des Données
- CSV : pour Excel ou Google Sheets
- JSON : pour traitement automatisé
- PDF : pour impression et archivage
- Excel (.xlsx) : format natif Excel

### Panneau d'Administration
- Authentification sécurisée par code d'accès
- Ajouter/Modifier/Supprimer des lieux de stage
- **Recherche INSEE** : trouver des entreprises via la base officielle française
- Import Excel/CSV avec mapping intelligent des colonnes
- Géocodage automatique des adresses
- Autocomplétion d'adresse avec coordonnées GPS automatiques

### PWA (Progressive Web App)
- Fonctionne hors ligne
- Installable sur mobile et desktop
- Cache intelligent des tuiles de carte

## Installation

### Prérequis
- Docker et Docker Compose
- Node.js 20+ (pour le développement)

### Déploiement avec Docker (Recommandé)

```bash
# Cloner le projet
git clone https://github.com/guepardlover77/trouver-stage.cam137.org.git
cd trouver-stage.cam137.org

# Configurer l'environnement (optionnel)
cp .env.example .env
# Modifier les variables si nécessaire

# Lancer l'application
docker compose up -d --build
```

L'application est accessible sur http://localhost:8080

### Développement local

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez http://localhost:3000

### Build de production

```bash
npm run build
```

Les fichiers sont générés dans `dist/`.

## Structure du Projet

```
├── backend/                # API Node.js (Express + PostgreSQL)
│   ├── src/
│   │   ├── index.ts       # Point d'entrée de l'API
│   │   ├── routes/        # Routes API REST
│   │   └── services/      # Services métier
│   ├── Dockerfile
│   └── package.json
│
├── src/                    # Frontend TypeScript
│   ├── main.ts            # Point d'entrée
│   ├── types/             # Définitions TypeScript
│   ├── store/             # État global réactif
│   ├── services/          # Services (données, export, géocodage, INSEE)
│   ├── components/        # Composants UI
│   │   ├── Map/           # Carte Leaflet
│   │   ├── Sidebar/       # Barre latérale et filtres
│   │   ├── Admin/         # Panneau d'administration
│   │   └── UI/            # Composants UI (Toast, Theme)
│   ├── styles/            # Styles CSS
│   └── utils/             # Utilitaires
│
├── nginx/                  # Configuration Nginx (reverse proxy)
├── dist/                   # Build de production
├── data.json              # Données des lieux de stage
│
├── docker-compose.yml     # Orchestration des services
├── Dockerfile             # Build frontend (Nginx)
├── vite.config.ts         # Configuration Vite
├── tsconfig.json          # Configuration TypeScript
└── package.json           # Dépendances npm
```

## Architecture

| Composant | Description |
|-----------|-------------|
| **Frontend** | TypeScript + Vite, servi par Nginx |
| **API** | Node.js + Express + TypeScript |
| **Base de données** | PostgreSQL 16 |
| **Reverse Proxy** | Nginx |

### Services Docker

| Service | Port | Description |
|---------|------|-------------|
| `nginx` | 8080 | Frontend + reverse proxy |
| `api` | 3004 | API REST |
| `postgres` | - | Base de données (interne) |

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine (voir `.env.example`) :

```env
# Base de données
DB_NAME=carte_stages
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Administration
ADMIN_CODE=your_admin_code

# Ports
HTTP_PORT=8080
API_PORT=3004
```

## Format des Données

Structure d'un lieu de stage :

```json
{
  "nom": "Nom de l'entreprise",
  "adresse": "123 Rue Exemple",
  "codePostal": "79000",
  "ville": "Niort",
  "type": "Restauration traditionnelle",
  "niveau": "2",
  "telephone": "05 49 XX XX XX",
  "contact": "M. Dupont - Chef",
  "email": "contact@exemple.fr",
  "commentaire": "Notes additionnelles",
  "lat": 46.323716,
  "lon": -0.464777
}
```

## API Utilisées

| API | Utilisation |
|-----|-------------|
| [API BAN](https://adresse.data.gouv.fr/api-doc/adresse) | Géocodage des adresses françaises |
| [API Recherche Entreprises](https://recherche-entreprises.api.gouv.fr/) | Recherche INSEE des entreprises |
| [OpenStreetMap](https://www.openstreetmap.org/) | Fond de carte |

## Développement

### Commandes utiles

```bash
# Développement frontend
npm run dev

# Build de production
npm run build

# Lancer les conteneurs Docker
docker compose up -d --build

# Voir les logs
docker compose logs -f

# Arrêter les conteneurs
docker compose down
```

### Structure du code TypeScript

- `types/` : Interfaces TypeScript (Location, Filters, AppState)
- `store/` : État global réactif avec système de souscription
- `services/` : Logique métier (données, export, géocodage, INSEE)
- `components/` : Composants UI modulaires
- `utils/` : Fonctions utilitaires partagées

## Licence

Projet développé pour le Lycée Professionnel Les Grippeaux.
Utilisation libre pour l'établissement et ses partenaires.

## Technologies

- **Frontend** : TypeScript, Vite, Leaflet.js
- **Backend** : Node.js, Express, PostgreSQL
- **Infrastructure** : Docker, Nginx
- **Cartes** : OpenStreetMap, Leaflet.markercluster, Leaflet.heat
- **Export** : jsPDF, xlsx
- **PWA** : Workbox, vite-plugin-pwa
