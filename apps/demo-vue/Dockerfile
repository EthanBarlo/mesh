# syntax=docker/dockerfile:1
#
# Mesh Vue demo (Laravel 12 + Livewire 4 + Vite) container image.
#
# IMPORTANT: the build context must be the REPO ROOT, not apps/demo-vue. The app
# pulls in the Mesh package through a Composer *path repository* symlinked to the
# repo root (composer.json -> repositories: [{ type: path, url: "../../" }]), which
# creates apps/demo-vue/vendor/ethanbarlo/mesh -> ../../../.. (the repo root).
# Vite's "@mesh" alias and Laravel's MeshServiceProvider both resolve through that
# symlink, so the repo root must be present at build AND run time. In Coolify set:
#   Build Pack          = Dockerfile
#   Base Directory      = /
#   Dockerfile Location = /apps/demo-vue/Dockerfile
#   Port                = 8000
#
# All COPY paths below are relative to the repo root. The whole /app tree is copied
# between stages so the relative mesh symlink stays valid.

# ---- vendor: PHP dependencies (creates the mesh symlink + livewire under vendor) ----
FROM composer:2 AS vendor
WORKDIR /app
COPY . .
WORKDIR /app/apps/demo-vue
# --no-scripts: artisan package:discover would run before the runtime env exists;
# it is re-run in the final stage instead.
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# ---- frontend: build the Vite assets into public/build ----
FROM node:22 AS frontend
WORKDIR /app
COPY . .
# Bring in the composer vendor so the "@mesh" symlink resolves to /app/resources/js
# and resources/js/app.ts can import livewire.esm from vendor/livewire.
COPY --from=vendor /app/apps/demo-vue/vendor ./apps/demo-vue/vendor
WORKDIR /app/apps/demo-vue
RUN npm ci && npm run build

# ---- app: FrankenPHP runtime serving apps/demo-vue/public ----
FROM dunglas/frankenphp:php8.4 AS app

# Plain HTTP on :8000 (no auto-TLS); sensible stateless production defaults so the
# only env vars that MUST be set in Coolify are APP_KEY and APP_URL.
ENV SERVER_NAME=:8000 \
    APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    SESSION_DRIVER=file \
    CACHE_STORE=file \
    QUEUE_CONNECTION=sync

COPY apps/demo-vue/docker/Caddyfile /etc/frankenphp/Caddyfile

# Full monorepo + vendor (root src/, config/, resources/ that the symlink targets),
# then the freshly built Vite assets.
COPY --from=vendor /app /app
COPY --from=frontend /app/apps/demo-vue/public/build /app/apps/demo-vue/public/build

WORKDIR /app/apps/demo-vue
# Drop any stale compiled caches, regenerate the package manifest against the
# installed (prod-only) packages, and make runtime-writable dirs writable.
RUN rm -f bootstrap/cache/*.php \
 && php artisan package:discover --ansi \
 && chmod -R a+rwX storage bootstrap/cache

EXPOSE 8000
# Inherit the dunglas/frankenphp entrypoint + CMD (runs `frankenphp run` against the
# Caddyfile copied above).
