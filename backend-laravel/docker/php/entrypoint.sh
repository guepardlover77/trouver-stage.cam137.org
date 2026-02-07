#!/bin/sh
set -e

echo "=== Carte Stages API - Démarrage ==="

# Attendre que PostgreSQL soit prêt
echo "Attente de PostgreSQL..."
until php artisan db:monitor --databases=pgsql > /dev/null 2>&1; do
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
