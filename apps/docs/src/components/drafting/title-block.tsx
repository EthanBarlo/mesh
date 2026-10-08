import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type TitleBlockCell = {
  label: string;
  value: ReactNode;
  /** `half` spans 3 of 6 columns, `third` spans 2; default is one column, set in mono. */
  span?: 'half' | 'third';
};

/**
 * A drawing title block: a ruled grid with a double outline, the title across
 * the top (with the accent square), and labelled cells beneath.
 */
export function TitleBlock({
  title,
  titleLabel = 'Title',
  rows,
  label,
  className,
}: {
  title: ReactNode;
  titleLabel?: string;
  rows: TitleBlockCell[][];
  label?: string;
  className?: string;
}) {
  return (
    <dl className={cn('tblock not-prose', className)} aria-label={label}>
      <div className="tb tb--title">
        <dt>{titleLabel}</dt>
        <dd>{title}</dd>
      </div>
      {rows.flat().map((cell) => (
        <div
          key={cell.label}
          className={cn(
            'tb',
            cell.span === 'half' && 'tb--half',
            cell.span === 'third' && 'tb--third',
            !cell.span && 'tb--sm',
          )}
        >
          <dt>{cell.label}</dt>
          <dd>{cell.value}</dd>
        </div>
      ))}
    </dl>
  );
}
