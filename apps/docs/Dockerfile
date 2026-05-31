# syntax=docker/dockerfile:1
#
# Docs site (Fumadocs / Next.js) container image.
#
# IMPORTANT: the build context must be the REPO ROOT, not apps/docs. The site
# reads its Markdown from the repo-root `docs/` directory (see
# apps/docs/source.config.ts -> dir: '../../docs'), and Docker cannot COPY
# files from outside the build context. In Coolify set:
#   Build Pack         = Dockerfile
#   Base Directory     = /
#   Dockerfile Location = /apps/docs/Dockerfile
#
# All COPY paths below are therefore relative to the repo root.

FROM node:22-alpine AS base
WORKDIR /app

# ---- deps: install node_modules, cached on the lockfile ----
FROM base AS deps
COPY apps/docs/package.json apps/docs/package-lock.json ./apps/docs/
# --ignore-scripts: the postinstall (`fumadocs-mdx`) needs source.config.ts and
# the docs content, which aren't present yet. The Next plugin regenerates the
# .source map during `next build`, so skipping it here is safe.
RUN cd apps/docs && npm ci --ignore-scripts

# ---- build: compile the Next standalone output ----
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/apps/docs/node_modules ./apps/docs/node_modules
COPY docs ./docs
COPY apps/docs ./apps/docs
RUN cd apps/docs && npm run build

# ---- runner: minimal runtime with just the standalone server ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Standalone bundle (server.js + traced node_modules) and the static assets,
# which standalone output does not include.
COPY --from=build --chown=nextjs:nodejs /app/apps/docs/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/docs/.next/static ./apps/docs/.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "apps/docs/server.js"]
