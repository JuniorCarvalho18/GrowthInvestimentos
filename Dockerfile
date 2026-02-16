FROM php:8.1-apache

# Instala dependências do sistema e bibliotecas do PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo pdo_pgsql pgsql

# Habilita explicitamente os módulos no PHP
RUN docker-php-ext-enable pdo_pgsql pgsql

# Habilita o mod_rewrite do Apache
RUN a2enmod rewrite

# Copia a pasta apiPortal
COPY apiPortal/ /var/www/html/apiPortal/

# Define as permissões
RUN chown -R www-data:www-data /var/www/html