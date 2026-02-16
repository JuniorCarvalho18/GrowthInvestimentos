FROM php:8.1-apache

# Instala dependências do sistema e habilita as extensões pdo e pdo_pgsql
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo pdo_pgsql pgsql

# Habilita o mod_rewrite do Apache
RUN a2enmod rewrite

# Copia a pasta apiPortal para o diretório padrão do Apache
COPY apiPortal/ /var/www/html/apiPortal/

# Define as permissões para o usuário do Apache
RUN chown -R www-data:www-data /var/www/html