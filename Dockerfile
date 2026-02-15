# Usa a versão oficial do PHP 8.1 com Apache (servidor web)
FROM php:8.1-apache

# Atualiza o sistema e instala as bibliotecas necessárias para o PostgreSQL
# (libpq-dev é necessário para o driver pdo_pgsql)
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Habilita o mod_rewrite do Apache (bom para segurança e URLs amigáveis)
RUN a2enmod rewrite

# Copia a sua pasta 'apiPortal' para dentro do servidor na nuvem
COPY apiPortal/ /var/www/html/apiPortal/

# Define as permissões corretas para o Apache conseguir ler os arquivos
RUN chown -R www-data:www-data /var/www/html