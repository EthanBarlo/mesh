import { getPageImage, getPageMarkdownUrl, source } from '@/lib/source';
import {
  DocsBody,
  DocsPage,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { docsContentDir, gitConfig, packageVersion } from '@/lib/shared';
import { getSheetInfo, pad2 } from '@/lib/sheet';
import { TitleBlock } from '@/components/drafting/title-block';

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const sheet = getSheetInfo(page.url);
  const sourcePath = `${docsContentDir}/${page.path}`;
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/${sourcePath}`;
  const lastModified = page.data.lastModified
    ? new Date(page.data.lastModified)
    : null;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      // The sheet header already says where you are.
      breadcrumb={{ enabled: false }}
    >
      <header className="sheet-head mb-2">
        <p className="sheet-head__no k k--caps">
          Sheet {pad2(sheet.number)} / {pad2(sheet.total)}
          {sheet.section ? ` · ${sheet.section}` : null}
        </p>
        <h1 className="sheet-head__title">{page.data.title}</h1>
        <p className="sheet-head__meta k k--caps">
          {sheet.drawingNo}
          <br />
          Rev {packageVersion}
        </p>
        <span className="sheet-head__rule" aria-hidden="true" />
      </header>
      {page.data.description ? (
        <p className="max-w-[44rem] text-lg leading-relaxed text-ink-2 text-pretty">
          {page.data.description}
        </p>
      ) : null}
      <div className="flex flex-row flex-wrap gap-2 items-center pb-2">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      <TitleBlock
        className="mt-12"
        label="Title block"
        title={page.data.title}
        rows={[
          [
            { label: 'Section', value: sheet.section ?? 'Mesh', span: 'half' },
            { label: 'Package', value: 'ethanbarlo/mesh', span: 'half' },
          ],
          [
            { label: 'Dwg no.', value: sheet.drawingNo },
            {
              label: 'Sheet',
              value: `${pad2(sheet.number)} of ${pad2(sheet.total)}`,
            },
            { label: 'Rev', value: packageVersion },
            {
              label: 'Updated',
              value: lastModified ? (
                <time dateTime={lastModified.toISOString()}>
                  {formatDate(lastModified)}
                </time>
              ) : (
                '—'
              ),
            },
            { label: 'Format', value: 'MDX' },
            {
              label: 'Source',
              value: (
                <a href={githubUrl} target="_blank" rel="noreferrer noopener">
                  Edit ↗
                </a>
              ),
            },
          ],
        ]}
      />
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
