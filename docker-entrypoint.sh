#!/bin/sh
set -e

echo "Starting entrypoint script..."

# Fix git ownership
git config --global --add safe.directory /var/www || true

# Create necessary directories
mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache || true

# Check if vendor/autoload.php exists, not just vendor directory
if [ ! -f vendor/autoload.php ]; then
  echo "Composer autoload not found. Installing dependencies..."
  composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader
  
  # Setup .env if it doesn't exist
  if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env || true
    php artisan key:generate || true
  fi
  
  echo "Running migrations..."
  php artisan migrate --force || true
  php artisan db:seed || true
fi

# Create storage link
echo "Creating storage link..."
php artisan storage:link || true

# Start supervisor in background
echo "Starting supervisor..."
supervisord -c /etc/supervisor/conf.d/supervisord.conf &

# Give supervisor time to start
sleep 3

# Start horizon
echo "Starting Horizon..."
exec php artisan horizon