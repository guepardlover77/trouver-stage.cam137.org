#!/bin/sh
set -e

echo "=== Carte Stages API - Démarrage ==="

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
    php artisan key:generate --force
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
