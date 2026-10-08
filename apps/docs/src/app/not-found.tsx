import Link from 'next/link';
import { Brand } from '@/lib/layout.shared';

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <Link href="/" className="inline-flex mb-10" aria-label="Mesh home">
          <Brand />
        </Link>
        <header className="sheet-head">
          <p className="sheet-head__no k k--caps">Sheet — / — · Not in this set</p>
          <h1 className="sheet-head__title">Sheet not found</h1>
          <p className="sheet-head__meta k k--caps">
            MESH-404
            <br />
            Rev —
          </p>
          <span className="sheet-head__rule" aria-hidden="true" />
        </header>
        <p className="mt-6 text-lg leading-relaxed text-ink-2">
          This drawing isn&apos;t in the register. It may have moved when the docs were redrawn.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/docs" className="btn btn--solid">
            Open the docs
          </Link>
          <Link href="/" className="btn btn--line">
            Title sheet
          </Link>
        </div>
      </div>
    </main>
  );
}
