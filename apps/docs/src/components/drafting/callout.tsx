import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CalloutType = 'info' | 'warn' | 'warning' | 'error' | 'success' | 'idea';

const variants = {
  info: { label: 'Note', tone: 'ink' },
  warn: { label: 'Caution', tone: 'accent' },
  error: { label: 'Do not', tone: 'accent' },
  idea: { label: 'Tip', tone: 'blue' },
} as const;

type Variant = keyof typeof variants;

function resolve(type: CalloutType | undefined): Variant {
  if (type === 'warning') return 'warn';
  if (type === 'success') return 'idea';
  return type ?? 'info';
}

function Mark({ variant }: { variant: Variant }) {
  if (variant === 'warn' || variant === 'error') {
    return (
      <svg viewBox="0 0 28 26" width="22" height="20" aria-hidden="true">
        <path
          d="M14 2 26 24H2Z"
          fill={variant === 'error' ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <text
          x="14"
          y="20"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="11"
          fill={variant === 'error' ? 'var(--paper)' : 'currentColor'}
        >
          !
        </text>
      </svg>
    );
  }

  if (variant === 'idea') {
    return (
      <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden="true">
        <circle cx="11" cy="11" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <path d="M11 6.5v9M6.5 11h9" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden="true">
      <rect x="1.5" y="1.5" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <path d="M11 9.5v7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="6.25" r="1.1" fill="currentColor" />
    </svg>
  );
}

/**
 * Drop-in replacement for Fumadocs' `<Callout>`, drawn as a note on the sheet:
 * a mark (box, triangle, circle), a mono label, and the body.
 */
export function Callout({
  type,
  title,
  children,
  className,
}: {
  type?: CalloutType;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const variant = resolve(type);
  const { label, tone } = variants[variant];

  return (
    <aside
      className={cn('note not-prose', className)}
      data-tone={tone}
      data-variant={variant}
    >
      <span className="note__mark">
        <Mark variant={variant} />
      </span>
      <div className="note__body">
        <p className="note__k k k--caps">
          {label}
          {title ? <span className="note__title">{title}</span> : null}
        </p>
        <div className="note__content prose">{children}</div>
      </div>
    </aside>
  );
}
