# Mesh demo (Laravel + Livewire + Svelte)

A small Laravel 12 / Livewire 4 app that demonstrates the Mesh package end-to-end:
a Livewire `Counter` whose view is a Svelte component mounted by Mesh. It mirrors
`apps/demo-react` page-for-page, using the `@mesh/svelte` renderer and helpers.

It consumes the Mesh package straight from the repo root via a Composer **path
repository** (`composer.json` → `repositories: [{ type: path, url: "../../" }]`),
which symlinks `vendor/ethanbarlo/mesh` to the repo root. Vite's `@mesh` alias and
Laravel's `MeshServiceProvider` both resolve through that symlink.

## Local development

```bash
composer install
npm install
cp .env.example .env && php artisan key:generate
composer dev   # serves Laravel (:8020) + queue + logs + Vite together
```

The dev server uses port `8020` so it can run side by side with `apps/demo-react`
on `:8000` and `apps/demo-vue` on `:8010`.

## Deploying

The app ships as a self-contained Docker image (`Dockerfile` in this folder) built
on [FrankenPHP](https://frankenphp.dev) (classic `php_server` mode, serving `:8000`).
It is **stateless** — file-based sessions/cache and `sync` queue, so no database,
migrations, or volumes are required.

The important detail: because the app reads Mesh through a symlink to the repo root,
**the Docker build context must be the repo root**, even though the `Dockerfile`
lives here in `apps/demo-svelte/`. The repo root must also be present at runtime
(Laravel loads Mesh's ServiceProvider through the symlink), so the image keeps the
whole monorepo tree and all `COPY` paths in the `Dockerfile` are relative to the
repo root.

Build and run locally (from the repo root):

```bash
docker build -f apps/demo-svelte/Dockerfile -t mesh-demo-svelte .
docker run --rm \
  -e APP_KEY=base64:$(openssl rand -base64 32) \
  -e APP_URL=http://localhost:8000 \
  -p 8000:8000 mesh-demo-svelte
```

### Coolify

Create a new Application from the Git repository and set:

| Setting             | Value                          |
| ------------------- | ------------------------------ |
| Build Pack          | `Dockerfile`                   |
| Base Directory      | `/`                            |
| Dockerfile Location | `/apps/demo-svelte/Dockerfile` |
| Port                | `8000`                         |

`Base Directory = /` is the build context (so the repo-root files the symlink needs
are reachable); `Dockerfile Location` just points at the file. Setting Base Directory
to `/apps/demo-svelte` shrinks the context and the build breaks.

Environment variables (set in Coolify; `APP_KEY` as a secret). The image already
bakes the stateless defaults (`APP_ENV=production`, `APP_DEBUG=false`,
`LOG_CHANNEL=stderr`, `SESSION_DRIVER=file`, `CACHE_STORE=file`,
`QUEUE_CONNECTION=sync`), so the only ones you must provide are:

```
APP_KEY=base64:...        # generate once: php artisan key:generate --show
APP_URL=https://<your-domain>
```

Optionally set Watch Paths to `apps/demo-svelte/**`, `src/**`, and `resources/**` so
only relevant changes trigger a redeploy.
