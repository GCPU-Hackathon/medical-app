#!/bin/sh
set -e

git config --global --add safe.directory /var/www || true

mkdir -p vendor storage/logs storage/framework/{cache,sessions,views} bootstrap/cache || true

if [ ! -d vendor ]; then
  echo "Vendor directory not found. Installing Composer dependencies..."
  composer install --no-interaction --prefer-dist || true
  cp .env.example .env || true
  php artisan key:generate || true
  php artisan migrate --force || true
  php artisan db:seed || true
fi

# Create storage link for public access
echo "Creating storage link..."
php artisan storage:link

supervisord -c /etc/supervisor/conf.d/supervisord.conf

php artisan horizon

exec "$@"