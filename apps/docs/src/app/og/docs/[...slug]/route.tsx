import { getPageImage, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { DraftingCard, loadOgFonts } from '@/lib/og';
import { getSheetInfo, pad2 } from '@/lib/sheet';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/og/docs/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const sheet = getSheetInfo(page.url);

  return new ImageResponse(
    <DraftingCard
      kicker={`Sheet ${pad2(sheet.number)} / ${pad2(sheet.total)}${sheet.section ? ` · ${sheet.section}` : ''}`}
      title={page.data.title}
      description={page.data.description}
      drawingNo={sheet.drawingNo}
      sheet={`${pad2(sheet.number)} of ${pad2(sheet.total)}`}
    />,
    {
      width: 1200,
      height: 630,
      fonts: await loadOgFonts(),
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
