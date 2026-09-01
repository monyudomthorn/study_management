#!/bin/sh
set -e

echo "Starting Study Management Backend..."

# Wait for database connection if configured
if [ -n "$DB_HOST" ]; then
    echo "Checking database connection to $DB_HOST:$DB_PORT..."
fi

# Run database migrations and seeds in production
php artisan config:clear || true
php artisan migrate --force || true
php artisan db:seed --force || true

# Optimize cache for production
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "Starting PHP-FPM and Nginx..."
php-fpm -D
nginx -g "daemon off;"
