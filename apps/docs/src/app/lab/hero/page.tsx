import type { Metadata } from 'next';
import Link from 'next/link';
import { Brand } from '@/lib/layout.shared';
import { HeroFigure as StackFigure } from '@/components/home/hero-figure';
import { HeroFigure as SectionFigure } from '@/components/hero-lab/section/hero-figure';
import { HeroFigure as SchematicFigure } from '@/components/hero-lab/schematic/hero-figure';
// Option A's styles ship with the home page.
import '../../(home)/home.css';

export const metadata: Metadata = {
  title: 'Hero lab',
  robots: { index: false, follow: false },
};

const options = [
  {
    no: 'A',
    title: 'Exploded stack',
    note: 'Isometric exploded view of the layers: island, Mesh, Livewire, Laravel. Currently on the home page.',
    Figure: StackFigure,
  },
  {
    no: 'B',
    title: 'Section A–A',
    note: 'A plan of a live page cut through the island, projected into a hatched section of the layers beneath.',
    Figure: SectionFigure,
  },
  {
    no: 'C',
    title: 'Wiring schematic',
    note: 'Livewire as a board, Mesh as a six-pin connector, the island as a chip you can swap between React, Vue and Svelte.',
    Figure: SchematicFigure,
  },
];

export default function HeroLabPage() {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-8">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" aria-label="Mesh home">
          <Brand />
        </Link>
        <Link href="/" className="link link--mono">
          Title sheet
        </Link>
      </div>

      <header className="sheet-head">
        <p className="sheet-head__no k k--caps">Lab · Fig. 1 options</p>
        <h1 className="sheet-head__title">Hero figure, three ways</h1>
        <p className="sheet-head__meta k k--caps">
          Not indexed
          <br />
          Pick or fuse
        </p>
        <span className="sheet-head__rule" aria-hidden="true" />
      </header>
      <p className="mt-6 max-w-[44rem] text-lg leading-relaxed text-ink-2">
        Three independent takes on the landing page&apos;s Fig. 1, drawn without
        seeing each other. Hover the callouts, try the controls, and switch the
        theme to compare.
      </p>

      <div className="mt-12 grid gap-x-10 gap-y-16 xl:grid-cols-2">
        {options.map(({ no, title, note, Figure }) => (
          <section key={no} className="min-w-0" aria-labelledby={`lab-${no}`}>
            <div className="mb-5 flex items-baseline gap-3 border-t border-ink pt-4">
              <span className="tag">{no}</span>
              <h2 id={`lab-${no}`} className="text-xl font-semibold tracking-tight">
                {title}
              </h2>
            </div>
            <p className="mb-6 max-w-[38rem] text-sm text-ink-2">{note}</p>
            {/* `.home` scopes option A's styles; harmless for the others. */}
            <div className="home mx-auto max-w-[620px]">
              <Figure />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
