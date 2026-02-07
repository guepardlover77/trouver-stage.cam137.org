#!/bin/sh
set -e

echo "=== Carte Stages API - Démarrage ==="

# Installer les dépendances si vendor/ est absent (volume monté par-dessus l'image)
if [ ! -f vendor/autoload.php ]; then
    echo "Installation des dépendances Composer..."
    composer install --no-dev --optimize-autoloader --no-interaction
fi

# Créer les répertoires nécessaires
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# Attendre que PostgreSQL soit prêt
echo "Attente de PostgreSQL..."
until php -r "try { new PDO('pgsql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT') . ';dbname=' . getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); echo 'ok'; } catch(Exception \$e) { exit(1); }" 2>/dev/null; do
    echo "  PostgreSQL pas encore prêt, nouvelle tentative dans 2s..."
    sleep 2
done
echo "PostgreSQL prêt."

# Générer APP_KEY si absent
if [ -z "$APP_KEY" ]; then
    echo "Génération de APP_KEY..."
    # Créer .env si absent (nécessaire pour key:generate)
    if [ ! -f .env ]; then
        echo "APP_KEY=" > .env
    fi
    php artisan key:generate --force
    # Exporter la clé générée pour le processus en cours
    export APP_KEY=$(grep '^APP_KEY=' .env | cut -d'=' -f2-)
fi

# Exécuter les migrations
echo "Exécution des migrations..."
php artisan migrate --force

# Optimiser pour la production
if [ "$APP_ENV" = "production" ]; then
    echo "Optimisation pour la production..."
    php artisan config:cache
    php artisan route:cache
fi

echo "=== Démarrage de PHP-FPM ==="
exec php-fpm
