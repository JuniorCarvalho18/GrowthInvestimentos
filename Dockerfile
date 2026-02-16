FROM php:8.1-apache

# Instala dependências do sistema e drivers do PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo pdo_pgsql pgsql

# Habilita explicitamente as extensões
RUN docker-php-ext-enable pdo_pgsql pgsql

# Habilita mod_rewrite do Apache
RUN a2enmod rewrite

# Copia a pasta da API
COPY apiPortal/ /var/www/html/apiPortal/

# Permissões para o Apache
RUN chown -R www-data:www-data /var/www/html

# Expõe a porta 80
EXPOSE 80