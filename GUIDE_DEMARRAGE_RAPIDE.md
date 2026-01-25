# 🚀 Guide de Démarrage Rapide

## Pour utiliser l'application web (5 minutes)

### Étape 1 : Ouvrir l'application
Double-cliquez sur le fichier **`index.html`**

✅ **C'est tout !** L'application se charge dans votre navigateur.

### Étape 2 : Utiliser les fonctionnalités

**Filtrer les résultats :**
- Utilisez les menus déroulants dans la barre latérale
- Les marqueurs changent de couleur automatiquement

**Rechercher :**
- Tapez un nom de ville ou d'entreprise dans la barre de recherche
- Les résultats se filtrent en temps réel

**Voir les détails :**
- Cliquez sur un marqueur
- Survolez un marqueur pour voir le nom de la ville

**Exporter les données :**
- Cliquez sur "Exporter en CSV" (pour Excel)
- Ou "Exporter en JSON" (pour traitement automatisé)
- Ou "Exporter en PDF" (pour impression)

---

## Pour récupérer automatiquement de nouveaux lieux (30 minutes)

### Étape 1 : Installer Python
Si vous n'avez pas Python :
- Téléchargez sur https://www.python.org/downloads/
- Installez avec l'option "Add Python to PATH" cochée

### Étape 2 : Installer les dépendances
Ouvrez un terminal dans le dossier du projet et exécutez :
```bash
pip install requests pandas
```

### Étape 3 : Obtenir les clés API Sirene (gratuit)

1. Allez sur https://api.insee.fr/
2. Créez un compte (gratuit)
3. Cliquez sur "Mes applications" → "Créer une application"
4. Donnez un nom : "Lycee Grippeaux Stage App"
5. Abonnez-vous à l'API "Sirene"
6. Notez votre **Consumer Key** et **Consumer Secret**

### Étape 4 : Configurer le script

1. Copiez le fichier `config.json.example` et renommez-le en `config.json`
2. Ouvrez `config.json` et remplacez :
   ```json
   {
     "SIRENE_CONSUMER_KEY": "collez_votre_consumer_key_ici",
     "SIRENE_CONSUMER_SECRET": "collez_votre_consumer_secret_ici"
   }
   ```

### Étape 5 : Lancer le script
```bash
python auto_fetch_stages.py
```

Le script va :
- Récupérer tous les restaurants des départements 79, 17, 86
- Géocoder les adresses (peut prendre plusieurs minutes)
- Créer des fichiers CSV et JSON
- Proposer de fusionner avec vos données existantes

### Étape 6 : Compléter les données

⚠️ **Important** : Les données récupérées automatiquement sont **incomplètes**.

Ouvrez le fichier CSV généré dans Excel et complétez :
- **Niveau de compétences** (1 à 5)
- **Téléphone**
- **Contact** (nom + fonction)
- **Email**

Ensuite, copiez les données dans `data.json` et rechargez l'application !

---

## Mode Démo (sans API)

Si vous ne voulez pas configurer l'API Sirene :

```bash
python auto_fetch_stages.py
```

Le script détectera l'absence de clés API et basculera automatiquement en **mode démo** avec quelques exemples de données.

---

## Problèmes courants

### ❌ "La carte ne s'affiche pas"
**Solution** : Vérifiez que `data.json` est dans le même dossier que `index.html`

### ❌ "ModuleNotFoundError: No module named 'requests'"
**Solution** : Installez les dépendances avec `pip install requests pandas`

### ❌ "Erreur 401 API Sirene"
**Solution** : Vérifiez vos clés API dans `config.json` et que votre application est activée sur https://api.insee.fr/

### ❌ "Too many requests (429)"
**Solution** : L'API Nominatim limite à 1 requête/seconde. Attendez 1 heure ou utilisez le mode démo.

---

## Astuces

💡 **Raccourci clavier** : F5 pour recharger l'application après modification de `data.json`

💡 **Développement** : Utilisez la console du navigateur (F12) pour déboguer

💡 **Partage** : Pour partager l'application, envoyez `index.html` + `data.json` (ne partagez PAS `config.json` !)

💡 **Sauvegarde** : Avant de lancer le script de récupération, faites une copie de `data.json`

---

## Besoin d'aide ?

📞 **Support** : Contactez le lycée au 05 49 64 07 40

📖 **Documentation complète** : Consultez `README.md`

---

**Bonne utilisation ! 🎉**
