#!/bin/bash
set -e

echo "Starting Laravel Docker Container as user: $(whoami)"

# Ensure we're in the correct directory
cd /var/www

# Wait for dependencies to be available
echo "Waiting for dependencies..."
sleep 2

# Create storage directories if they don't exist
mkdir -p storage/logs storage/framework/{cache,sessions,views} bootstrap/cache

# Set proper permissions for Laravel directories
chmod -R 775 storage bootstrap/cache
chown -R core:core storage bootstrap/cache

# Only run initial setup if vendor directory doesn't exist
if [ ! -d "vendor" ]; then
    echo "First time setup - installing dependencies..."
    
    # Install Composer dependencies
    composer install --no-interaction --prefer-dist --optimize-autoloader
    
    # Install NPM dependencies
    npm install
    
    # Copy environment file if it doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo "Created .env file from .env.example"
    fi
    
    # Generate application key if not set
    if ! grep -q "APP_KEY=base64:" .env; then
        php artisan key:generate --force
        echo "Generated new application key"
    fi
    
    # Run migrations if database is configured
    if php artisan migrate:status >/dev/null 2>&1; then
        php artisan migrate --force
        echo "Database migrations completed"
    else
        echo "Skipping migrations - database not configured or not available"
    fi
fi

# Create storage link if it doesn't exist
php artisan storage:link || echo "Storage link already exists or failed"

# Check environment for Vite server decision
# Safely get APP_ENV from Laravel without modifying shell environment
LARAVEL_APP_ENV=$(php -r "
    if (file_exists('.env')) {
        \$lines = file('.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach (\$lines as \$line) {
            if (strpos(\$line, 'APP_ENV=') === 0 && strpos(\$line, '#') !== 0) {
                echo trim(substr(\$line, 8));
                break;
            }
        }
    }
")

echo "Detected APP_ENV: '${LARAVEL_APP_ENV}'"

# Start Vite dev server in background for local development only
if [ "${LARAVEL_APP_ENV}" != "production" ]; then
    echo "Development environment detected - starting Vite dev server..."
    cd /var/www && npm run dev &
    echo "Vite dev server started in background"
else
    echo "Production environment - Vite dev server not started"
fi
# Clear Laravel caches (always run this)
echo "Clearing Laravel caches..."
php artisan config:clear || echo "Config cache clear failed"
php artisan route:clear || echo "Route cache clear failed"
php artisan view:clear || echo "View cache clear failed"
php artisan cache:clear || echo "Application cache clear failed"

# Optimize for production if APP_ENV is production
if [ "${LARAVEL_APP_ENV}" = "production" ]; then
    echo "Production environment detected - optimizing..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

echo "Laravel setup completed successfully!"
echo "Starting supervisord (includes Apache, PHP-FPM, Queue Worker, and Reverb WebSocket)..."

# Execute the main command (supervisord)
exec "$@"