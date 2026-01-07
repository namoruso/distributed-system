#!/bin/bash

set -e

echo "🚀 Starting Products Service..."

# Esperar a que PostgreSQL esté listo
echo "⏳ Waiting for PostgreSQL to be ready..."
until php artisan db:show 2>/dev/null; do
  echo "  PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Ejecutar migraciones
echo "🔄 Running database migrations..."
php artisan migrate --force

echo "✅ Migrations completed!"

# Crear symlink de storage para que las imágenes sean accesibles
echo "🔗 Creating storage symlink..."
php artisan storage:link --force

echo "✅ Storage linked!"

echo "🎉 Products Service is ready!"

# Ejecutar PHP-FPM
exec php-fpm
