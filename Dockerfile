FROM php:8.3-fpm

ARG WWWUSER=1000
ARG WWWGROUP=1000

RUN apt-get update && apt-get install -y \
    libpq-dev postgresql-client zip unzip curl git \
    libpng-dev libonig-dev libxml2-dev libzip-dev \
    supervisor nginx \
 && docker-php-ext-install pdo pdo_pgsql pgsql mbstring exif pcntl bcmath gd zip \
 && docker-php-ext-enable pdo_pgsql pgsql \
 && apt-get clean && rm -rf /var/lib/apt/lists/*


RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

RUN pecl install redis && docker-php-ext-enable redis

RUN groupadd --force -g $WWWGROUP core \
    && useradd -u $WWWUSER -g core -m -s /bin/bash core

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure PHP-FPM to run as core user
RUN sed -i 's/^listen = 127.0.0.1:9000/listen = 0.0.0.0:9000/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/^user = www-data/user = core/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/^group = www-data/group = core/' /usr/local/etc/php-fpm.d/www.conf

# Configure nginx to run as core user on standard ports
RUN sed -i 's/user www-data;/user core;/' /etc/nginx/nginx.conf

# Create necessary directories and give core user permissions
RUN mkdir -p /var/log/supervisor \
    && mkdir -p /var/log/nginx \
    && mkdir -p /var/lib/nginx/body \
    && mkdir -p /var/lib/nginx/proxy \
    && mkdir -p /var/lib/nginx/fastcgi \
    && mkdir -p /var/lib/nginx/uwsgi \
    && mkdir -p /var/lib/nginx/scgi \
    && mkdir -p /run \
    && chown -R core:core /var/log/supervisor \
    && chown -R core:core /var/log/nginx \
    && chown -R core:core /var/lib/nginx \
    && chown -R core:core /run

# Set working directory
WORKDIR /var/www

# Copy application files
COPY --chown=core:core . .

# Fix git ownership issue for Google Cloud
RUN git config --global --add safe.directory /var/www || true

# Create Laravel directories and set permissions (if possible)
RUN mkdir -p /var/www/storage/logs \
    && mkdir -p /var/www/bootstrap/cache \
    && mkdir -p /var/www/vendor \
    && (chown -R core:core /var/www/storage || true) \
    && (chown -R core:core /var/www/bootstrap/cache || true) \
    && (chown -R core:core /var/www/vendor || true) 
    # && (chmod -R 775 /var/www/storage || true) \
    # && (chmod -R 775 /var/www/bootstrap/cache || true) \
    # && (chmod -R 775 /var/www/vendor || true)

# Copy configuration files
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx.conf /etc/nginx/sites-available/default
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && chown core:core /usr/local/bin/docker-entrypoint.sh

USER core

RUN composer install --no-interaction --prefer-dist || true
RUN npm install || true

EXPOSE 80 443 5173

ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]