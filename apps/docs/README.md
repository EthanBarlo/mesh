# docs

This is a Next.js application generated with
[Create Fumadocs](https://github.com/fuma-nama/fumadocs).

Run development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

## Explore

In the project, you can see:

- `lib/source.ts`: Code for content source adapter, [`loader()`](https://fumadocs.dev/docs/headless/source-api) provides the interface to access your content.
- `lib/layout.shared.tsx`: Shared options for layouts, optional but preferred to keep.

| Route                     | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `app/(home)`              | The route group for your landing page and other pages. |
| `app/docs`                | The documentation layout and pages.                    |
| `app/api/search/route.ts` | The Route Handler for search.                          |

### Fumadocs MDX

A `source.config.ts` config file has been included, you can customise different options like frontmatter schema.

Read the [Introduction](https://fumadocs.dev/docs/mdx) for further details.

## Deploying

The docs ship as a self-contained Docker image (`Dockerfile` in this folder)
built with Next.js [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output).

The one thing to get right: this app reads its Markdown from the repo-root
`docs/` directory (`source.config.ts` → `dir: '../../docs'`). Docker cannot
`COPY` files from outside the build context, so **the build context must be the
repo root**, even though the `Dockerfile` lives here in `apps/docs/`. All `COPY`
paths in the `Dockerfile` are written relative to the repo root.

Build and run locally (from the repo root):

```bash
docker build -f apps/docs/Dockerfile -t mesh-docs .
docker run --rm -p 3000:3000 mesh-docs
```

### Coolify

Create a new Application from the Git repository and set:

| Setting             | Value                   |
| ------------------- | ----------------------- |
| Build Pack          | `Dockerfile`            |
| Base Directory      | `/`                     |
| Dockerfile Location | `/apps/docs/Dockerfile` |
| Port                | `3000`                  |

`Base Directory = /` is the build context (so the root `docs/` content is
reachable); `Dockerfile Location` just points at the file. Setting Base
Directory to `/apps/docs` is the common mistake — it shrinks the context and the
build can no longer see `docs/`.

Optionally set the Watch Paths to `docs/**` and `apps/docs/**` so only changes
to the docs trigger a redeploy. The `docs/` Markdown is git-tracked, so editing
docs is a commit + push away from a redeploy.

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Fumadocs](https://fumadocs.dev) - learn about Fumadocs
