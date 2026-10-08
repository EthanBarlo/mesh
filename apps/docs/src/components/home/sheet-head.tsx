import type { ReactNode } from 'react';
import { pad2, sheetById, sheetCount } from './sheets';

/** A numbered sheet head with the ticked rule that draws in on scroll. */
export function SheetHead({ id, meta }: { id: string; meta: ReactNode }) {
  const sheet = sheetById(id);
  return (
    <header className="sheet-head" data-inview="">
      <p className="sheet-head__no">
        Sheet {pad2(sheet.no)} / {pad2(sheetCount)}
      </p>
      <h2 className="sheet-head__title" id={`${id}-title`}>
        {sheet.title}
      </h2>
      <p className="sheet-head__meta">{meta}</p>
      <span className="sheet-head__rule" aria-hidden="true" />
    </header>
  );
}

/** A sheet section wired into the frame's scroll-spy. */
export function Sheet({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const sheet = sheetById(id);
  return (
    <section
      id={id}
      className={className ? `sheet ${className}` : 'sheet'}
      data-sheet={sheet.no}
      aria-labelledby={`${id}-title`}
    >
      <div className="wrap">{children}</div>
    </section>
  );
}
