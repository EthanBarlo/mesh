import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { draftingDark, draftingLight } from './src/lib/shiki-themes';

const run = promisify(execFile);

// Last commit date for a docs file. Fails soft: the Docker image builds on
// Alpine without git (and without .git), where the title block just shows "—".
async function gitLastModified(filePath: string): Promise<Date | null> {
  try {
    const { stdout } = await run('git', ['log', '-1', '--format=%aI', '--', filePath]);
    const iso = stdout.trim();
    return iso ? new Date(iso) : null;
  } catch {
    return null;
  }
}

// You can customize Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  // The Markdown content lives in the package-level `docs/` directory, kept
  // separate from this Next.js app. Path is relative to this config file.
  dir: '../../docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  // "Updated" in each page's title block.
  plugins: [lastModified({ versionControl: gitLastModified })],
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: draftingLight,
        dark: draftingDark,
      },
    },
  },
});
